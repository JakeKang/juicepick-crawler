import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { type IDataStore, type CrawledResult } from './datastore.interface.js';
import config from '../../config.js';

export class SupabaseDataStore implements IDataStore {
    private client: SupabaseClient;

    constructor() {
        if (!config.SUPABASE_URL || !config.SUPABASE_KEY) {
            throw new Error('Supabase URL or Key is not defined in the environment variables.');
        }
        this.client = createClient(config.SUPABASE_URL, config.SUPABASE_KEY);
    }

    async save(result: CrawledResult): Promise<void> {
        // 'crawled_results' 부분을 실제 Supabase 테이블 이름으로 변경해주세요.
        const { error } = await this.client
            .from('crawled_results') 
            .insert([
                {
                    url: result.url,
                    crawled_at: result.crawledAt,
                    data: result.data,
                },
            ]);

        if (error) {
            console.error(`[SupabaseDataStore] Error saving data for ${result.url}:`, error);
            throw error;
        }

        console.log(`[SupabaseDataStore] Data for ${result.url} saved successfully.`);
    }
}
