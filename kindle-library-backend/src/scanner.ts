import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';
import db from './db';

const booksRoot = path.join('/Users/ankitthakur/Workspace', 'books');

const encodeImageToBase64 = (filePath: string): string | null => {
  try {
    const imgBuffer = fs.readFileSync(filePath);
    return `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
  } catch (err) {
    console.error('Error encoding image: ', err);
    return null;
  }
};

export const scanBooks = async () => {
  const authors = fs.readdirSync(booksRoot, { withFileTypes: true });

  for (const author of authors) {
    if (author.isDirectory()) {
      const authorPath = path.join(booksRoot, author.name);
      if (fs.statSync(authorPath).isDirectory()) {
        const books = fs.readdirSync(authorPath, { withFileTypes: true });
        for (const book of books) {
          if (book.isDirectory()) {
            const bookPath = path.join(authorPath, book.name);
            const metadataPath = path.join(bookPath, 'metadata.opf');
            const thumbnailPath = path.join(bookPath, 'cover.jpg');
            const files = fs.readdirSync(bookPath);
            const mobiFile = files.find((file) => file.endsWith('.mobi'));
            const mobiPath = mobiFile ? path.join(bookPath, mobiFile) : null;

            let thumbnailBase64 = null;
            if (fs.existsSync(thumbnailPath)) {
              thumbnailBase64 = encodeImageToBase64(thumbnailPath);
            }

            // Extract metadata
            if (fs.existsSync(metadataPath)) {
              const metadata = await extractMetadata(metadataPath);
              // Insert book data into the db
              try {
                const stmt = db.prepare(
                  'INSERT INTO book_fts (title, authors, summary, genre, thumbnail_base64, book_path) VALUES (?, ?, ?, ?, ?, ?)'
                );
                stmt.run(
                  metadata.title,
                  metadata.authors,
                  metadata.summary,
                  metadata.genre,
                  thumbnailBase64,
                  mobiPath
                );
                console.log(
                  `Book added: ${metadata.title} by ${metadata.authors}`
                );
              } catch (err) {
                console.error('Error persisting book: ', err);
              }
            }
          }
        }
      }
    }
  }
};

const extractMetadata = async (filePath: string) => {
  const xmlData = fs.readFileSync(filePath, 'utf-8');
  const parsedData = await parseStringPromise(xmlData);
  const metadata = parsedData.package.metadata[0];
  const title = metadata['dc:title']?.[0] || 'Unknown Title';
  // Extract multiple authors dynamically
  const allAuthors = metadata['dc:creator']?.map((creator: any) =>
    creator._.trim()
  ) || ['Unknown Author'];
  const authors = allAuthors.join(', ');
  const summary = metadata['dc:description']?.[0] || 'No summary available';
  const genre = metadata['dc:subject']?.[0] || 'Unknown genre';
  return { title, authors, summary, genre };
};

// const testFilePath = path.join(
//   '/Users/ankitthakur/Workspace/books',
//   'A. Bertram Chandler',
//   'The Big Black Mark (10229)'
// );

// const runTest = async () => {
//   try {
//     const metadata = await extractMetadata(testFilePath);
//     console.log('Extracted Metadata:', metadata);
//   } catch (error) {
//     console.error('Error extracting metadata:', error);
//   }
// };
