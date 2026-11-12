export {
  encryptVaultData,
  decryptVaultData,
  createMasterPasswordVerifier,
  verifyMasterPasswordWithVerifier,
  deriveKey,
  PBKDF2_ITERATIONS,
  KEY_LENGTH,
  VAULT_VERIFIER_CANARY,
} from './vaultCrypto';

export type { EncryptedVaultPayload, EncryptedValue } from './types';
