import type { FileStorage, StoredObject } from "./FileStorage.js";

export class LocalStubStorage implements FileStorage {
  async save(params: {
    buffer: Buffer;
    filename: string;
    contentType: string;
  }): Promise<StoredObject> {
    // For now, return placeholder URL. Persist metadata only in DB elsewhere.
    const url = `https://placeholder.local/${encodeURIComponent(
      params.filename
    )}`;
    return { url };
  }

  async delete(_params: { url: string }): Promise<void> {
    // No-op for stub
  }
}

export default LocalStubStorage;
