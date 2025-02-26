import React, { useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from '@mui/material';
import { Book } from '../types/types';
import EpubReader from './epub-reader';

const BookCard: React.FC<{ book: Book }> = ({ book }) => {
  const [epubPath, setEpubPath] = useState<string | null>(null);

  const handleConvertAndRead = async () => {
    try {
      const response = await axios.post('http://localhost:5000/convert', {
        bookPath: book.book_path,
      });
      setEpubPath(response.data.epubPath);
    } catch (err) {
      console.error('Error converting book: ', err);
    }
  };

  return (
    <>
      <Card
        sx={{ maxWidth: 345, boxShadow: 3, cursor: 'pointer' }}
        onClick={handleConvertAndRead}
      >
        <CardActionArea>
          <CardMedia
            component='img'
            height='140'
            image={book.thumbnail_base64}
            alt={book.title}
          />
          <CardContent>
            <Typography
              gutterBottom
              variant='h6'
              component='div'
            >
              {book.title}
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
            >
              {book.authors}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>

      {epubPath && (
        <EpubReader
          epubLocation={epubPath}
          bookTitle={book.title}
          onClose={() => setEpubPath(null)}
        />
      )}
    </>
  );
};

export default BookCard;
