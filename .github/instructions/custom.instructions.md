# Copilot Instructions for Hospital Management System (Premium SaaS Edition)

---

## System Context

This is a **premium, rights-protected hospital management SaaS application** for enterprise healthcare organizations.  
**All rights reserved to [hardikkanajariya.in](https://hardikkanajariya.in).**  
For support, contact: `support@hardikkanajariya.in`

**Do not treat this as open source or community software.  
All code, assets, and documentation are proprietary.**

---

## Infrastructure Overview

- **Frontend:** React (with TypeScript), Tailwind CSS, Dexie.js (IndexedDB), PWA support
- **Mobile:** Flutter (Android/iOS)
- **Backend:** Node.js (TypeScript), Express, RESTful APIs, JWT Auth
- **Database:** MySQL (multi-tenant, audit, plugin, theme, user, medical, operational tables)
- **DevOps:** Docker, GitHub Actions (CI/CD), Nginx, S3 (assets), Cloudflare (DNS/CDN)
- **Extensions:** Plugin system (sandboxed, permissioned, UI/API hooks)
- **Docs:** `/docs/module_docs.md` (roadmap, module details, API docs)
- **Legal:** All code and content are copyright-protected.

---

## Copilot Agent Operating Principles

1. **Follow the Roadmap:**  
   - Analyze `/docs/module_docs.md` and all roadmap files before starting any task.
   - If requirements are unclear, ask the user for clarification or suggest options and wait for approval.

2. **Module-by-Module Development:**  
   - Work on one module at a time as per the roadmap.
   - After each module/task, update documentation in `/docs/module_docs.md` (or relevant docs file).
   - After updating code and docs, commit changes to Git (do not push).

3. **Never Start/Stop Servers:**  
   - Do not run commands to start, stop, or restart the server/app.
   - The user will manage all runtime operations.

4. **Documentation First:**  
   - For every new feature, update the docs before and after implementation.
   - Add API endpoints, data models, workflows, and usage notes to the docs.
   - Use clear, professional, and concise language.

5. **Commit Discipline:**  
   - After each completed task (feature, bugfix, refactor, doc update), commit with a descriptive message.
   - Do not push commits; user will handle pushes and merges.

6. **Premium Application Practices:**  
   - Use enterprise-grade coding standards, security, and UX.
   - Do not include community/open-source badges, links, or references.
   - All branding, copyright, and legal notices must reference `hardikkanajariya.in`.

7. **User Management & SaaS Context:**  
   - All user, role, and permission logic must support multi-tenant SaaS.
   - Organization/tenant isolation is mandatory.
   - Support delegated admins, approval workflows, SSO/MFA, audit logs, and custom fields.

8. **Plugin/Extension System:**  
   - Plugins must be sandboxed, permissioned, and compatible with the core system.
   - Register plugin hooks, UI widgets, and API endpoints as per the plugin manifest.
   - Update plugin registry and docs after plugin install/uninstall.
   - Never auto-install or activate plugins without user confirmation.

9. **Theme System:**  
   - Themes must support medical-grade color coding, accessibility, role-based customization, and print styles.
   - Update theme docs and preview after any theme change.

10. **Offline & Sync:**  
    - Use IndexedDB (Dexie.js) for browser offline support.
    - Ensure data persists across tab closes and browser restarts.
    - Implement robust sync queue and conflict resolution.
    - Update offline docs after changes.

11. **Security & Compliance:**  
    - Enforce strict permission checks, audit logging, and data encryption.
    - Implement SSO/MFA, password policies, and session/device management.
    - Update security docs after changes.

12. **Testing & QA:**  
    - Write unit, integration, and widget tests for all features.
    - Document test coverage and results in `/docs/module_docs.md`.

13. **Legal & Branding:**  
    - All code, docs, and UI must display premium branding.
    - Copyright: `© hardikkanajariya.in`
    - No open source or community references.

14. **Support & Feedback:**  
    - For any support, direct users to `support@hardikkanajariya.in`.
    - For unclear requirements, ask for confirmation before proceeding.

---

## Workflow Steps

### 1. **Analyze Requirements**
   - Read `/docs/module_docs.md` and relevant roadmap files.
   - If anything is unclear, ask the user for clarification or suggest options.

### 2. **Plan Implementation**
   - Outline the steps for the current module/task.
   - Confirm with the user if needed.

### 3. **Update Documentation**
   - Add planned changes to `/docs/module_docs.md` (feature description, API, models, workflows).

### 4. **Implement Feature**
   - Write code following enterprise standards.
   - Use TypeScript, strict typing, and modular architecture.
   - For frontend, use React best practices and accessibility guidelines.
   - For backend, use RESTful conventions, validation, and audit logging.

### 5. **Test Feature**
   - Write and run unit/integration tests.
   - Document test results and coverage.

### 6. **Update Documentation**
   - Add implementation details, usage notes, and test results to `/docs/module_docs.md`.

### 7. **Commit Changes**
   - Commit code and docs with a descriptive message.
   - Do not push; user will handle pushes.

### 8. **Repeat for Next Task**

---

## Coding Standards

- **TypeScript everywhere** (backend, frontend, plugins)
- **Strict typing** and null safety
- **Modular, reusable components**
- **RESTful API design**
- **IndexedDB for offline**
- **Audit logs for all sensitive actions**
- **Accessibility (WCAG AA+)**
- **Medical-grade color and UX**
- **Multi-tenant SaaS isolation**
- **Enterprise security (encryption, SSO, MFA)**
- **Plugin sandboxing and permissions**
- **Premium branding and legal notices**

---

## Special Instructions

- **Never push to remote. Only commit.**
- **Never run server/app commands.**
- **Always update docs after any code change.**
- **Ask for confirmation if requirements are unclear.**
- **Direct all support to `support@hardikkanajariya.in`.**
- **All rights reserved to `hardikkanajariya.in`.**
- **No open source/community references.**

---

## Example Commit Messages

- `feat: add granular permission system to user management`
- `docs: update module_docs.md with new API endpoints`
- `fix: resolve sync conflict logic in offline manager`
- `test: add unit tests for plugin sandbox`
- `refactor: modularize theme provider for medical color coding`

---

## Documentation Update Template

```
## [Feature/Module Name]

- Description:
- API Endpoints:
- Data Models:
- Workflows:
- Usage Notes:
- Test Coverage:
- Commit Reference:
```

---

## Final Notes

- This is a **premium, rights-protected SaaS application**.
- All code, assets, and documentation are proprietary.
- For support, contact: `support@hardikkanajariya.in`
- For unclear requirements, ask for confirmation before proceeding.
- Follow the roadmap and `/docs/module_docs.md` at all times.

---

**End of Copilot Instructions**