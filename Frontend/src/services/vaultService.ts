import { apiRequest } from './api';
import type {
  VaultRequest,
  VaultResponse,
  VaultVerifierRequest,
  VaultVerifierResponse,
} from '../types/vault';

export async function getVaultEntries(
  token: string
): Promise<VaultResponse[]> {
  return apiRequest<VaultResponse[]>('/api/vault', {
    method: 'GET',
    token,
  });
}

export async function getVaultEntry(
  id: number | string,
  token: string
): Promise<VaultResponse> {
  return apiRequest<VaultResponse>(`/api/vault/${id}`, {
    method: 'GET',
    token,
  });
}

export async function createVaultEntry(
  entry: VaultRequest,
  token: string
): Promise<VaultResponse> {
  return apiRequest<VaultResponse>('/api/vault', {
    method: 'POST',
    token,
    body: JSON.stringify(entry),
  });
}

export async function updateVaultEntry(
  id: number | string,
  entry: VaultRequest,
  token: string
): Promise<VaultResponse> {
  return apiRequest<VaultResponse>(`/api/vault/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(entry),
  });
}

export async function deleteVaultEntry(
  id: number | string,
  token: string
): Promise<string> {
  return apiRequest<string>(`/api/vault/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function searchVaultEntries(
  title: string,
  token: string
): Promise<VaultResponse[]> {
  return apiRequest<VaultResponse[]>(
    `/api/vault/search?title=${encodeURIComponent(title)}`,
    {
      method: 'GET',
      token,
    }
  );
}

export async function getVaultVerifier(
  token: string
): Promise<VaultVerifierResponse> {
  return apiRequest<VaultVerifierResponse>('/api/vault/verifier', {
    method: 'GET',
    token,
  });
}

export async function createVaultVerifier(
  encryptedVerifier: string,
  token: string
): Promise<VaultVerifierResponse> {
  const payload: VaultVerifierRequest = { encryptedVerifier };
  return apiRequest<VaultVerifierResponse>('/api/vault/verifier', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}