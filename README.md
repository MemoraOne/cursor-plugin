<p align="center">
  <a href="https://memoraone.com">
    <img src="assets/memoraone-wordmark.svg" alt="MemoraOne" height="48" />
  </a>
</p>

# MemoraOne for Cursor

Persistent project memory for AI coding agents in Cursor.

MemoraOne captures decisions, code events, and project context so agents can continue work across sessions instead of starting from zero. Memory is isolated by MemoraOne project: each connected repository binds to one project, and that project’s memory is not shared with other projects.

This plugin launches the published [`@memoraone/mcp`](https://www.npmjs.com/package/@memoraone/mcp) package. It does not include a second MCP implementation.

## Install from the Cursor Marketplace

1. Open **Customize** in the Cursor sidebar.
2. Search for **MemoraOne**.
3. Select **Install** and choose a project or user scope.

Node.js must be available so Cursor can run `npx`.

Installing the plugin starts the MemoraOne MCP server. It does **not** connect a repository or grant access to project memory. A MemoraOne account and a repository connection are still required.

## If you already connected a repository

If this repository was already connected with:

```bash
npx -y @memoraone/mcp@latest connect <code>
```

you do not need to connect again.

That command writes a repository-scoped Cursor MCP config (`.cursor/mcp.json`) for the published `@memoraone/mcp@latest` package, pointed at `https://api.memoraone.com`, with `MEMORAONE_IDE_TYPE=cursor` and a workspace hint for this repo. Cursor uses that config so each window can bind the correct MemoraOne project. Installing this plugin does not replace that binding or mix memory across projects.

Fully quit Cursor and reopen the repository if MCP tools do not appear after install.

## New accounts and first-time repository connection

1. Create a MemoraOne account and project at [memoraone.com](https://memoraone.com).
2. In MemoraOne Studio, connect the repository you want to use with Cursor. Studio issues a connect code (it starts with `mcc_`).
3. In a terminal, `cd` into that repository and run:

```bash
npx -y @memoraone/mcp@latest connect <code>
```

Replace `<code>` with the connect code from Studio. Run this from the repository folder you want bound. A Git checkout is not required.

On success, the CLI reports that the repository is connected, Cursor is configured, and MemoraOne is ready. Then fully quit Cursor and reopen this repository.

Until a repository is connected, the MCP server cannot load project memory. That is intentional: this plugin does not ship repository bindings, access tokens, or workspace paths.

## Project isolation

- Each connected repository maps to one MemoraOne project.
- Credentials and binding metadata stay on the local machine; they are not stored in this plugin.
- Open one repository per Cursor window when working with MemoraOne.

## After you are connected

Cursor agents can use MemoraOne tools in the connected project, including:

- `memora_ask_with_memory`
- `memora_post_event`
- `memora_create_fact`
- `memora_status`
- `memora_list_timeline`

Memory stays scoped to the bound MemoraOne project.

## Requirements

- Cursor
- Node.js with `npx` on your `PATH`
- A MemoraOne account and a connected repository

## Support

- Product: [https://memoraone.com](https://memoraone.com)
- Repository: [https://github.com/MemoraOne/cursor-plugin](https://github.com/MemoraOne/cursor-plugin)
