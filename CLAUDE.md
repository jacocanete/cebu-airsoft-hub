@AGENTS.md

# Code Comments

- Never use decorative separator comments like `// ── Section ──────` or `// ---------------`. Use plain `//` section headers if needed.
- Never write obvious comments that describe what easily readable code does.
- Only add comments when they provide additional context not apparent from the code.
- Comments should explain _why_, not _what_, when the _what_ is self-evident.

# Types

- All shared types live in `src/types/index.ts`. Import from `@/types`.
- Constant-derived types (`ForumCategory`, `GameType`, etc.) are re-exported from `@/types` — import from there, not from `@/lib/constants`.
- Component props interfaces stay local to their file.
- Never duplicate type shapes across files — if a type is used in more than one file, move it to `@/types`.
