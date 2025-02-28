import React, { useCallback, useEffect, useRef, useState } from 'react';
import ePub, { Rendition, Location, Book } from 'epubjs';
import JSZip from 'jszip';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  Close as CloseIcon,
  Fullscreen,
  FullscreenExit,
  Bookmark,
  NavigateBefore,
  NavigateNext,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material';

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

  const viewerRef = useRef<HTMLDivElement | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const bookRef = useRef<Book | null>(null);
  const [location, setLocation] = useState<string | null>(
    localStorage.getItem('epub-location')
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [toc, setToc] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isViewerReady, setIsViewerReady] = useState<boolean>(false);

  const setViewerRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      viewerRef.current = node;
      setIsViewerReady(true);
    }
  }, []);

  useEffect(() => {
    (window as any).JSZip = JSZip;
    if (!isViewerReady || !viewerRef.current) {
      return;
    }
    const bookInstance = ePub(fileUrl, { openAs: 'epub' });
    bookRef.current = bookInstance;
    const rendition = bookInstance.renderTo(viewerRef.current, {
      width: '100%',
      height: '100%',
      flow: 'paginated',
    });
    renditionRef.current = rendition;

    if (location) {
      rendition.display(location || undefined);
    } else {
      rendition.display();
    }

    rendition.on('relocated', (location: Location) => {
      setLocation(location.start.cfi);
      localStorage.setItem('epub-location', location.start.cfi);
    });

    // Load Table of Contents (ToC)
    bookInstance.ready
      .then(() => bookInstance.navigation.toc)
      .then((toc) => {
        setToc(toc);
      });

    return () => bookInstance.destroy();
  }, [isViewerReady]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleThemeChange = (event: SelectChangeEvent) => {
    const newTheme = event.target.value as string;
    setTheme(newTheme);
    if (renditionRef.current) {
      renditionRef.current.themes.select(newTheme);
    }
  };

  // Navigate to a specific chapter from the ToC
  const handleTocClick = (href: string) => {
    if (renditionRef.current) {
      renditionRef.current.display(href);
    }
    setIsDrawerOpen(false);
  };

  // Move to the previous chapter
  const prevPage = () => {
    if (renditionRef.current) {
      renditionRef.current.prev();
    }
  };

  // Move to the next chapter
  const nextPage = () => {
    if (renditionRef.current) {
      renditionRef.current.next();
    }
  };

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
  };

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
      {/* Header with controls inside DialogTitle */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Table of Contents */}
          <IconButton
            onClick={toggleDrawer}
            sx={{ color: 'white' }}
          >
            <MenuBookIcon />
          </IconButton>

          {bookTitle}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Navigation Controls */}
          <IconButton
            onClick={prevPage}
            sx={{ color: 'white' }}
          >
            <NavigateBefore />
          </IconButton>

          <IconButton
            onClick={nextPage}
            sx={{ color: 'white' }}
          >
            <NavigateNext />
          </IconButton>

          {/* Theme Selector */}
          <Select
            value={theme}
            onChange={handleThemeChange}
            sx={{
              color: 'white',
              backgroundColor: '#333',
              '& .MuiSelect-icon': { color: 'white' },
            }}
          >
            <MenuItem value='light'>Light</MenuItem>
            <MenuItem value='dark'>Dark</MenuItem>
            <MenuItem value='sepia'>Sepia</MenuItem>
          </Select>

          {/* Fullscreen Toggle */}
          <IconButton
            onClick={toggleFullscreen}
            sx={{ color: 'white' }}
          >
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>

          {/* Bookmark */}
          <IconButton sx={{ color: 'white' }}>
            <Bookmark />
          </IconButton>

          {/* Close Button */}
          <IconButton
            onClick={onClose}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>

      {/* Table of Contents Drawer (inside DialogTitle) */}
      <Drawer
        anchor='left'
        open={isDrawerOpen}
        onClose={toggleDrawer}
        variant='persistent' // This ensures it pushes content instead of overlaying
        sx={{
          width: '250px',
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: '250px',
            position: 'absolute', // Keeps it inside Dialog
            top: '76px',
            marginTop: '0px', // no overlap
            height: 'calc(100% - 76px)',
            boxShadow: 'none',
          },
        }}
      >
        <List>
          {toc.map((item, index) => (
            <ListItem
              key={index}
              disablePadding
            >
              <ListItemButton onClick={() => handleTocClick(item.href)}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content (Epub Reader) */}
      <DialogContent
        sx={{
          padding: 0,
          height: '80vh',
          display: 'flex',
          transition: 'margin 0.3s ease',
          marginLeft: isDrawerOpen ? '250px' : '0px',
        }}
      >
        <div
          ref={setViewerRef}
          style={{ width: '100%', height: '100%', backgroundColor: '#f5f5f5' }}
        ></div>
      </DialogContent>
    </Dialog>
  );
};

export default EpubReader;
