import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Grid,
  Typography,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Box,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import axios from 'axios';
import { Book } from '../types/types';
import BookCard from './book';

const Home: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAllBooks();
  }, []);

  const fetchAllBooks = useCallback(async () => {
    try {
      const response = await axios.get<Book[]>('http://localhost:5000/books');
      setBooks(response.data);
    } catch (err) {
      console.error('Error fetching books: ', err);
    }
  }, []);

  const handleSearch = async () => {
    try {
      const [bookResponse, authorResponse] = await Promise.allSettled([
        axios.get<Book[]>(
          `http://localhost:5000/search/books?q=${searchQuery}`
        ),
        axios.get<Book[]>(
          `http://localhost:5000/search/authors?q=${searchQuery}`
        ),
      ]);
      const books =
        bookResponse.status === 'fulfilled' ? bookResponse.value.data : [];
      const authors =
        authorResponse.status === 'fulfilled' ? authorResponse.value.data : [];
      const combinedResult = [...books, ...authors];
      setBooks(combinedResult);
    } catch (error) {
      console.error('Error searching books:', error);
    }
  };

  return (
    <Container>
      {/* Navbar */}
      <AppBar
        position='static'
        sx={{
          backgroundColor: '#F8F9FA',
          boxShadow: 'none',
          padding: 1,
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: '#F4F1EC',
          }}
        >
          <Button
            sx={{
              textTransform: 'none',
              color: '#333',
            }}
            onClick={fetchAllBooks}
          >
            <Typography
              variant='h5'
              fontFamily='DM Serif Display'
              fontWeight='bold'
            >
              Kindle Library
            </Typography>
          </Button>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F4F1EC',
              borderRadius: '20px',
              paddingX: 2,
            }}
          >
            <TextField
              variant='standard'
              placeholder='Search books or authors...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (searchQuery.length > 0) {
                    handleSearch();
                  } else {
                    fetchAllBooks();
                  }
                }
              }}
              sx={{ width: 250 }}
            />
            <IconButton onClick={handleSearch}>
              <SearchIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Bookshelf Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginY: 2,
          backgroundColor: '#F4F1EC',
          padding: 2,
          width: '97.5%',
        }}
      >
        <img
          src='/bookshelf.png'
          alt='Bookshelf'
          style={{
            width: '120%',
            maxWidth: '1300px',
            height: 'auto',
            maxHeight: '180px',
            objectFit: 'cover',
          }}
        />
      </Box>

      {/* Book Grid */}
      <Grid
        container
        spacing={3}
        mt={3}
      >
        {books.map((book) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            key={book.title}
          >
            <BookCard book={book} />
          </Grid>
        ))}
      </Grid>

      {/* Floating Sort Button */}
      <Button
        variant='contained'
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          backgroundColor: '#F4F1EC',
          borderRadius: '50%',
        }}
      >
        <SortIcon sx={{ color: 'black' }} />
      </Button>
    </Container>
  );
};

export default Home;
