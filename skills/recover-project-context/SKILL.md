---
name: Recover Project Context
description: Retrieve persistent MemoraOne project memory before continuing work in an existing repository.
---

# Recover Project Context

Use this skill when the user asks to continue previous work, recall earlier decisions, understand repository history, recover prior implementation context, or determine what should happen next based on past project activity.

## Workflow

1. Identify the current project or repository context.
2. Use `memora_ask_with_memory` to retrieve relevant persistent MemoraOne context.
3. Prioritize:
   - prior architectural decisions
   - previous implementation choices
   - recent fixes and migrations
   - unresolved work
   - decisions about what to do next
4. Use the retrieved memory to answer or continue the task.
5. If the memory is incomplete, say what is missing rather than inventing prior context.

## Important

Do not rely only on the current chat when the request depends on previous project history.

Do not create new memory while only recovering context.

Use `memora_post_event` or `memora_log_change_summary` only after meaningful new work or decisions occur.
