#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const errors = [];
const warnings = [];

const pluginNamePattern = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
const EXPECTED_NAME = "memoraone";
const EXPECTED_DISPLAY_NAME = "MemoraOne";
const EXPECTED_VERSION = "0.1.0";
const EXPECTED_LICENSE = "MIT";
const EXPECTED_HOMEPAGE = "https://memoraone.com";
const EXPECTED_REPOSITORY = "https://github.com/MemoraOne/cursor-plugin";
const EXPECTED_KEYWORDS = ["memory", "mcp", "ai", "coding-agent", "cursor", "context"];
const EXPECTED_MCP_ARGS = ["-y", "@memoraone/mcp@staging"];
const EXPECTED_API_URL = "https://memora-api-staging-142288887239.us-east4.run.app";
const EXPECTED_PLUGIN = "cursor";
const EXPECTED_WORKSPACE_ROOT = "${workspaceFolder}";
const FORBIDDEN_COMPONENT_DIRS = ["rules", "skills", "agents", "commands"];
const EXPECTED_MCP_ENV_KEYS = [
  "MEMORAONE_API_URL",
  "MEMORAONE_WORKSPACE_ROOT",
  "MEMORAONE_PLUGIN",
];
const SECRET_KEY_PATTERN =
  /(token|secret|password|api[_-]?key|binding[_-]?id|credential)/i;
const ABSOLUTE_PATH_PATTERN = /(?:^|\/)(?:Users|home|tmp)\/|(?:^[A-Za-z]:\\)|(?:^\/Users\/)|(?:^\/home\/)/;

function addError(message) {
  errors.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile(filePath, context) {
  let raw;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    addError(`${context} is missing: ${filePath}`);
    return null;
  }

  if (raw.includes("\u0000")) {
    addError(`${context} contains NUL bytes: ${filePath}`);
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    addError(`${context} contains invalid JSON (${filePath}): ${error.message}`);
    return null;
  }
}

function isSafeRelativePath(value) {
  if (typeof value !== "string" || value.length === 0) {
    return false;
  }
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return true;
  }
  if (path.isAbsolute(value)) {
    return false;
  }
  const normalized = path.posix.normalize(value.replace(/\\/g, "/"));
  return !normalized.startsWith("../") && normalized !== "..";
}

function extractPathValues(value) {
  if (typeof value === "string") {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry) => extractPathValues(entry));
  }
  if (value && typeof value === "object") {
    const candidates = [];
    if (typeof value.path === "string") {
      candidates.push(value.path);
    }
    if (typeof value.file === "string") {
      candidates.push(value.file);
    }
    return candidates;
  }
  return [];
}

async function validateReferencedPath(pluginDir, fieldName, pathValue, pluginName) {
  if (pathValue.startsWith("http://") || pathValue.startsWith("https://")) {
    return;
  }
  if (!isSafeRelativePath(pathValue)) {
    addError(
      `${pluginName}: field "${fieldName}" has invalid path "${pathValue}". Use a relative path without ".." or absolute prefixes.`
    );
    return;
  }
  const resolved = path.resolve(pluginDir, pathValue);
  if (!(await pathExists(resolved))) {
    addError(`${pluginName}: field "${fieldName}" references missing path "${pathValue}".`);
  }
}

function collectStringLeaves(value, prefix = "") {
  const out = [];
  if (typeof value === "string") {
    out.push({ path: prefix || "(root)", value });
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      out.push(...collectStringLeaves(entry, `${prefix}[${index}]`));
    });
    return out;
  }
  if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      const next = prefix ? `${prefix}.${key}` : key;
      if (SECRET_KEY_PATTERN.test(key)) {
        addError(`Forbidden secret-like key "${next}". Do not ship tokens, keys, or binding IDs.`);
      }
      out.push(...collectStringLeaves(entry, next));
    }
  }
  return out;
}

function validateNoLocalSecrets(obj, context) {
  for (const { path: leafPath, value } of collectStringLeaves(obj)) {
    if (value === EXPECTED_WORKSPACE_ROOT) {
      continue;
    }
    if (ABSOLUTE_PATH_PATTERN.test(value) || path.isAbsolute(value)) {
      addError(`${context}: "${leafPath}" must not contain a local filesystem path.`);
    }
    if (value.includes("localhost") || value.includes("127.0.0.1")) {
      addError(`${context}: "${leafPath}" must not point at a local development URL.`);
    }
    if (/mrb_|mcc_|mia_|mir_/.test(value)) {
      addError(`${context}: "${leafPath}" looks like a binding or credential identifier.`);
    }
  }
}

async function main() {
  const marketplacePath = path.join(repoRoot, ".cursor-plugin", "marketplace.json");
  if (await pathExists(marketplacePath)) {
    addError(
      "This repository is a single Cursor plugin. Remove .cursor-plugin/marketplace.json (multi-plugin marketplace format)."
    );
  }

  const manifestPath = path.join(repoRoot, ".cursor-plugin", "plugin.json");
  const pluginManifest = await readJsonFile(manifestPath, "Plugin manifest");
  if (!pluginManifest) {
    summarizeAndExit();
    return;
  }

  if (typeof pluginManifest.name !== "string" || !pluginNamePattern.test(pluginManifest.name)) {
    addError('"name" in plugin.json must be lowercase and use only alphanumerics, hyphens, and periods.');
  } else if (pluginManifest.name !== EXPECTED_NAME) {
    addError(`plugin.json "name" must be "${EXPECTED_NAME}".`);
  }

  if (pluginManifest.displayName !== EXPECTED_DISPLAY_NAME) {
    addError(`plugin.json "displayName" must be "${EXPECTED_DISPLAY_NAME}".`);
  }
  if (pluginManifest.version !== EXPECTED_VERSION) {
    addError(`plugin.json "version" must be "${EXPECTED_VERSION}".`);
  }
  if (pluginManifest.license !== EXPECTED_LICENSE) {
    addError(`plugin.json "license" must be "${EXPECTED_LICENSE}".`);
  }
  if (pluginManifest.homepage !== EXPECTED_HOMEPAGE) {
    addError(`plugin.json "homepage" must be "${EXPECTED_HOMEPAGE}".`);
  }
  if (pluginManifest.repository !== EXPECTED_REPOSITORY) {
    addError(`plugin.json "repository" must be "${EXPECTED_REPOSITORY}".`);
  }
  if (
    typeof pluginManifest.description !== "string" ||
    pluginManifest.description.trim().length === 0
  ) {
    addError('plugin.json "description" is required.');
  }

  const author = pluginManifest.author;
  if (!author || typeof author !== "object") {
    addError('plugin.json "author" is required.');
  } else {
    if (author.name !== "MemoraOne") {
      addError('plugin.json "author.name" must be "MemoraOne".');
    }
    if (author.email !== "admin@memoraone.com") {
      addError('plugin.json "author.email" must be "admin@memoraone.com".');
    }
  }

  if (!Array.isArray(pluginManifest.keywords)) {
    addError('plugin.json "keywords" must be an array.');
  } else {
    for (const keyword of EXPECTED_KEYWORDS) {
      if (!pluginManifest.keywords.includes(keyword)) {
        addError(`plugin.json "keywords" must include "${keyword}".`);
      }
    }
  }

  const manifestFields = ["logo", "rules", "skills", "agents", "commands", "hooks", "mcpServers"];
  for (const field of manifestFields) {
    const values = extractPathValues(pluginManifest[field]);
    for (const value of values) {
      await validateReferencedPath(repoRoot, field, value, EXPECTED_NAME);
    }
  }

  if (typeof pluginManifest.logo !== "string" || pluginManifest.logo.length === 0) {
    addError('plugin.json "logo" is required.');
  }

  validateNoLocalSecrets(pluginManifest, "plugin.json");

  for (const dirName of FORBIDDEN_COMPONENT_DIRS) {
    const dirPath = path.join(repoRoot, dirName);
    if (await pathExists(dirPath)) {
      addError(
        `Unexpected ${dirName}/ directory. This plugin must not ship placeholder rules, skills, agents, or commands.`
      );
    }
  }

  const mcpPath = path.join(repoRoot, ".mcp.json");
  const mcp = await readJsonFile(mcpPath, "Plugin MCP config");
  if (mcp) {
    const servers = mcp.mcpServers;
    if (!servers || typeof servers !== "object" || Array.isArray(servers)) {
      addError('.mcp.json must contain an "mcpServers" object.');
    } else {
      const serverNames = Object.keys(servers);
      if (serverNames.length !== 1 || serverNames[0] !== "memoraone") {
        addError('.mcp.json must define exactly one server named "memoraone".');
      }
      const server = servers.memoraone;
      if (!server || typeof server !== "object") {
        addError(".mcp.json mcpServers.memoraone must be an object.");
      } else {
        if (server.command !== "npx") {
          addError('.mcp.json command must be "npx" (portable; do not ship a local Node/NVM path).');
        }
        if (!Array.isArray(server.args) || JSON.stringify(server.args) !== JSON.stringify(EXPECTED_MCP_ARGS)) {
          addError(
            `.mcp.json args must be ${JSON.stringify(EXPECTED_MCP_ARGS)} (staging channel for this test pass).`
          );
        }
        const env = server.env;
        if (!env || typeof env !== "object" || Array.isArray(env)) {
          addError(".mcp.json env must be an object.");
        } else {
          if (env.MEMORAONE_API_URL !== EXPECTED_API_URL) {
            addError(`.mcp.json MEMORAONE_API_URL must be "${EXPECTED_API_URL}".`);
          }
          if (env.MEMORAONE_WORKSPACE_ROOT !== EXPECTED_WORKSPACE_ROOT) {
            addError(
              `.mcp.json MEMORAONE_WORKSPACE_ROOT must be "${EXPECTED_WORKSPACE_ROOT}" so Cursor can bind the open repository.`
            );
          }
          if (env.MEMORAONE_PLUGIN !== EXPECTED_PLUGIN) {
            addError(`.mcp.json MEMORAONE_PLUGIN must be "${EXPECTED_PLUGIN}".`);
          }
          if ("MEMORAONE_API_KEY" in env) {
            addError(".mcp.json must not set MEMORAONE_API_KEY.");
          }
          const extraEnv = Object.keys(env).filter((key) => !EXPECTED_MCP_ENV_KEYS.includes(key));
          if (extraEnv.length > 0) {
            addError(`.mcp.json env has unexpected keys: ${extraEnv.join(", ")}.`);
          }
        }
      }
    }
    validateNoLocalSecrets(mcp, ".mcp.json");
  }

  const requiredFiles = [
    "README.md",
    "LICENSE",
    ".gitignore",
    ".mcp.json",
    "assets/logo.svg",
    "assets/memoraone-wordmark.svg",
  ];
  for (const relative of requiredFiles) {
    if (!(await pathExists(path.join(repoRoot, relative)))) {
      addError(`Required file is missing: ${relative}`);
    }
  }

  summarizeAndExit();
}

function summarizeAndExit() {
  if (warnings.length > 0) {
    console.log("Warnings:");
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
    console.log("");
  }

  if (errors.length > 0) {
    console.error("Validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("Validation passed.");
}

await main();
