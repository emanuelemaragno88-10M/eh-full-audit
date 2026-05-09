import { kvGet, kvSet } from './kv';
import crypto from 'crypto';

export type AuditStatus =
  | 'paid'
  | 'verified'
  | 'shopify_connected'
  | 'meta_connected'
  | 'generating'
  | 'complete'
  | 'failed';

export interface AuditRecord {
  id: string;
  orderId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  phoneVerified?: boolean;
  shopifyStore?: string;
  shopifyToken?: string;
  metaToken?: string;
  metaAdAccountId?: string;
  status: AuditStatus;
  auditResult?: any;
  generatingProgress?: { step: number; label: string };
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

const KEY = (id: string) => `audit:${id}`;
const ORDER_KEY = (orderId: string) => `order:${orderId}`;

export async function createAudit(email: string, orderId?: string): Promise<AuditRecord> {
  const id = crypto.randomUUID();
  const record: AuditRecord = {
    id,
    orderId,
    email,
    status: 'paid',
    createdAt: new Date().toISOString(),
  };
  await kvSet(KEY(id), record);
  if (orderId) await kvSet(ORDER_KEY(orderId), id);
  return record;
}

export async function getAudit(id: string): Promise<AuditRecord | null> {
  return kvGet<AuditRecord>(KEY(id));
}

export async function getAuditByOrderId(orderId: string): Promise<AuditRecord | null> {
  const id = await kvGet<string>(ORDER_KEY(orderId));
  if (!id) return null;
  return getAudit(id);
}

export async function updateAudit(id: string, patch: Partial<AuditRecord>): Promise<AuditRecord | null> {
  const current = await getAudit(id);
  if (!current) return null;
  const updated: AuditRecord = { ...current, ...patch };
  await kvSet(KEY(id), updated);
  return updated;
}
