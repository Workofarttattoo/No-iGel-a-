import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
const verificationRecords = new Map();
const storageRoot = path.join(process.cwd(), "backend-storage", "id-fronts");
const persistBuffer = async (bucketKey, buffer) => {
    const absolutePath = path.join(storageRoot, bucketKey);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, buffer);
};
export const storeIdFront = async (fileBuffer, userId) => {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const bucketKey = path.join(userId, `${id}.jpg`);
    await persistBuffer(bucketKey, fileBuffer);
    const record = {
        id,
        userId,
        bucketKey,
        createdAt,
        status: "pending"
    };
    verificationRecords.set(id, record);
    return record;
};
export const acknowledgeConsent = async (verificationId) => {
    const record = verificationRecords.get(verificationId);
    if (!record) {
        throw new Error("Verification record not found");
    }
    const updated = {
        ...record,
        consentTimestamp: new Date().toISOString(),
        status: "verified"
    };
    verificationRecords.set(verificationId, updated);
    return updated;
};
export const getVerificationRecord = (verificationId) => {
    return verificationRecords.get(verificationId) ?? null;
};
