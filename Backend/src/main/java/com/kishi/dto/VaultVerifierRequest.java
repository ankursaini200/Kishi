package com.kishi.dto;

import jakarta.validation.constraints.NotBlank;

public class VaultVerifierRequest {

    @NotBlank(message = "Encrypted verifier is required")
    private String encryptedVerifier;

    public String getEncryptedVerifier() {
        return encryptedVerifier;
    }

    public void setEncryptedVerifier(String encryptedVerifier) {
        this.encryptedVerifier = encryptedVerifier;
    }
}

