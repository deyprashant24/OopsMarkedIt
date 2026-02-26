import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Import our contexts
import { AuthProvider } from './context/AuthContext';
import { BookmarkProvider } from './context/BookmarkContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BookmarkProvider>
        <App />
      </BookmarkProvider>
    </AuthProvider>
  </StrictMode>,
)