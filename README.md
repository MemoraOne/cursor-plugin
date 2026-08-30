<p align="center">
  <a href="https://memoraone.com">
    <img src="assets/memoraone-wordmark.svg" alt="MemoraOne" height="48" />
  </a>
</p>

# MemoraOne for Cursor

Persistent project memory for AI coding agents in Cursor.

MemoraOne captures decisions, code events, and project context so agents can continue work across sessions instead of starting from zero. Memory is isolated by MemoraOne project: each connected repository binds to one project, and that project’s memory is not shared with other projects.

**New to MemoraOne? [Get started in MemoraOne Studio](https://studio.memoraone.com).** Create your account, choose a plan, and connect this repository to activate project memory in Cursor.

This plugin launches the published [`@memoraone/mcp`](https://www.npmjs.com/package/@memoraone/mcp) package. It does not include a second MCP implementation.

## Install from the Cursor Marketplace

1. Open **Customize** in the Cursor sidebar.
2. Search for **MemoraOne**.
3. Select **Install** and choose a project or user scope.

Node.js must be available so Cursor can run `npx`.

Installing the plugin starts the MemoraOne MCP server. It does **not** by itself grant access to project memory. A MemoraOne account and a paired repository are still required.

## Connecting a repository

When you open a repository in Cursor with this plugin installed, MemoraOne pairs that folder automatically. If authorization is required, the plugin opens a browser window to complete it.

You do not need to run a connect command or add a `.cursor/mcp.json` in the repository. The plugin-managed MCP is the Cursor MCP connection.

If this repository is already connected to MemoraOne, you do not need to pair again. Fully quit Cursor and reopen the repository if MCP tools do not appear after install.

Until a repository is paired, the MCP server cannot load project memory. That is intentional: this plugin does not ship repository bindings or access tokens.

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

MemoraOne is developed and maintained by **MemoraOne LLC**.
