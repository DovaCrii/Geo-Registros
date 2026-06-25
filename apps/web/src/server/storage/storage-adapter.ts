export interface StorageAdapter {
  save(path: string, content: Buffer): Promise<void>;
  exists(path: string): Promise<boolean>;
}

export class LocalStorageAdapterNotImplemented implements StorageAdapter {
  async save(_path: string, _content: Buffer): Promise<void> {
    throw new Error("Local storage adapter is not implemented yet.");
  }

  async exists(_path: string): Promise<boolean> {
    throw new Error("Local storage adapter is not implemented yet.");
  }
}
