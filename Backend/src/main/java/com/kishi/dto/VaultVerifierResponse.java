package com.kishi.dto;

public class VaultVerifierResponse {

    private boolean hasVerifier;
    private String encryptedVerifier;

    public VaultVerifierResponse(boolean hasVerifier, String encryptedVerifier) {
        this.hasVerifier = hasVerifier;
        this.encryptedVerifier = encryptedVerifier;
    }

    public boolean isHasVerifier() {
        return hasVerifier;
    }

    public String getEncryptedVerifier() {
        return encryptedVerifier;
    }
}

