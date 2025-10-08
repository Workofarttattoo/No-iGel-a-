import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export type VerificationRecord = {
  id: string;
  userId: string;
  bucketKey: string;
  createdAt: string;
  status: "pending" | "verified";
  consentTimestamp?: string;
};

const verificationRecords = new Map<string, VerificationRecord>();
const storageRoot = path.join(process.cwd(), "backend-storage", "id-fronts");

const persistBuffer = async (bucketKey: string, buffer: Buffer) => {
  const absolutePath = path.join(storageRoot, bucketKey);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, buffer);
};

export const storeIdFront = async (fileBuffer: Buffer, userId: string): Promise<VerificationRecord> => {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const bucketKey = path.join(userId, `${id}.jpg`);

  await persistBuffer(bucketKey, fileBuffer);

  const record: VerificationRecord = {
    id,
    userId,
    bucketKey,
    createdAt,
    status: "pending"
  };

  verificationRecords.set(id, record);
  return record;
};

export const acknowledgeConsent = async (verificationId: string): Promise<VerificationRecord> => {
  const record = verificationRecords.get(verificationId);
  if (!record) {
    throw new Error("Verification record not found");
  }

  const updated: VerificationRecord = {
    ...record,
    consentTimestamp: new Date().toISOString(),
    status: "verified"
  };

  verificationRecords.set(verificationId, updated);
  return updated;
};

export const getVerificationRecord = (verificationId: string) => {
  return verificationRecords.get(verificationId) ?? null;
};
