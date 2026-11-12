package com.kishi.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kishi.dto.VaultRequest;
import com.kishi.dto.VaultResponse;
import com.kishi.dto.VaultVerifierRequest;
import com.kishi.dto.VaultVerifierResponse;
import com.kishi.entity.User;
import com.kishi.entity.VaultEntry;
import com.kishi.exception.ResourceNotFoundException;
import com.kishi.exception.VaultVerifierAlreadyExistsException;
import com.kishi.repository.UserRepository;
import com.kishi.repository.VaultEntryRepository;

@Service
public class VaultService {

    private final VaultEntryRepository vaultEntryRepository;
    private final UserRepository userRepository;

    public VaultService(
            VaultEntryRepository vaultEntryRepository,
            UserRepository userRepository) {
        this.vaultEntryRepository = vaultEntryRepository;
        this.userRepository = userRepository;
    }

    public VaultResponse createEntry(VaultRequest request, User user) {

        VaultEntry entry = new VaultEntry();

        entry.setTitle(request.getTitle());
        entry.setUsername(request.getUsername());
        entry.setEncryptedPassword(request.getEncryptedPassword());
        entry.setWebsite(request.getWebsite());

        entry.setUser(user);

        VaultEntry savedEntry = vaultEntryRepository.save(entry);

        return new VaultResponse(
                savedEntry.getId(),
                savedEntry.getTitle(),
                savedEntry.getUsername(),
                savedEntry.getEncryptedPassword(),
                savedEntry.getWebsite()
        );
    }

    public List<VaultResponse> getAllEntries(User user) {
    
        List<VaultEntry> entries =
                vaultEntryRepository.findAllByUser(user);

        return entries.stream()
                .map(entry -> new VaultResponse(
                        entry.getId(),
                        entry.getTitle(),
                        entry.getUsername(),
                        entry.getEncryptedPassword(),
                        entry.getWebsite()
                ))
                .toList();
    }

    public VaultResponse getEntry(Long id, User user) {

        VaultEntry entry =
                vaultEntryRepository.findByIdAndUser(id, user)
                        .orElseThrow(() ->
                new ResourceNotFoundException("Vault entry not found"));

        return new VaultResponse(
            entry.getId(),
            entry.getTitle(),
            entry.getUsername(),
            entry.getEncryptedPassword(),
            entry.getWebsite()
        );
    }

       public VaultResponse updateEntry(
            Long id,
            VaultRequest request,
            User user) {

        VaultEntry entry =
                vaultEntryRepository.findByIdAndUser(id, user)
                        .orElseThrow(() ->
        new ResourceNotFoundException("Vault entry not found"));

        entry.setTitle(request.getTitle());
        entry.setUsername(request.getUsername());
        entry.setEncryptedPassword(request.getEncryptedPassword());
        entry.setWebsite(request.getWebsite());

        VaultEntry updatedEntry =
                vaultEntryRepository.save(entry);

        return new VaultResponse(
                updatedEntry.getId(),
                updatedEntry.getTitle(),
                updatedEntry.getUsername(),
                updatedEntry.getEncryptedPassword(),
                updatedEntry.getWebsite()
        );
    }

            public void deleteEntry(Long id, User user) {
            
        VaultEntry entry =
                vaultEntryRepository.findByIdAndUser(id, user)
                        .orElseThrow(() ->
        new ResourceNotFoundException("Vault entry not found"));
            
        vaultEntryRepository.delete(entry);
    }

        public List<VaultResponse> searchEntries(
            String title,
            User user) {
            
        List<VaultEntry> entries =
                vaultEntryRepository
                        .findAllByUserAndTitleContainingIgnoreCase(
                                user,
                                title
                        );
                    
        return entries.stream()
                .map(entry -> new VaultResponse(
                        entry.getId(),
                        entry.getTitle(),
                        entry.getUsername(),
                        entry.getEncryptedPassword(),
                        entry.getWebsite()
                ))
                .toList();
    }

    public VaultVerifierResponse getVaultVerifier(User user) {
        String verifier = user.getVaultVerifier();
        boolean hasVerifier = verifier != null && !verifier.isBlank();

        return new VaultVerifierResponse(
                hasVerifier,
                hasVerifier ? verifier : null
        );
    }

    @Transactional
    public VaultVerifierResponse createVaultVerifier(
            VaultVerifierRequest request,
            User user) {

        int updatedRows = userRepository.initializeVaultVerifierIfAbsent(
                user.getId(),
                request.getEncryptedVerifier()
        );

        if (updatedRows == 0) {
            throw new VaultVerifierAlreadyExistsException(
                    "Vault verifier already exists"
            );
        }

        return new VaultVerifierResponse(true, request.getEncryptedVerifier());
    }
}