# Contributing to Kishi

Thank you for your interest in contributing to **Kishi**! Please follow these guidelines to keep the codebase clean, accurate, and secure.

---

## Getting Started

1. **Fork the repository** on GitHub (`https://github.com/AnkurSaini200/Kishi`).
2. **Clone your fork locally:**
   ```bash
   git clone https://github.com/<your-username>/Kishi.git
   cd Kishi
   ```
3. **Create a feature or fix branch** from `main`:
   ```bash
   git checkout -b feat/your-change-name
   ```

---

## Development Environment Setup

### Prerequisites
- Java 21 (JDK 21)
- Maven 3.9+
- Node.js 20+ (or 18+) & npm
- PostgreSQL 14+

### Database & Environment Configuration
1. Create a local PostgreSQL database:
   ```sql
   CREATE DATABASE kishi;
   ```
2. Configure environment variables using [`.env.example`](.env.example) as a reference, or create an ignored `Backend/src/main/resources/application-local.properties` from [`Backend/src/main/resources/application-example.properties`](Backend/src/main/resources/application-example.properties).
3. For the frontend, copy `Frontend/.env.example` to `Frontend/.env`:
   ```bash
   cd Frontend
   cp .env.example .env
   npm install
   ```

> **Security Rule:** Never commit `.env`, `application-local.properties`, database dumps, real credentials, or JWT secrets.

---

## Coding Conventions

- **Backend (Java / Spring Boot):**
  - Follow standard Java naming conventions and Spring layered architecture (`controller` -> `service` -> `repository`).
  - Validate request payloads with Jakarta Bean Validation annotations (`@Valid`, `@NotBlank`, `@Size`, `@Email`).
  - Handle errors consistently through `GlobalExceptionHandler`.
  - Keep secrets and environment-specific settings externalized via environment variables or ignored local profiles.
- **Frontend (React / TypeScript):**
  - Keep components modular and strictly typed in TypeScript.
  - Ensure `npm run lint` passes with zero errors.
  - All cryptographic operations must use the Web Crypto API in `Frontend/src/crypto/`—never implement custom cryptographic primitives or use `Math.random()` for security-sensitive values.
- **Security Accuracy:**
  - Do not overstate security guarantees in UI copy or documentation (for example, do not describe plaintext metadata as zero-knowledge or label mock auth flows as production implementations).

---

## Running Tests & Checks

Before opening a pull request, run all relevant checks:

### Backend
```bash
cd Backend
# Requires PostgreSQL and DB_* / JWT_SECRET configuration
mvn test
```

### Frontend
```bash
cd Frontend
npx vitest run
npm run lint
npm run build
```

---

## Submitting a Pull Request

1. Ensure your branch is up to date with `main`.
2. Verify that no secrets, `.env` files, build artifacts (`target/`, `dist/`), or `node_modules/` are staged.
3. Write a clear pull request description explaining:
   - What changed and why.
   - How you tested the changes (including backend and frontend checks).
   - Any security implications or configuration updates required.
4. Keep pull requests focused on a single concern when possible.

---

## Reporting Security Issues

If you discover a security vulnerability, **do not open a public issue or pull request**. Follow the private reporting process in [`SECURITY.md`](SECURITY.md).

