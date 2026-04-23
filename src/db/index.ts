import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.js';
import path from 'path';

// ensure the db file sits in project root or /tmp depending on environment constraints. We'll put it in project root for local dev.
const dbPath = path.resolve(process.cwd(), 'sqlite.db');
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
