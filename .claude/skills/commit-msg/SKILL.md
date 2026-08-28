---
name: commit-msg
description: Generate a commit message from staged changes and commit them. Use when the user says "write a commit message", "generate a commit", "commit my changes", or runs /commit-msg.
---

# Commit Message Generator

Generate a conventional commit message from the currently staged diff and commit with it.

## Steps

1. **Check for staged changes.** Run `git diff --staged`. If it produces no output (nothing is staged), stop immediately and tell the user to stage their changes first (e.g. with `git add`). Do not proceed further.

2. **Read the staged diff.** Use the output of `git diff --staged` (and `git diff --staged --stat` if helpful for an overview) to understand what changed.

3. **Generate a commit message** in this exact format:

   ```
   type(scope): short subject

   - bullet of what changed
   - bullet of why
   ```

   Rules:
   - `type` must be one of: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`.
   - `scope` is a short identifier for the affected area (e.g. a package, module, or feature name) inferred from the diff. Omit the `(scope)` parentheses if no clear scope applies.
   - The subject line (including `type(scope): `) must be under 60 characters, written in imperative mood, no trailing period.
   - Body bullets are optional but encouraged — include a couple of concise bullets summarizing what changed and, where useful, why. Skip bullets entirely for trivial one-line changes.
   - Never include a `Co-Authored-By` trailer or any other trailer.

4. **Commit.** Run `git commit -m "<subject>" -m "<body>"` (or equivalent) using the generated message exactly. Do not ask for confirmation of the message text itself, but do follow normal git-commit conventions (don't use `--no-verify`, don't amend, etc.).

5. Report the resulting commit (hash + subject) back to the user.
