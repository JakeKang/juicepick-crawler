import config from '../../config.js';
import { type IDataStore } from './datastore.interface.js';
import { JsonFileDataStore } from './json-file.datastore.js';
import { SupabaseDataStore } from './supabase.datastore.js';

let dataStore: IDataStore;

if (config.NODE_ENV === 'production') {
    console.log('Initializing Supabase data store for production.');
    dataStore = new SupabaseDataStore();
} else {
    console.log('Initializing JSON file data store for development/test.');
    dataStore = new JsonFileDataStore();
}

export default dataStore;
