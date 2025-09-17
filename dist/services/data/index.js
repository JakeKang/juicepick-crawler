"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_js_1 = __importDefault(require("../../config.js"));
var json_file_datastore_js_1 = require("./json-file.datastore.js");
var supabase_datastore_js_1 = require("./supabase.datastore.js");
var dataStore;
if (config_js_1.default.NODE_ENV === 'production') {
    console.log('Initializing Supabase data store for production.');
    dataStore = new supabase_datastore_js_1.SupabaseDataStore();
}
else {
    console.log('Initializing JSON file data store for development/test.');
    dataStore = new json_file_datastore_js_1.JsonFileDataStore();
}
exports.default = dataStore;
//# sourceMappingURL=index.js.map