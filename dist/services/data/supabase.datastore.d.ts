import { type IDataStore, type CrawledResult } from './datastore.interface.js';
export declare class SupabaseDataStore implements IDataStore {
    private client;
    constructor();
    save(result: CrawledResult): Promise<void>;
}
//# sourceMappingURL=supabase.datastore.d.ts.map