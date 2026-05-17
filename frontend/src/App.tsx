import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  api, 
  getAuthToken, 
  clearAuth, 
  getSavedUsername, 
  isMockMode, 
  setMockMode 
} from './api';
import type { Book, Rental } from './api';
import './App.css';

// Custom inline SVG icons for premium styling
const Icons = {
  Book: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  History: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  ),
  LogOut: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
    </svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
    </svg>
  )
};

function App() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [username, setUsername] = useState<string | null>(getSavedUsername());
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [mockActive, setMockActive] = useState<boolean>(isMockMode());

  // Form states
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');

  // UI state for editing a book
  const [editingBookId, setEditingBookId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingAuthor, setEditingAuthor] = useState('');

  // Notification states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  // --- TanStack Query Hooks ---

  // 1. Fetch Books
  const { data: books = [], isLoading: loadingBooks } = useQuery<Book[]>({
    queryKey: ['books', mockActive],
    queryFn: api.getAllBooks,
    enabled: !!token,
  });

  // 2. Fetch Rental History
  const { data: rentals = [], isLoading: loadingHistory } = useQuery<Rental[]>({
    queryKey: ['rentals', mockActive],
    queryFn: api.getHistory,
    enabled: !!token,
  });

  // --- TanStack Mutation Hooks ---

  // Register User
  const registerMutation = useMutation({
    mutationFn: api.register,
    onSuccess: (data) => {
      showSuccess(data);
      setIsRegisterMode(false);
      setAuthPassword('');
    },
    onError: (err: any) => {
      showError(err.message || 'Registration failed');
    }
  });

  // Login User
  const loginMutation = useMutation({
    mutationFn: api.login,
    onSuccess: (data) => {
      setToken(data.token);
      setUsername(authUsername);
      showSuccess(`Welcome back, ${authUsername}!`);
      // Reset form
      setAuthUsername('');
      setAuthPassword('');
    },
    onError: (err: any) => {
      showError(err.message || 'Invalid username or password');
    }
  });

  // Add Book
  const addBookMutation = useMutation({
    mutationFn: api.addBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      showSuccess('Book added to collection successfully!');
      setNewTitle('');
      setNewAuthor('');
    },
    onError: (err: any) => {
      showError(err.message || 'Failed to add book');
    }
  });

  // Update Book
  const updateBookMutation = useMutation({
    mutationFn: ({ id, title, author }: { id: number; title: string; author: string }) => 
      api.updateBook(id, { title, author }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      showSuccess('Book updated successfully!');
      setEditingBookId(null);
    },
    onError: (err: any) => {
      showError(err.message || 'Failed to update book');
    }
  });

  // Delete Book
  const deleteBookMutation = useMutation({
    mutationFn: api.deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      showSuccess('Book deleted from system.');
    },
    onError: (err: any) => {
      showError(err.message || 'Failed to delete book');
    }
  });

  // Rent Book
  const rentBookMutation = useMutation({
    mutationFn: api.rentBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      showSuccess('Book successfully rented out!');
    },
    onError: (err: any) => {
      showError(err.message || 'Failed to rent book');
    }
  });

  // Return Book
  const returnBookMutation = useMutation({
    mutationFn: api.returnBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      showSuccess('Book returned. Thank you!');
    },
    onError: (err: any) => {
      showError(err.message || 'Failed to return book');
    }
  });

  // --- Auth Action Handlers ---
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUsername || !authPassword) {
      showError('Please fill in all fields');
      return;
    }

    if (isRegisterMode) {
      registerMutation.mutate({ username: authUsername, password: authPassword });
    } else {
      loginMutation.mutate({ username: authUsername, password: authPassword });
    }
  };

  const handleLogout = () => {
    clearAuth();
    setToken(null);
    setUsername(null);
    queryClient.clear();
    showSuccess('Logged out successfully.');
  };

  const toggleMockMode = () => {
    const nextMock = !mockActive;
    setMockMode(nextMock);
    setMockActive(nextMock);
    showSuccess(`Switched to ${nextMock ? 'Mock Offline Mode' : 'Live Server Mode'}`);
    
    // Invalidate everything to trigger reload under the new environment
    setTimeout(() => {
      queryClient.invalidateQueries();
    }, 100);
  };

  // --- Business Helpers ---
  const getRentalStatus = (bookId: number) => {
    const activeRental = rentals.find(r => r.bookId === bookId && r.returnDate === null);
    return activeRental ? { isRented: true, rental: activeRental } : { isRented: false, rental: null };
  };

  // --- Rendering ---

  if (!token) {
    return (
      <div className="app-container login-container">
        <div className="glass-panel login-card">
          <div className="brand-section" style={{ justifyContent: 'center', marginBottom: '24px' }}>
            <div className="brand-logo-container">
              <Icons.Book />
            </div>
            <h1 className="brand-title">Aetheris Libris</h1>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span 
              className={`connection-status ${mockActive ? 'mock' : 'online'}`}
              onClick={toggleMockMode}
              title="Click to toggle between Mock and Live API Server"
            >
              <span className="status-dot"></span>
              {mockActive ? 'Mock (Offline Mode)' : 'Live API (Ktor)'}
            </span>
          </div>

          <div className="auth-toggle">
            <button 
              className={`auth-tab ${!isRegisterMode ? 'active' : ''}`}
              onClick={() => setIsRegisterMode(false)}
            >
              Sign In
            </button>
            <button 
              className={`auth-tab ${isRegisterMode ? 'active' : ''}`}
              onClick={() => setIsRegisterMode(true)}
            >
              Register
            </button>
          </div>

          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          <form onSubmit={handleAuthSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                type="text" 
                className="input-field" 
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="input-field" 
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loginMutation.isPending || registerMutation.isPending}
            >
              {(loginMutation.isPending || registerMutation.isPending) ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  <Icons.Lock />
                  {isRegisterMode ? 'Create Account' : 'Access Library'}
                </>
              )}
            </button>
          </form>
          
          <div style={{ marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            {!mockActive && (
              <p>💡 Tip: Switch to <b>Mock Mode</b> above if the Ktor local server (port 8080) is offline.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Premium Header */}
      <header className="header-glass">
        <div className="brand-section">
          <div className="brand-logo-container">
            <Icons.Book />
          </div>
          <div>
            <h1 className="brand-title">Aetheris Libris</h1>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'left' }}>
              Book Rental Ecosystem
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span 
            className={`connection-status ${mockActive ? 'mock' : 'online'}`}
            onClick={toggleMockMode}
            title="Click to toggle between Mock and Live API Server"
          >
            <span className="status-dot"></span>
            {mockActive ? 'Mock (Offline Mode)' : 'Live API (Ktor)'}
          </span>

          <div className="user-badge">
            <span className="user-avatar">{username ? username.charAt(0).toUpperCase() : 'U'}</span>
            <span>{username}</span>
          </div>

          <button className="btn btn-secondary" onClick={handleLogout} style={{ width: 'auto', padding: '8px 12px' }}>
            <Icons.LogOut />
          </button>
        </div>
      </header>

      {/* Dynamic Alerts */}
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Main Grid Workspace */}
      <div className="dashboard-grid">
        
        {/* Left Side: Book Collection */}
        <section className="glass-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <Icons.Book />
              Book Catalog
            </h2>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {books.length} Books Registered
            </span>
          </div>

          {loadingBooks ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <span className="loading-spinner"></span>
              <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Loading catalog...</p>
            </div>
          ) : books.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', background: 'rgba(0, 0, 0, 0.1)', borderRadius: '16px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No books in catalog. Register your first book below!</p>
            </div>
          ) : (
            <div className="book-grid">
              {books.map((book) => {
                const { isRented, rental } = getRentalStatus(book.id);
                const isEditing = editingBookId === book.id;

                return (
                  <div key={book.id} className="book-card">
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input 
                          className="input-field" 
                          value={editingTitle} 
                          onChange={(e) => setEditingTitle(e.target.value)} 
                          placeholder="Title"
                        />
                        <input 
                          className="input-field" 
                          value={editingAuthor} 
                          onChange={(e) => setEditingAuthor(e.target.value)} 
                          placeholder="Author"
                        />
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                          <button 
                            className="btn btn-primary" 
                            style={{ flex: 1, padding: '8px 10px', fontSize: '12px' }}
                            onClick={() => updateBookMutation.mutate({ id: book.id, title: editingTitle, author: editingAuthor })}
                            disabled={updateBookMutation.isPending}
                          >
                            Save
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ flex: 1, padding: '8px 10px', fontSize: '12px' }}
                            onClick={() => setEditingBookId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <h3 className="book-title">{book.title}</h3>
                          <p className="book-author">by {book.author}</p>
                        </div>
                        
                        <div className="card-footer">
                          <div>
                            {isRented ? (
                              <span className="badge badge-rented">Rented out</span>
                            ) : (
                              <span className="badge badge-success">Available</span>
                            )}
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {/* Action to rent or return */}
                            {isRented ? (
                              <button 
                                className="btn btn-secondary" 
                                style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                                onClick={() => rental && returnBookMutation.mutate(rental.id)}
                                disabled={returnBookMutation.isPending}
                              >
                                Return
                              </button>
                            ) : (
                              <button 
                                className="btn btn-primary" 
                                style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                                onClick={() => rentBookMutation.mutate(book.id)}
                                disabled={rentBookMutation.isPending}
                              >
                                Rent
                              </button>
                            )}

                            {/* Edit Action */}
                            <button 
                              className="btn btn-secondary" 
                              style={{ width: 'auto', padding: '6px 10px' }}
                              onClick={() => {
                                setEditingBookId(book.id);
                                setEditingTitle(book.title);
                                setEditingAuthor(book.author);
                              }}
                              title="Edit Book Details"
                            >
                              <Icons.Edit />
                            </button>

                            {/* Delete Action */}
                            <button 
                              className="btn btn-danger" 
                              style={{ width: 'auto', padding: '6px 10px' }}
                              onClick={() => {
                                if (confirm(`Remove "${book.title}" from catalog?`)) {
                                  deleteBookMutation.mutate(book.id);
                                }
                              }}
                              disabled={deleteBookMutation.isPending}
                              title="Delete Book"
                            >
                              <Icons.Trash />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Book Panel */}
          <div className="add-book-section" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '28px' }}>
            <h3 className="panel-title" style={{ marginBottom: '18px' }}>
              <Icons.Plus />
              Add Book to Catalog
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (newTitle && newAuthor) {
                addBookMutation.mutate({ title: newTitle, author: newAuthor });
              } else {
                showError('Title and Author are required');
              }
            }} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Book Title" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Author Name" 
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: 'auto', padding: '0 24px', height: '45px' }}
                disabled={addBookMutation.isPending}
              >
                {addBookMutation.isPending ? <span className="loading-spinner"></span> : 'Register Book'}
              </button>
            </form>
          </div>
        </section>

        {/* Right Side: Rental history */}
        <aside className="glass-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <Icons.History />
              My Active Rentals
            </h2>
          </div>

          {loadingHistory ? (
            <div style={{ padding: '30px 0', textAlign: 'center' }}>
              <span className="loading-spinner"></span>
            </div>
          ) : rentals.filter(r => r.returnDate === null).length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', background: 'rgba(0, 0, 0, 0.1)', borderRadius: '16px', marginBottom: '24px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No active rentals.</p>
            </div>
          ) : (
            <div className="history-list" style={{ marginBottom: '32px' }}>
              {rentals.filter(r => r.returnDate === null).map((rental) => {
                const book = books.find(b => b.id === rental.bookId);
                return (
                  <div key={rental.id} className="history-item" style={{ borderLeft: '3px solid var(--secondary)' }}>
                    <div className="history-info">
                      <span className="history-title">{book ? book.title : `Book ID: ${rental.bookId}`}</span>
                      <span className="history-dates">Due: <span className="text-warning">{rental.dueDate}</span></span>
                    </div>
                    <button 
                      className="btn btn-secondary" 
                      style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => returnBookMutation.mutate(rental.id)}
                      disabled={returnBookMutation.isPending}
                    >
                      Return
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="panel-header" style={{ marginTop: '16px' }}>
            <h2 className="panel-title">
              <Icons.History />
              Rental History Log
            </h2>
          </div>

          {loadingHistory ? (
            <div style={{ padding: '30px 0', textAlign: 'center' }}>
              <span className="loading-spinner"></span>
            </div>
          ) : rentals.filter(r => r.returnDate !== null).length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', background: 'rgba(0, 0, 0, 0.1)', borderRadius: '16px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No previous rentals recorded.</p>
            </div>
          ) : (
            <div className="history-list">
              {rentals.filter(r => r.returnDate !== null).map((rental) => {
                const book = books.find(b => b.id === rental.bookId);
                return (
                  <div key={rental.id} className="history-item">
                    <div className="history-info">
                      <span className="history-title">{book ? book.title : `Book ID: ${rental.bookId}`}</span>
                      <span className="history-dates">Returned: <span className="text-success">{rental.returnDate}</span></span>
                    </div>
                    <span className="badge badge-success">Completed</span>
                  </div>
                );
              })}
            </div>
          )}
        </aside>

      </div>
    </div>
  );
}

export default App;
