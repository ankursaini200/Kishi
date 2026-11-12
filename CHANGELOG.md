# Changelog

All notable changes to **Kishi** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Client-side encrypted vault master-password verifier (`createMasterPasswordVerifier` / `verifyMasterPasswordWithVerifier` in `vaultCrypto.ts`) and `GET`/`POST /api/vault/verifier` backend endpoints with transaction-safe conditional initialization.
- First-time master password setup UI and legacy vault verifier migration in `VaultContext.tsx` and `Vault.tsx`.
- Unit and integration tests covering encrypted verifier creation, verification, tampered/malformed rejection, duplicate `409` protection, and user isolation.
- `LICENSE` (MIT License).
- Root `.gitignore` covering secrets, Java/Maven artifacts, Node/Vite outputs, database dumps, logs, and IDE/OS files.
- Root `.env.example` documenting required backend (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRATION`) and frontend (`VITE_API_BASE_URL`) configuration.
- `CONTRIBUTING.md`, `SECURITY.md`, and `CHANGELOG.md` for open-source collaboration and responsible vulnerability disclosure.

### Removed
- Mock Google, Passkey, and Enterprise SSO fake JWT login handlers from `AuthContext.tsx` (replaced with disabled "Coming Soon" UI buttons in `Login.tsx`).
- Unused placeholder stubs, starter assets, and manual scratch scripts (`keyDerivation.ts`, `testCrypto.ts`, `testGenerator.ts`, `AuthForm.tsx`, `ProtectedRoute.tsx`, `userService.ts`, `types/api.ts`, `assets/{hero.png,react.svg,vite.svg}`, `public/icons.svg`, `EncryptionService.java`, `UserService.java`, `ApiResponse.java`, `VaultEntryResponse.java`, and empty `Backend/README.md`).

### Changed
- Renamed `Backend/src/test/java/com/kishi/AuthController.java` to `AuthControllerTest.java` to match `AuthControllerTest`.
- Restored `Backend/src/main/resources/application.properties` to read `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` from environment variables instead of hardcoded local credentials.
- Updated `Backend/.gitignore` so Maven wrapper properties are not ignored.
- Updated `Backend/src/main/resources/application-example.properties` with clear placeholders and `application-local.properties` usage notes.
- Rewrote `README.md` and `Login.tsx` encryption footer to accurately reflect client-side password encryption, plaintext metadata behavior, and security limitations.

