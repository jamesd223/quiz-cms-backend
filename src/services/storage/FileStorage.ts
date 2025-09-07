export interface StoredObject {
  url: string;
  width?: number;
  height?: number;
}

export interface FileStorage {
  save(params: {
    buffer: Buffer;
    filename: string;
    contentType: string;
  }): Promise<StoredObject>;
  delete(params: { url: string }): Promise<void>;
}

// no default export for types under verbatimModuleSyntax
