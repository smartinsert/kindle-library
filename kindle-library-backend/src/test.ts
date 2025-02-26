import fs from 'fs';
import path from 'path';

// Function to find .mobi file inside a book directory
const findMobiFile = (bookPath: string): string | null => {
  const files = fs.readdirSync(bookPath);
  const mobiFile = files.find((file) => file.endsWith('.mobi'));
  return mobiFile ? path.join(bookPath, mobiFile) : null;
};

const bookDir = path.join(
  '/Users/ankitthakur/Workspace/books',
  'A. Bertram Chandler',
  'The Big Black Mark (10229)'
);

// Run the function
const foundMobiPath = findMobiFile(bookDir);

console.log(`${foundMobiPath}`);

function convertToSpaceSeparated(url: any) {
  // Decode the URL
  const decodedPath = decodeURIComponent(url);

  // Remove the base URL part
  const baseUrl = 'http://localhost:5000/epub/';
  if (decodedPath.startsWith(baseUrl)) {
    const filePath = decodedPath.replace(baseUrl, '');

    // Replace "/" with spaces
    return filePath.replace(/\//g, ' ');
  }

  return decodedPath.replace(/\//g, ' '); // Fallback
}

const url =
  'http://localhost:5000/epub/%2FUsers%2Fankitthakur%2FWorkspace%2Fbooks%2FA.%20Bertram%20Chandler%2FThe%20Broken%20Cycle%20(10228)%2FThe%20Broken%20Cycle%20-%20A.%20Bertram%20Chandler/META-INF/container.xml';

console.log(convertToSpaceSeparated(url));
