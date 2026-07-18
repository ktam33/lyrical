import path from 'path';
import Database from 'better-sqlite3';

export interface Entry {
  id: number;
  character: string;
  jyutping: string;
  definition: string;
  source: string | null;
}

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'lyrical.db');
    db = new Database(dbPath);
  }
  return db;
}

export interface ListEntriesOptions {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ListEntriesResult {
  entries: Entry[];
  total: number;
  page: number;
  pageSize: number;
}

export function listEntries({
  search = '',
  page = 1,
  pageSize = 50,
}: ListEntriesOptions = {}): ListEntriesResult {
  const database = getDb();
  const trimmedSearch = search.trim();
  const offset = (page - 1) * pageSize;

  if (trimmedSearch) {
    const like = `%${trimmedSearch}%`;
    const total = database
      .prepare(
        'SELECT COUNT(*) as count FROM entries WHERE character LIKE ? OR jyutping LIKE ? OR definition LIKE ?'
      )
      .get(like, like, like) as { count: number };

    const entries = database
      .prepare(
        'SELECT * FROM entries WHERE character LIKE ? OR jyutping LIKE ? OR definition LIKE ? ORDER BY id LIMIT ? OFFSET ?'
      )
      .all(like, like, like, pageSize, offset) as Entry[];

    return { entries, total: total.count, page, pageSize };
  }

  const total = database.prepare('SELECT COUNT(*) as count FROM entries').get() as {
    count: number;
  };
  const entries = database
    .prepare('SELECT * FROM entries ORDER BY id LIMIT ? OFFSET ?')
    .all(pageSize, offset) as Entry[];

  return { entries, total: total.count, page, pageSize };
}

export function getEntryById(id: number): Entry | undefined {
  const database = getDb();
  return database.prepare('SELECT * FROM entries WHERE id = ?').get(id) as Entry | undefined;
}

export function updateEntry(
  id: number,
  fields: { character: string; jyutping: string; definition: string; source: string | null }
): Entry | undefined {
  const database = getDb();
  const { character, jyutping, definition, source } = fields;
  database
    .prepare('UPDATE entries SET character = ?, jyutping = ?, definition = ?, source = ? WHERE id = ?')
    .run(character, jyutping, definition, source, id);
  return getEntryById(id);
}

export function findEntriesByCharacter(character: string): Entry[] {
  const database = getDb();
  return database
    .prepare('SELECT * FROM entries WHERE character = ? ORDER BY id')
    .all(character) as Entry[];
}
