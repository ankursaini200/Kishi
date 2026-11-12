# Security Policy

## Project Status

Kishi is currently in active early-stage development and is **not yet production-ready**. It has not undergone a formal third-party security audit.

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

If you discover a potential security vulnerability in Kishi, please report it privately using one of the following channels:

1. **GitHub Private Vulnerability Reporting (Recommended):** Use the **Security** tab -> **Advisories** -> **Report a vulnerability** on the GitHub repository (`https://github.com/AnkurSaini200/Kishi/security/advisories`).
2. **Private Maintainer Contact:** `[INSERT_SECURITY_CONTACT_EMAIL]` *(maintainer: please replace this placeholder with a monitored security contact email before publishing)*.

---

## What to Include in a Report

To help us investigate and resolve the issue quickly, please include:

- A clear description of the vulnerability and its potential impact.
- Step-by-step instructions or a minimal proof-of-concept to reproduce the issue.
- Affected component(s) and file path(s) (e.g., `Backend/...` or `Frontend/...`).
- Relevant environment details (Java version, Node version, browser, configuration).
- Any suggested remediation or mitigation, if available.

---

## Disclosure Policy

- Please allow the maintainers reasonable time to investigate, fix, and release a patch before publicly disclosing any vulnerability.
- Avoid testing against systems or data you do not own.

---

## Known Limitations & Out-of-Scope Design Trade-Offs

The following behaviors are currently known and documented in [`README.md`](README.md):

- **Plaintext Vault Metadata:** Vault entry `title`, `username`, and `website` fields, as well as user account `email`, are stored in plaintext on the backend; only the entry `password` and the per-user vault verifier (`vault_verifier`) are encrypted client-side.
- **JWT Storage in `localStorage`:** Auth tokens are currently stored in browser `localStorage`, which carries known XSS trade-offs compared to `HttpOnly` cookies.
- **Alternative Auth Flows:** Google, Passkey, and Enterprise SSO buttons on the login page are disabled "Coming Soon" placeholders; only email/password authentication is active.

