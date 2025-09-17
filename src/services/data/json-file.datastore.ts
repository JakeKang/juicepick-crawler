import { promises as fs } from 'fs';
import path from 'path';
import { type IDataStore, type CrawledResult } from './datastore.interface.js';

const DB_PATH = path.join(process.cwd(), 'crawled-data.json');

export class JsonFileDataStore implements IDataStore {
    private async readDb(): Promise<CrawledResult[]> {
        try {
            await fs.access(DB_PATH);
            const fileContent = await fs.readFile(DB_PATH, { encoding: 'utf-8' });
            return JSON.parse(fileContent) as CrawledResult[];
        } catch (error) {
            // 파일이 없거나 비어있는 경우
            return [];
        }
    }

    private async writeDb(data: CrawledResult[]): Promise<void> {
        await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), { encoding: 'utf-8' });
    }

    async save(result: CrawledResult): Promise<void> {
        const db = await this.readDb();
        db.push(result);
        await this.writeDb(db);
        console.log(`[JsonFileDataStore] Data for ${result.url} saved to ${DB_PATH}`);
    }
}
