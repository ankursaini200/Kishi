package com.kishi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity 
@Table (name = "users")
public class User {

    @Id 
    @GeneratedValue (strategy= GenerationType.IDENTITY)
    
    private long id;
    private String email;
    private String passwordhash;

    @Column(name = "vault_verifier", columnDefinition = "TEXT")
    private String vaultVerifier;

    //getters and setters
    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordhash() {
        return passwordhash;
    }

    public void setPasswordhash(String passwordhash) {
        this.passwordhash = passwordhash;
    }

    public String getVaultVerifier() {
        return vaultVerifier;
    }

    public void setVaultVerifier(String vaultVerifier) {
        this.vaultVerifier = vaultVerifier;
    }

    
}
