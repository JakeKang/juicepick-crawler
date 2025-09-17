import { type IDataStore, type CrawledResult } from './datastore.interface.js';
export declare class JsonFileDataStore implements IDataStore {
    private readDb;
    private writeDb;
    save(result: CrawledResult): Promise<void>;
}
//# sourceMappingURL=json-file.datastore.d.ts.map