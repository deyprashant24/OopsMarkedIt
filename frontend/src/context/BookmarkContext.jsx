import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api'; 

const BookmarkContext = createContext();

export const useBookmarks = () => useContext(BookmarkContext);

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch Bookmarks (Universal: All Marks or by Collection)
  // useCallback isliye use kiya taaki useEffect mein dependency warning na aaye
  const fetchBookmarks = useCallback(async (collectionId = null) => {
    setLoading(true);
    setError(null);
    try {
      // 💡 Logic: Agar collectionId hai toh query param bhejenge
      const url = collectionId ? `/bookmarks?collectionId=${collectionId}` : '/bookmarks';
      const response = await api.get(url);
      
      if (response.data.success) {
        setBookmarks(response.data.data);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Failed to load bookmarks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load (All marks)
  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  // 2. Add Bookmark (Scrape + Save)
  const addBookmark = async (url) => {
    setLoading(true);
    try {
      const response = await api.post('/bookmarks', { url });
      if (response.data.success) {
        // Optimistic Update: Naya mark list mein sabse upar
        setBookmarks((prev) => [response.data.data, ...prev]);
        return { success: true };
      }
    } catch (err) {
      console.error("Add Error:", err);
      return { 
        success: false, 
        message: err.response?.data?.message || "Failed to add bookmark" 
      };
    } finally {
      setLoading(false);
    }
  };

  // 3. Delete Bookmark
  const deleteBookmark = async (id) => {
    try {
      // await api.delete(`/bookmarks/${id}`);
      setBookmarks((prev) => prev.filter((mark) => mark.id !== id));
      return { success: true };
    } catch (err) {
      console.error("Delete Error:", err);
      return { success: false };
    }
  };

  return (
    <BookmarkContext.Provider value={{ 
      bookmarks, 
      loading, 
      error, 
      fetchBookmarks, 
      addBookmark, 
      deleteBookmark 
    }}>
      {children}
    </BookmarkContext.Provider>
  );
};