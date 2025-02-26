# Kindle Library

## 📖 Overview
Kindle Library is a **self-hosted book management system** that allows users to **search, view, and read EPUB books** directly from their local storage. The project is built using **React, Express.js, and SQLite**, ensuring a lightweight and efficient experience.

## 🚀 Features
- **Search books by title or author** using full-text search (FTS5 in SQLite).
- **Read EPUB books** directly within the browser.
- **Convert MOBI to EPUB** for better compatibility.
- **Material Design UI** for a clean and modern interface.
- **Store metadata** including summary, genre, and multiple authors.

## 🏗 Tech Stack
### **Frontend**
- **React.js (Vite)** for a fast and optimized UI.
- **Tailwind CSS** for styling.
- **Material UI** components.

### **Backend**
- **Express.js (TypeScript)** as the REST API server.
- **SQLite** for efficient book storage and full-text search.
- **Apache Solr (optional)** for advanced search capabilities.

### **Storage**
- **Local file system (default)**
- **Network Attached Storage (NAS) (optional)**

## 📂 Project Structure
```
kindle-library/
├── kindle-library-frontend/  # React frontend
├── kindle-library-backend/   # Express backend
└── books.db                  # SQLite database (ignored in Git)
```

## ⚡ Installation & Setup
### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/smartinsert/kindle-library.git
cd kindle-library
```

### **2️⃣ Backend Setup**
```sh
cd kindle-library-backend
npm install
npm run dev  # Starts the backend server at http://localhost:5000
```

### **3️⃣ Frontend Setup**
```sh
cd ../kindle-library-frontend
npm install
npm run dev  # Starts the frontend at http://localhost:3000
```

### **4️⃣ Run the Full Application**
- Open **http://localhost:3000** in your browser.

## 📚 Book Storage Format
Books are stored in the following structure:
```
📂 Author Name
   ├── 📂 Book Title
   │   ├── metadata.opf   # Metadata file
   │   ├── cover.jpg      # Thumbnail image
   │   ├── book.mobi      # Original book
   │   ├── book.epub      # Converted EPUB (if applicable)
```

## 🔎 Search Functionality
- Uses **SQLite FTS5** for fast title and author search.
- Optional integration with **Apache Solr** for better scalability.

## 🛠 Development Notes
- Ensure **Node.js 18+** is installed.
- `books.db` is ignored in `.gitignore` to prevent unnecessary large file commits.

## 🏗 Future Improvements
- Implement **user authentication**.
- Add **book tagging & categorization**.
- Support **more file formats (PDF, AZW3, etc.)**.

## 📜 License
This project is open-source under the **MIT License**.


