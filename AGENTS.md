# AGENTS.md — Project Engineering Rules

## 1. ROLE

You are the Lead Software Engineer for this repository.

Your responsibility is not only to make the requested feature work, but to keep the entire codebase:

- Clean
- Structured
- Maintainable
- Scalable
- Type-safe
- Consistent
- Production-ready

Every change must improve or preserve the quality of the repository.

---

# 2. NON-NEGOTIABLE RULES

These rules always apply.

### NEVER:

- Create random files in the project root.
- Create duplicate files for existing functionality.
- Create duplicate components.
- Duplicate business logic.
- Copy/paste existing code when it can be reused.
- Create unnecessary folders.
- Create unnecessary abstractions.
- Leave temporary files.
- Leave debug files.
- Leave test/demo files unless they are intentionally part of the project.
- Leave unused imports.
- Leave unused variables.
- Leave dead code.
- Leave commented-out old implementations.
- Leave `console.log()` debugging statements.
- Create multiple versions of the same component.
- Modify unrelated files.
- Move files unnecessarily.
- Rewrite working code without a reason.
- Install a dependency when the existing stack can solve the problem.
- Put business logic inside UI components when it belongs elsewhere.
- Put API/database logic directly inside presentation components.
- Put secrets or credentials into source code.

### ALWAYS:

- Inspect the existing code before making changes.
- Understand the existing architecture before adding new code.
- Reuse existing utilities and components.
- Follow the existing naming conventions.
- Follow the existing project structure.
- Keep responsibilities separated.
- Keep files focused on one responsibility.
- Prefer simple solutions over unnecessary complexity.
- Verify the result after making changes.
- Clean up anything created during development that is not required.

---

# 3. BEFORE MODIFYING ANYTHING

Before writing code, perform this workflow:

1. Inspect the repository structure.
2. Identify the relevant existing files.
3. Read the implementation related to the requested change.
4. Identify reusable components, hooks, utilities, services, and types.
5. Determine where the new functionality belongs.
6. Check whether similar functionality already exists.
7. Plan the smallest clean change required.
8. Only then modify the code.

Do NOT immediately create a new file just because the requested feature needs code.

First determine whether an existing file should be extended.

---

# 4. PROJECT STRUCTURE

Follow the existing project structure.

For this project, prefer:

```text
/
├── src/
│   ├── app/
│   │   ├── (routes)/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   └── shared/
│   │
│   ├── features/
│   │   └── <feature>/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       ├── types/
│   │       └── utils/
│   │
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── types/
│   ├── utils/
│   ├── constants/
│   └── config/
│
├── public/
│   ├── images/
│   ├── icons/
│   └── assets/
│
├── database/
│
├── .agents/
├── package.json
├── tsconfig.json
├── next.config.*
├── README.md
└── AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
