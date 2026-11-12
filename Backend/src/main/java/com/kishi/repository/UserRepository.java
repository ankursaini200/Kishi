package com.kishi.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
   
import com.kishi.entity.User;   

public interface UserRepository extends JpaRepository<User, Long> {
    
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE User u
            SET u.vaultVerifier = :vaultVerifier
            WHERE u.id = :userId
              AND (u.vaultVerifier IS NULL OR u.vaultVerifier = '')
            """)
    int initializeVaultVerifierIfAbsent(
            @Param("userId") long userId,
            @Param("vaultVerifier") String vaultVerifier);

}