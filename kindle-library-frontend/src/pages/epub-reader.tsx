import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface EpubReaderProps {
  bookTitle: string;
  epubLocation: string;
  onClose: () => void;
}

const EpubReader: React.FC<EpubReaderProps> = ({
  epubLocation,
  bookTitle,
  onClose,
}) => {
  if (!epubLocation) return null;

  // Convert the local EPUB path to a URL
  const fileUrl = `http://localhost:5000/epub/${encodeURIComponent(
    epubLocation
  )}`;

  return (
    <Dialog
      open
      fullWidth
      maxWidth='lg'
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.2)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#333',
          color: '#fff',
          padding: '10px 16px',
        }}
      >
        {bookTitle}
        <IconButton
          onClick={onClose}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ padding: 0, height: '80vh' }}>
        <iframe
          src={`http://localhost:8080?bookPath=${fileUrl}`}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: '#f5f5f5',
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EpubReader;
