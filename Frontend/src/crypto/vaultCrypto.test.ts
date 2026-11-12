import { describe, expect, it } from 'vitest'

import {
    encryptVaultData,
    decryptVaultData,
    createMasterPasswordVerifier,
    verifyMasterPasswordWithVerifier,
    VAULT_VERIFIER_CANARY,
} from './vaultCrypto'

describe('Vault encryption', () => {

    it('should encrypt plaintext into ciphertext', async () => {
        const plaintext = 'My super secret password'
        const masterPassword = 'master-password-123'

        const encrypted = await encryptVaultData(
            plaintext,
            masterPassword
        )

        expect(encrypted).not.toBe(plaintext)

        const payload = JSON.parse(encrypted)

        expect(payload.version).toBe(1)
        expect(payload.algorithm).toBe('AES-256-GCM')
        expect(payload.kdf).toBe('PBKDF2-SHA-256')
        expect(payload.ciphertext).toBeTruthy()
        expect(payload.iv).toBeTruthy()
        expect(payload.salt).toBeTruthy()
    })

    it('should decrypt encrypted data with the correct master password', async () => {
        const plaintext = 'My super secret password'
        const masterPassword = 'master-password-123'

        const encrypted = await encryptVaultData(
            plaintext,
            masterPassword
        )

        const decrypted = await decryptVaultData(
            encrypted,
            masterPassword
        )

        expect(decrypted).toBe(plaintext)
    })

    it('should fail to decrypt with the wrong master password', async () => {
        const plaintext = 'My super secret password'
        const correctPassword = 'correct-password'
        const wrongPassword = 'wrong-password'

        const encrypted = await encryptVaultData(
            plaintext,
            correctPassword
        )

        await expect(
            decryptVaultData(
                encrypted,
                wrongPassword
            )
        ).rejects.toThrow()
    })

    it('should produce different ciphertext for the same plaintext', async () => {
        const plaintext = 'My super secret password'
        const masterPassword = 'master-password-123'

        const encrypted1 = await encryptVaultData(
            plaintext,
            masterPassword
        )

        const encrypted2 = await encryptVaultData(
            plaintext,
            masterPassword
        )

        expect(encrypted1).not.toBe(encrypted2)
    })

    it('should not expose the plaintext inside the encrypted payload', async () => {
        const plaintext = 'My super secret password'
        const masterPassword = 'master-password-123'

        const encrypted = await encryptVaultData(
            plaintext,
            masterPassword
        )

        expect(encrypted).not.toContain(plaintext)
    })
})

describe('Master password verifier', () => {

    it('should create an encrypted verifier without exposing the plaintext canary', async () => {
        const verifier = await createMasterPasswordVerifier('master-password-123')

        expect(verifier).not.toContain(VAULT_VERIFIER_CANARY)

        const payload = JSON.parse(verifier)
        expect(payload.version).toBe(1)
        expect(payload.algorithm).toBe('AES-256-GCM')
        expect(payload.kdf).toBe('PBKDF2-SHA-256')
        expect(payload.iterations).toBe(600_000)
        expect(payload.salt).toBeTruthy()
        expect(payload.iv).toBeTruthy()
        expect(payload.ciphertext).toBeTruthy()
    })

    it('should verify the correct master password', async () => {
        const masterPassword = 'correct-master-password'
        const verifier = await createMasterPasswordVerifier(masterPassword)

        const isValid = await verifyMasterPasswordWithVerifier(verifier, masterPassword)
        expect(isValid).toBe(true)
    })

    it('should reject an incorrect master password', async () => {
        const verifier = await createMasterPasswordVerifier('correct-master-password')

        const isValid = await verifyMasterPasswordWithVerifier(verifier, 'wrong-password')
        expect(isValid).toBe(false)
    })

    it('should reject tampered verifier ciphertext', async () => {
        const masterPassword = 'correct-master-password'
        const verifier = await createMasterPasswordVerifier(masterPassword)

        const payload = JSON.parse(verifier)
        payload.ciphertext = payload.ciphertext.slice(0, -2) + 'XX'

        const isValid = await verifyMasterPasswordWithVerifier(
            JSON.stringify(payload),
            masterPassword
        )
        expect(isValid).toBe(false)
    })

    it('should reject malformed verifier data', async () => {
        const masterPassword = 'correct-master-password'

        expect(await verifyMasterPasswordWithVerifier('not-valid-json', masterPassword)).toBe(false)
        expect(await verifyMasterPasswordWithVerifier('{}', masterPassword)).toBe(false)
        expect(
            await verifyMasterPasswordWithVerifier(
                JSON.stringify({
                    version: 1,
                    algorithm: 'AES-256-GCM',
                    kdf: 'PBKDF2-SHA-256',
                    salt: '!!!invalid-base64!!!',
                    iv: 'aXY=',
                    ciphertext: 'Y2lwaGVy',
                }),
                masterPassword
            )
        ).toBe(false)
    })

    it('should generate fresh random salt and IV values for each verifier', async () => {
        const masterPassword = 'same-master-password'

        const verifier1 = await createMasterPasswordVerifier(masterPassword)
        const verifier2 = await createMasterPasswordVerifier(masterPassword)

        const payload1 = JSON.parse(verifier1)
        const payload2 = JSON.parse(verifier2)

        expect(payload1.salt).not.toBe(payload2.salt)
        expect(payload1.iv).not.toBe(payload2.iv)
        expect(payload1.ciphertext).not.toBe(payload2.ciphertext)
    })
})