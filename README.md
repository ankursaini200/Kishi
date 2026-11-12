# Kishi

A full-stack password manager built with **Spring Boot 3** and **React 19 + TypeScript**, featuring **client-side vault password encryption** using the Web Crypto API (`PBKDF2-SHA-256` and `AES-256-GCM`).

> **Status & Security Notice:** Kishi is currently an early-stage / educational open-source project and is **not yet production-ready**. It has not undergone a formal security audit. Please review the [Current Limitations](#current-limitations) and [Security Considerations](#security-considerations) sections before deploying or storing sensitive credentials.

---

## Features

- **Client-Side Password Encryption:** Vault entry passwords are encrypted and decrypted in the browser using the Web Crypto API (`PBKDF2-SHA-256` with 600,000 iterations and a 16-byte random salt per entry, paired with `AES-256-GCM` and a 12-byte random IV). The backend never receives your vault master password or plaintext vault entry passwords.
- **Stateless API Authentication:** Email/password registration and login powered by Spring Security, BCrypt account password hashing, and HMAC-SHA JWT authentication.
- **Vault CRUD & Search:** Create, read, update, delete, and search stored vault entries (`title`, `username`, `website`, and encrypted `password`).
- **Cryptographic Password Generator:** Client-side password generator using `crypto.getRandomValues` with configurable length and character sets.
- **Client-Side Security Dashboard:** Local password strength scoring and reused-password detection performed in browser memory after unlocking the vault.
- **Auto-Lock & Clipboard Auto-Clear:** Configurable inactivity auto-lock timer that clears the master password from React state, plus automatic clipboard clearing after copying sensitive passwords.

---

## Technology Stack

### Backend
- **Java 21**
- **Spring Boot 3.5.6** (Web, Data JPA, Validation, Security)
- **JJWT 0.12.6** (JWT signing and verification)
- **PostgreSQL** & **Hibernate**
- **Maven**

### Frontend
- **React 19** & **TypeScript**
- **Vite 8**
- **Tailwind CSS v4**
- **Web Crypto API** (`PBKDF2-SHA-256`, `AES-256-GCM`)
- **Vitest** & **ESLint**

---

## Architecture Overview

```text
┌────────────────────────────────────────────────────────────────────┐
│                    React 19 + TypeScript + Vite                    │
│                                                                    │
│  • Derives AES-256-GCM keys via PBKDF2-SHA-256 (600,000 iters)     │
│  • Encrypts/decrypts vault entry passwords in browser memory       │
│  • Holds master password in memory until locked / timed out        │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │ HTTPS / HTTP REST + Bearer JWT
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                    Spring Boot 3.5.6 (Java 21)                     │
│                                                                    │
│  • /api/auth/register, /api/auth/login (BCrypt + JWT issuance)     │
│  • /api/vault/** (JWT filter, user-scoped CRUD & title search)     │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │ Spring Data JPA / Hibernate
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                             PostgreSQL                             │
│                                                                    │
│  • users (id, email, passwordhash, vault_verifier)                 │
│  • vault_entry (id, title, username, website, encrypted_password)  │
└────────────────────────────────────────────────────────────────────┘
```

---

## Project Directory Structure

```text
Kishi/
├── .env.example                           # Combined example environment variables
├── .gitignore                             # Root Git ignore rules
├── CHANGELOG.md                           # Project changelog
├── CONTRIBUTING.md                        # Contribution guidelines
├── LICENSE                                # MIT License
├── README.md                              # Project documentation
├── SECURITY.md                            # Security policy and vulnerability reporting
├── Backend/
│   ├── .gitignore                         # Backend-specific Git ignore rules
│   ├── pom.xml                            # Maven dependencies and build config
│   └── src/
│       ├── main/java/com/kishi/
│       │   ├── KishiApplication.java
│       │   ├── config/                    # BCrypt PasswordEncoder config
│       │   ├── controller/                # AuthController, VaultController
│       │   ├── dto/                       # Request/response DTOs
│       │   ├── entity/                    # JPA entities (User, VaultEntry)
│       │   ├── exception/                 # GlobalExceptionHandler & custom exceptions
│       │   ├── repository/                # Spring Data JPA repositories
│       │   ├── security/                  # SecurityConfig, JwtService, JwtAuthenticationFilter
│       │   └── service/                   # AuthService, VaultService, CurrentUserService
│       ├── main/resources/
│       │   ├── application.properties         # Reads DB_* and JWT_* environment variables
│       │   └── application-example.properties # Template for local profile / env config
│       └── test/java/com/kishi/           # Spring Boot integration tests
└── Frontend/
    ├── .env.example                       # Frontend example env (VITE_API_BASE_URL)
    ├── .gitignore                         # Frontend-specific Git ignore rules
    ├── eslint.config.js                   # ESLint configuration
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── src/
        ├── components/                    # Auth, common UI, layout, password, security, vault
        ├── contexts/                      # AuthContext, VaultContext, VaultCryptoContext
        ├── crypto/                        # Web Crypto AES-256-GCM + PBKDF2 & Vitest suites
        ├── hooks/                         # Custom React hooks (auto-lock, clipboard, etc.)
        ├── pages/                         # Login, Register, Vault, Security, Settings
        ├── services/                      # Fetch API client, authService, vaultService
        ├── types/                         # TypeScript definitions
        └── utils/                         # Constants, password analysis/generator, validation
```

---

## Prerequisites

- **Java 21** (JDK 21)
- **Maven 3.9+**
- **Node.js 20+** (or 18+) & **npm**
- **PostgreSQL 14+**

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/AnkurSaini200/Kishi.git
cd Kishi
```

### 2. PostgreSQL Setup

Start PostgreSQL and create a database named `kishi`:

```sql
CREATE DATABASE kishi;
```

Hibernate (`spring.jpa.hibernate.ddl-auto=update`) automatically creates and updates the `users` and `vault_entry` tables on startup.

### 3. Environment Variable Configuration

Review the root [`.env.example`](.env.example), [`Backend/src/main/resources/application-example.properties`](Backend/src/main/resources/application-example.properties), and [`Frontend/.env.example`](Frontend/.env.example).

#### Backend variables (`Backend/src/main/resources/application.properties`)
| Variable | Required | Default | Description |
|---|---|---|---|
| `DB_URL` | Yes | — | JDBC URL, e.g. `jdbc:postgresql://localhost:5432/kishi` |
| `DB_USERNAME` | Yes | — | PostgreSQL username |
| `DB_PASSWORD` | Yes | — | PostgreSQL password |
| `JWT_SECRET` | Yes | — | Secret key for HMAC-SHA256 JWT signing (must be at least 256 bits / 32+ characters) |
| `JWT_EXPIRATION` | No | `3600000` | JWT lifetime in milliseconds (`3600000` = 1 hour) |

> **Important:** Spring Boot does not read `.env` files automatically unless you export them in your shell or configure a local Spring profile.

#### Frontend variables (`Frontend/.env`)
| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | No | `http://localhost:8080` | Base URL for the Kishi backend REST API |

### 4. Backend Setup & Run

Option A — Export environment variables in your shell:

```bash
cd Backend
export DB_URL="jdbc:postgresql://localhost:5432/kishi"
export DB_USERNAME="your_postgres_username"
export DB_PASSWORD="your_postgres_password"
export JWT_SECRET="$(openssl rand -base64 32)"
export JWT_EXPIRATION=3600000

mvn spring-boot:run
```

Option B — Use an ignored local Spring profile (`application-local.properties`):

```bash
cd Backend
cp src/main/resources/application-example.properties src/main/resources/application-local.properties
# Edit src/main/resources/application-local.properties with your local credentials and JWT secret
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

The backend API listens on `http://localhost:8080`.

### 5. Frontend Setup & Run

```bash
cd Frontend
cp .env.example .env
npm install
npm run dev
```

The frontend development server runs on `http://localhost:5173`.

---

## Testing & Building

### Backend Tests

The backend test suite (`Backend/src/test/java/com/kishi/`) consists of `@SpringBootTest` integration tests that connect to PostgreSQL and require the `DB_*` and `JWT_SECRET` properties/environment variables to be configured:

```bash
cd Backend
# Ensure PostgreSQL is running and DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET are set
mvn test
```

### Frontend Tests, Linting & Production Build

```bash
cd Frontend

# Run unit tests once
npx vitest run

# Run Vitest in watch mode
npm test

# Run ESLint
npm run lint

# Type-check and build production bundle into Frontend/dist/
npm run build
```

---

## Current Limitations

- **Alternative Login Providers Not Implemented:** Email and password is the only active authentication method. The **Google**, **Passkey**, and **Enterprise SSO** buttons in [`Frontend/src/pages/Login.tsx`](Frontend/src/pages/Login.tsx) are disabled and marked as **Coming Soon**.
- **Master Password Verifier for Empty Legacy Vaults:** Users with a brand-new or empty legacy vault (no verifier and zero entries) must establish a vault master password on first unlock (`POST /api/vault/verifier`) because there are no existing encrypted entries to verify against. Existing accounts with saved entries migrate automatically on first successful unlock without modifying existing entries.
- **Plaintext Vault Metadata:** Only the vault entry `password` field is encrypted client-side. Entry `title`, `username`, and `website` (as well as user account `email`) are stored in plaintext in PostgreSQL to support server-side title search (`/api/vault/search`).
- **Frontend-Only Fields:** Vault `category` (`"login"`) and `updatedAt` timestamps in the UI are currently frontend defaults and are not persisted in PostgreSQL.
- **Production Profile & Migrations:** `application.properties` uses `spring.jpa.hibernate.ddl-auto=update` and `spring.jpa.show-sql=true` for local development; `application-prod.properties` (`SPRING_PROFILES_ACTIVE=prod`) disables SQL logging and stack traces while defaulting `JPA_DDL_AUTO` to `update` until versioned database migrations (e.g., Flyway) and `validate` are configured.
- **No Brute-Force Rate Limiting or Token Revocation:** Authentication endpoints do not currently implement rate limiting, and JWTs have no refresh-token rotation or server-side revocation list.

---

## Security Considerations

- **Not Full Zero-Knowledge:** While vault entry passwords are encrypted client-side before leaving the browser, Kishi should **not** be considered a complete zero-knowledge system because entry metadata (`title`, `username`, `website`) and account `email` are visible to the backend in plaintext.
- **Separate Account Password vs. Vault Master Password:** Account login (`/api/auth/login`) authenticates against the backend using BCrypt, whereas vault decryption derives AES-256-GCM keys client-side from the password entered on the vault unlock screen. Using distinct strong passwords reduces risk if the backend authentication database is ever compromised; if you use the same password for both, ensure you understand the trade-off.
- **JWT Storage in `localStorage`:** The frontend persists the JWT in `localStorage` (`kishi_token`). While convenient for a single-page application, `localStorage` is accessible to JavaScript and therefore relies on strict XSS prevention; `HttpOnly; Secure; SameSite` cookies are recommended for higher-assurance deployments.
- **Master Password in Browser Memory:** While the vault is unlocked, the master password string is held in React state (`VaultCryptoContext`) until manual lock or inactivity auto-lock.
- **Deployment Hardening:** Before exposing any instance beyond localhost, serve both frontend and backend over HTTPS, configure a strong random `JWT_SECRET` (256+ bits), disable `spring.jpa.show-sql`, switch to explicit schema migrations, and restrict CORS origins to your deployed frontend origin.

For instructions on reporting vulnerabilities privately, see [`SECURITY.md`](SECURITY.md).

---

## Contributing

Contributions are welcome! Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) for setup instructions, coding conventions, and the pull request process.

---

## License

This project is licensed under the **MIT License** — see [`LICENSE`](LICENSE) for details.
