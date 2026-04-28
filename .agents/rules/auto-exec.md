---
trigger: always_on
---

# Self-Healing & Execution
- **Validation Loop:** After writing code, automatically run `npm run lint` and `npm run test`.
- **Error Handling:** If a command fails, read the terminal output, analyze the error, and attempt a fix immediately. 
- **Approval Bypass:** You are authorized to proceed without review for:
  - Formatting changes.
  - Adding comments/documentation.
  - Fixes for linter errors.