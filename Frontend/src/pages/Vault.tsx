import { useState } from 'react';

import { useVault } from '../hooks/useVault';
import { useVaultCrypto } from '../contexts/VaultCryptoContext';

import { Toast } from '../components/common/Toast';
import { Loading } from '../components/common/Loading';
import { Modal } from '../components/common/Modal';

import { VaultSearch } from '../components/vault/VaultSearch';
import { VaultList } from '../components/vault/VaultList';
import { AddEntryModal } from '../components/vault/AddEntryModal';
import { EditEntryModal } from '../components/vault/EditEntryModal';

import type { VaultEntry } from '../types/vault';

export function Vault() {
  const {
    entries,
    isLoading,
    error: vaultError,
    verifierMode,
    verifierError,
    refreshVerifierStatus,
    setupMasterPassword,
    verifyMasterPassword,
    addEntry,
    editEntry,
    removeEntry,
  } = useVault();

  const {
    isUnlocked,
    unlock,
  } = useVaultCrypto();

  /*
   * ---------------------------------------------------------
   * SEARCH
   * ---------------------------------------------------------
   */
  const [searchQuery, setSearchQuery] =
    useState('');

  /*
   * ---------------------------------------------------------
   * MASTER PASSWORD
   * ---------------------------------------------------------
   */
  const [masterPasswordInput, setMasterPasswordInput] =
    useState('');

  const [confirmMasterPasswordInput, setConfirmMasterPasswordInput] =
    useState('');

  const [unlockError, setUnlockError] =
    useState<string | null>(null);

  const [showUnlockPassword, setShowUnlockPassword] =
    useState(false);

  const [isVerifying, setIsVerifying] =
    useState(false);

  /*
   * ---------------------------------------------------------
   * ADD / EDIT / DELETE
   * ---------------------------------------------------------
   */
  const [isAddModalOpen, setIsAddModalOpen] =
    useState(false);

  const [editingEntry, setEditingEntry] =
    useState<VaultEntry | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<{
      id: string;
      title: string;
    } | null>(null);

  const [isDeleting, setIsDeleting] =
    useState(false);

  /*
   * ---------------------------------------------------------
   * TOAST
   * ---------------------------------------------------------
   */
  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  /*
   * ---------------------------------------------------------
   * FILTER ENTRIES
   * ---------------------------------------------------------
   */
  const filteredEntries =
    entries.filter((entry) => {
      const query =
        searchQuery.toLowerCase();

      return (
        entry.title
          .toLowerCase()
          .includes(query) ||
        entry.username
          .toLowerCase()
          .includes(query) ||
        (
          entry.website &&
          entry.website
            .toLowerCase()
            .includes(query)
        )
      );
    });

  const handleSetupMasterPassword = async (
    e?: React.FormEvent
  ) => {
    if (e) {
      e.preventDefault();
    }

    setUnlockError(null);

    if (!masterPasswordInput) {
      setUnlockError(
        'Please enter a master password'
      );
      return;
    }

    if (masterPasswordInput.length < 8) {
      setUnlockError(
        'Master password must be at least 8 characters'
      );
      return;
    }

    if (masterPasswordInput !== confirmMasterPasswordInput) {
      setUnlockError(
        'Master passwords do not match'
      );
      return;
    }

    setIsVerifying(true);
    try {
      await setupMasterPassword(masterPasswordInput);
      unlock(masterPasswordInput);
      setMasterPasswordInput('');
      setConfirmMasterPasswordInput('');
      setToastMessage(
        'Vault master password initialized and unlocked'
      );
    } catch (err) {
      setUnlockError(
        err instanceof Error
          ? err.message
          : 'Unable to initialize vault master password.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * UNLOCK VAULT
   * ---------------------------------------------------------
   *
   * IMPORTANT:
   *
   * We do NOT simply call unlock().
   *
   * First we verify that the supplied password
   * can actually decrypt the stored encrypted verifier
   * (or existing vault entry for legacy accounts).
   */
  const handleUnlock = async (
    e?: React.FormEvent
  ) => {
    if (e) {
      e.preventDefault();
    }

    setUnlockError(null);

    /*
     * Do not allow an empty password.
     */
    if (!masterPasswordInput) {
      setUnlockError(
        'Please enter your master password'
      );
      return;
    }

    setIsVerifying(true);
    try {
      /*
       * Verify the password cryptographically.
       */
      const isValid =
        await verifyMasterPassword(
          masterPasswordInput
        );

      /*
       * Wrong password.
       */
      if (!isValid) {
        setUnlockError(
          'Incorrect master password.'
        );

        return;
      }

      /*
       * Password is correct.
       *
       * Now actually unlock the vault.
       */
      unlock(masterPasswordInput);

      /*
       * Remove the password from
       * the input field immediately.
       */
      setMasterPasswordInput('');

      setToastMessage(
        'Vault unlocked successfully'
      );
    } catch {
      setUnlockError(
        'Unable to verify master password.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * DELETE ENTRY
   * ---------------------------------------------------------
   */
  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);

    try {
      await removeEntry(
        deleteTarget.id
      );

      setToastMessage(
        `Deleted "${deleteTarget.title}"`
      );

      setDeleteTarget(null);
    } catch (err) {
      setToastMessage(
        err instanceof Error
          ? err.message
          : 'Failed to delete entry'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  /*
   * =========================================================
   * LOCKED SCREEN
   * =========================================================
   */
  if (!isUnlocked) {
    if (verifierMode === 'loading') {
      return (
        <div className="flex-1 flex items-center justify-center min-w-0 text-left">
          <div className="w-full max-w-[560px]">
            <div className="win98-window">
              <div className="win98-titlebar">
                <div className="flex items-center gap-2">
                  <span>🔒</span>
                  <span>Kishi - Checking Vault</span>
                </div>
              </div>
              <div className="win98-window-content p-8 flex items-center justify-center">
                <Loading message="Checking encrypted vault status..." />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (verifierMode === 'error') {
      return (
        <div className="flex-1 flex items-center justify-center min-w-0 text-left">
          <div className="w-full max-w-[560px]">
            <div className="win98-window">
              <div className="win98-titlebar">
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Kishi - Vault Status Error</span>
                </div>
              </div>
              <div className="win98-window-content p-6 space-y-4">
                <div className="p-3 border border-red-800 bg-red-100 text-red-900 text-xs font-bold">
                  {verifierError || 'Unable to connect to Kishi server.'}
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      void refreshVerifierStatus();
                    }}
                    className="win98-btn win98-btn-default"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (verifierMode === 'setup') {
      return (
        <div className="flex-1 flex items-center justify-center min-w-0 text-left">
          <div className="w-full max-w-[560px]">
            <div className="win98-window">
              <div className="win98-titlebar">
                <div className="flex items-center gap-2">
                  <span>🛡️</span>
                  <span>Kishi - Set Vault Master Password</span>
                </div>

                <div className="flex gap-1">
                  <button
                    type="button"
                    className="win98-titlebar-button"
                    aria-label="Help"
                  >
                    ?
                  </button>
                  <button
                    type="button"
                    className="win98-titlebar-button"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="win98-window-content p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="text-5xl">🔐</div>
                  <div>
                    <h2 className="text-lg font-bold">
                      Establish Vault Master Password
                    </h2>
                    <p className="text-xs mt-1 leading-relaxed">
                      Set a master password to encrypt your vault passwords
                      locally in your browser. Your vault currently has no
                      saved entries or verifier on file—if you previously had
                      an empty vault, you can establish a new master password
                      here.
                    </p>
                  </div>
                </div>

                <div className="mb-4 p-2.5 border border-[#808080] bg-white text-[11px] text-black">
                  Your vault master password is separate from your account
                  login password and is never sent to the server.
                </div>

                <form onSubmit={handleSetupMasterPassword}>
                  <fieldset className="win98-fieldset space-y-3">
                    <legend>Master Password Setup</legend>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label
                          htmlFor="setup-master-password"
                          className="text-sm"
                        >
                          Master Password:
                        </label>
                        <button
                          type="button"
                          className="win98-btn"
                          onClick={() =>
                            setShowUnlockPassword(
                              (previous) => !previous
                            )
                          }
                        >
                          {showUnlockPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>

                      <input
                        id="setup-master-password"
                        type={showUnlockPassword ? 'text' : 'password'}
                        value={masterPasswordInput}
                        onChange={(event) =>
                          setMasterPasswordInput(event.target.value)
                        }
                        placeholder="Create master password (min 8 characters)"
                        autoComplete="new-password"
                        autoFocus
                        className="win98-input w-full"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="confirm-master-password"
                        className="block text-sm mb-2"
                      >
                        Confirm Master Password:
                      </label>
                      <input
                        id="confirm-master-password"
                        type={showUnlockPassword ? 'text' : 'password'}
                        value={confirmMasterPasswordInput}
                        onChange={(event) =>
                          setConfirmMasterPasswordInput(event.target.value)
                        }
                        placeholder="Re-enter master password"
                        autoComplete="new-password"
                        className="win98-input w-full"
                      />
                    </div>

                    {unlockError && (
                      <div className="mt-2 p-2 border border-red-800 bg-red-100 text-red-800 text-xs font-bold">
                        {unlockError}
                      </div>
                    )}
                  </fieldset>

                  <div className="flex justify-end mt-6">
                    <button
                      type="submit"
                      disabled={isVerifying}
                      className="win98-btn win98-btn-default"
                    >
                      {isVerifying
                        ? 'Initializing Verifier...'
                        : 'Set Master Password & Unlock'}
                    </button>
                  </div>
                </form>

                <p className="text-center text-xs mt-8 opacity-80">
                  Keys are derived client-side and held strictly in memory.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex items-center justify-center min-w-0 text-left">
        <div className="w-full max-w-[560px]">
          <div className="win98-window">
            {/*
             * Window title bar
             */}
            <div className="win98-titlebar">
              <div className="flex items-center gap-2">
                <span>🔒</span>
                <span>
                  Kishi - Vault Locked
                </span>
              </div>

              <div className="flex gap-1">
                <button
                  type="button"
                  className="win98-titlebar-button"
                  aria-label="Help"
                >
                  ?
                </button>

                <button
                  type="button"
                  className="win98-titlebar-button"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            {/*
             * Window content
             */}
            <div className="win98-window-content p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="text-5xl">
                  🔐
                </div>

                <div>
                  <h2 className="text-lg font-bold">
                    Encrypted Vault Locked
                  </h2>

                  <p className="text-sm mt-1">
                    Enter your master password
                    to decrypt and access stored
                    credentials.
                  </p>
                </div>
              </div>

              {verifierMode === 'legacy_unlock' && (
                <div className="mb-4 p-2.5 border border-[#808080] bg-white text-[11px] text-black">
                  Legacy vault detected: unlocking will verify your master
                  password against an existing entry and create an encrypted
                  verifier without altering your stored items.
                </div>
              )}

              <form
                onSubmit={handleUnlock}
              >
                <fieldset className="win98-fieldset">
                  <legend>
                    Authentication
                  </legend>

                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="master-password"
                      className="text-sm"
                    >
                      Master Password:
                    </label>

                    <button
                      type="button"
                      className="win98-btn"
                      onClick={() =>
                        setShowUnlockPassword(
                          (previous) =>
                            !previous
                        )
                      }
                    >
                      {showUnlockPassword
                        ? 'Hide'
                        : 'Show'}
                    </button>
                  </div>

                  <input
                    id="master-password"
                    type={
                      showUnlockPassword
                        ? 'text'
                        : 'password'
                    }
                    value={
                      masterPasswordInput
                    }
                    onChange={(event) =>
                      setMasterPasswordInput(
                        event.target.value
                      )
                    }
                    placeholder="Type master password"
                    autoComplete="current-password"
                    autoFocus
                    className="win98-input w-full"
                  />

                  {unlockError && (
                    <div className="mt-2 p-2 border border-red-800 bg-red-100 text-red-800 text-xs font-bold">
                      {unlockError}
                    </div>
                  )}
                </fieldset>

                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="win98-btn win98-btn-default"
                  >
                    {isVerifying ? 'Verifying...' : 'Unlock Vault'}
                  </button>
                </div>
              </form>

              <p className="text-center text-xs mt-8 opacity-80">
                Keys are derived client-side
                and held strictly in memory.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * UNLOCKED VAULT
   * =========================================================
   */
  return (
    <div className="flex-1 flex flex-col min-w-0 text-left">

      {/*
       * -------------------------------------------------------
       * SEARCH + NEW ITEM
       * -------------------------------------------------------
       */}
      <div className="flex items-center justify-between gap-2 pb-2">

        <VaultSearch
          value={searchQuery}
          onChange={setSearchQuery}
          totalCount={entries.length}
          filteredCount={
            filteredEntries.length
          }
        />

        <button
          type="button"
          onClick={() =>
            setIsAddModalOpen(true)
          }
          className="win98-btn win98-btn-default flex items-center gap-1 shrink-0"
        >
          <span>➕</span>
          <span>New Item...</span>
        </button>
      </div>

      {/*
       * -------------------------------------------------------
       * ERROR
       * -------------------------------------------------------
       */}
      {vaultError && (
        <div className="mb-2 p-2 border border-red-800 bg-red-100 text-red-800 text-[11px] font-bold">
          {vaultError}
        </div>
      )}

      {/*
       * -------------------------------------------------------
       * VAULT LIST / LOADING
       * -------------------------------------------------------
       */}
      {isLoading ? (
        <div className="win98-sunken bg-white p-8 flex-1 flex items-center justify-center">
          <Loading message="Decrypting vault credentials with master key..." />
        </div>
      ) : (
        <VaultList
          entries={filteredEntries}
          searchQuery={searchQuery}
          onAddNew={() =>
            setIsAddModalOpen(true)
          }
          onEdit={(entry) =>
            setEditingEntry(entry)
          }
          onDelete={(id, title) =>
            setDeleteTarget({
              id,
              title,
            })
          }
          onToast={(message) =>
            setToastMessage(message)
          }
        />
      )}

      {/*
       * -------------------------------------------------------
       * ADD ENTRY MODAL
       * -------------------------------------------------------
       */}
      <AddEntryModal
        isOpen={isAddModalOpen}
        onClose={() =>
          setIsAddModalOpen(false)
        }
        onAdd={async (newEntry) => {
          await addEntry(newEntry);

          setToastMessage(
            `Added "${newEntry.title}" to vault`
          );
        }}
      />

      {/*
       * -------------------------------------------------------
       * EDIT ENTRY MODAL
       * -------------------------------------------------------
       */}
      <EditEntryModal
        isOpen={
          editingEntry !== null
        }
        entry={editingEntry}
        onClose={() =>
          setEditingEntry(null)
        }
        onSave={async (
          id,
          updated
        ) => {
          await editEntry(
            id,
            updated
          );

          setToastMessage(
            'Item updated successfully'
          );
        }}
      />

      {/*
       * -------------------------------------------------------
       * DELETE CONFIRMATION
       * -------------------------------------------------------
       */}
      <Modal
        isOpen={
          deleteTarget !== null
        }
        onClose={() =>
          setDeleteTarget(null)
        }
        title="Confirm Delete"
        maxWidth="sm"
      >
        <div className="p-4">

          <div className="flex items-start gap-3">
            <div className="text-3xl">
              ⚠️
            </div>

            <div>
              <p className="font-bold">
                Delete this vault entry?
              </p>

              {deleteTarget && (
                <p className="text-sm mt-2">
                  You are about to delete:
                </p>
              )}

              {deleteTarget && (
                <p className="font-bold mt-1">
                  {deleteTarget.title}
                </p>
              )}

              <p className="text-xs mt-3 opacity-80">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              className="win98-btn"
              onClick={() =>
                setDeleteTarget(null)
              }
              disabled={isDeleting}
            >
              Cancel
            </button>

            <button
              type="button"
              className="win98-btn win98-btn-default"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting
                ? 'Deleting...'
                : 'Delete'}
            </button>
          </div>

        </div>
      </Modal>

      {/*
       * -------------------------------------------------------
       * TOAST
       * -------------------------------------------------------
       */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() =>
            setToastMessage(null)
          }
        />
      )}
    </div>
  );
}