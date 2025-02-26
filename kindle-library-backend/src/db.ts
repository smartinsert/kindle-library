import Database from 'better-sqlite3';

const db = new Database('books.db');

db.prepare(
  `CREATE VIRTUAL TABLE IF NOT EXISTS book_fts USING fts5(
    title,
    authors,
    summary,
    genre,
    thumbnail_base64,
    book_path
    )`
).run();

export default db;
