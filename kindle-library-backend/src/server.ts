import express, { Request, Response } from 'express';
import path from 'path';
import db from './db';
import cors from 'cors';
import fs from 'fs';
import unzipper from 'unzipper';
import { exec } from 'child_process';
import util from 'util';
import { scanBooks } from './scanner';
import { Book } from './types';

const app = express();
app.use(express.json());

const allowedOrigins = ['http://localhost:5173'];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);
const execPromise = util.promisify(exec);

const getImageUrl = (filePath: string | null) => {
  return filePath
    ? `http://localhost:5000/books/${filePath.split('/books/')[1]}`
    : null;
};

const booksDir = path.join('/Users/ankitthakur/Workspace/books');

console.log(`Serving EPUBs from: ${booksDir}`);

app.use('/epub', (req, res, next) => {
  let decodedPath = decodeURIComponent(req.path);
  // Ensure the path is relative to the 'books/' directory
  if (decodedPath.startsWith('/Users/ankitthakur/Workspace/books/')) {
    decodedPath = decodedPath.replace(
      '/Users/ankitthakur/Workspace/books/',
      '/'
    );
  }

  if (decodedPath.startsWith('//Users/ankitthakur/Workspace/books/')) {
    decodedPath = decodedPath.replace(
      '//Users/ankitthakur/Workspace/books/',
      '/'
    );
  }

  console.log('Final request path:', decodedPath);
  // Update req.url to match express.static()'s expectation
  req.url = decodedPath;
  next();
});

app.use('/epub', express.static(booksDir));

// Add a book
app.post('/books', (req: Request, res: Response) => {
  const { title, author, metadata_path, thumbnail_path, book_path } = req.body;

  const stmt = db.prepare(
    'INSERT INTO book_fts (title, author, metadata_path, thumbnail_path, book_path) VALUES (?, ?, ?, ?, ?)'
  );

  stmt.run(title, author, metadata_path, thumbnail_path, book_path);

  res.json({ message: 'Book added successfully!' });
});

app.get('/books', (req: Request, res: Response) => {
  try {
    const stmt = db.prepare('SELECT * FROM book_fts LIMIT 10');
    const books = stmt.all() as Book[];

    // Append correct image URLs
    const booksWithImages = books.map((book) => ({
      ...book,
      thumbnail_url: getImageUrl(book.thumbnail_base64),
    }));

    res.json(booksWithImages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Search for books
app.get('/search/books', (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    console.log(`Query is ${query}`);
    const stmt = db.prepare('SELECT * FROM book_fts WHERE title MATCH ?');
    const books = stmt.all(query) as Book[];

    const booksWithImages = books.map((book) => ({
      ...book,
      thumbnail_path: getImageUrl(book.thumbnail_base64),
    }));

    res.json(booksWithImages);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Search for authors
app.get('/search/authors', (req: Request, res: Response) => {
  const query = req.query.q as string;
  console.log(`Query is ${query}`);
  const stmt = db.prepare('SELECT * FROM book_fts WHERE authors MATCH ?');
  const results = stmt.all(query);

  res.json(results);
});

// Convert to epub
app.post('/convert', (req: Request, res: Response) => {
  (async () => {
    try {
      const { bookPath } = req.body;

      if (!bookPath || !bookPath.endsWith('.mobi')) {
        return res
          .status(400)
          .json({ error: 'Only .mobi files are supported!' });
      }

      const absoluteEpubPath = bookPath.replace('.mobi', '.epub');

      console.log(`Mobi path: ${bookPath}`);

      if (!fs.existsSync(bookPath)) {
        return res.status(404).json({ error: 'Mobi file not found' });
      }

      if (fs.existsSync(absoluteEpubPath)) {
        console.log('EPUB already exists');
      } else {
        await execPromise(`ebook-convert "${bookPath}" "${absoluteEpubPath}"`);
      }

      return res.json({
        message: 'Conversion and extraction successful',
        epubPath: absoluteEpubPath.replace(`${__dirname}/../books/`, ''),
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to process book',
        details: (error as Error).message,
      });
    }
  })();
});

app.get('/scan', async (_req: Request, res: Response) => {
  try {
    await scanBooks();
    res.json({ message: 'Books scanned and added successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error scanning books', error: err });
  }
});

// Start server
app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
