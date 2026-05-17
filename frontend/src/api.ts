// Type definitions matching the Ktor backend models
export interface Book {
  id: number;
  title: string;
  author: string;
  ownerId: number;
}

export interface Rental {
  id: number;
  bookId: number;
  userId: number;
  rentalDate: string;
  dueDate: string;
  returnDate: string | null;
}

export interface User {
  username: string;
  password?: string;
}

// Key for local storage
const TOKEN_KEY = 'ktor_sample_token';
const USERNAME_KEY = 'ktor_sample_username';
const USERID_KEY = 'ktor_sample_userid';
const MOCK_MODE_KEY = 'ktor_sample_mock_mode';

// Helper functions for Auth State
export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(USERID_KEY);
};

export const getSavedUsername = () => localStorage.getItem(USERNAME_KEY);
export const setSavedUsername = (username: string) => localStorage.setItem(USERNAME_KEY, username);

export const getSavedUserId = () => {
  const id = localStorage.getItem(USERID_KEY);
  return id ? parseInt(id, 10) : 1; // Default to 1 for simplicity
};
export const setSavedUserId = (id: number) => localStorage.setItem(USERID_KEY, id.toString());

export const isMockMode = () => localStorage.getItem(MOCK_MODE_KEY) === 'true';
export const setMockMode = (enabled: boolean) => localStorage.setItem(MOCK_MODE_KEY, enabled ? 'true' : 'false');

// --- Mock Database for Offline Demonstration ---
const INITIAL_MOCK_BOOKS: Book[] = [
  { id: 1, title: 'The Pragmatic Programmer', author: 'Andy Hunt & Dave Thomas', ownerId: 1 },
  { id: 2, title: 'Clean Code', author: 'Robert C. Martin', ownerId: 1 },
  { id: 3, title: 'Refactoring', author: 'Martin Fowler', ownerId: 2 },
  { id: 4, title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', ownerId: 2 },
  { id: 5, title: 'Kotlin in Action', author: 'Dmitry Jemerov & Svetlana Isakova', ownerId: 1 },
];

const INITIAL_MOCK_RENTALS: Rental[] = [
  { id: 1, bookId: 1, userId: 1, rentalDate: '2026-05-10', dueDate: '2026-05-24', returnDate: '2026-05-15' },
  { id: 2, bookId: 2, userId: 1, rentalDate: '2026-05-16', dueDate: '2026-05-30', returnDate: null },
];

// Helper to initialize local mock database if not exists
const getMockBooks = (): Book[] => {
  const books = localStorage.getItem('mock_books');
  if (!books) {
    localStorage.setItem('mock_books', JSON.stringify(INITIAL_MOCK_BOOKS));
    return INITIAL_MOCK_BOOKS;
  }
  return JSON.parse(books);
};

const saveMockBooks = (books: Book[]) => {
  localStorage.setItem('mock_books', JSON.stringify(books));
};

const getMockRentals = (): Rental[] => {
  const rentals = localStorage.getItem('mock_rentals');
  if (!rentals) {
    localStorage.setItem('mock_rentals', JSON.stringify(INITIAL_MOCK_RENTALS));
    return INITIAL_MOCK_RENTALS;
  }
  return JSON.parse(rentals);
};

const saveMockRentals = (rentals: Rental[]) => {
  localStorage.setItem('mock_rentals', JSON.stringify(rentals));
};

// Generic Fetch Wrapper that appends JWT token if available
const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(errorText || `API Error: ${response.status} ${response.statusText}`);
  }

  // Handle created or no-content responses gracefully
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

// --- API Service Implementation ---
export const api = {
  // 1. User Registration
  register: async (user: User): Promise<string> => {
    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return 'User registered successfully (Mock)';
    }
    return apiFetch('/books/auth', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  // 2. User Login
  login: async (user: User): Promise<{ token: string; userId: number }> => {
    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const fakeToken = `mock-jwt-token-for-${user.username}`;
      setAuthToken(fakeToken);
      setSavedUsername(user.username);
      setSavedUserId(1); // Mock user ID 1
      return { token: fakeToken, userId: 1 };
    }

    const res = await apiFetch('/books/login', {
      method: 'POST',
      body: JSON.stringify(user),
    });

    if (res && res.token) {
      setAuthToken(res.token);
      setSavedUsername(user.username);
      setSavedUserId(res.userId);
    }
    return res;
  },

  // 3. Fetch All Books
  getAllBooks: async (): Promise<Book[]> => {
    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return getMockBooks();
    }
    return apiFetch('/books/allBooks');
  },

  // 4. Add a Book
  addBook: async (book: Omit<Book, 'id' | 'ownerId'>): Promise<string> => {
    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const books = getMockBooks();
      const newBook: Book = {
        ...book,
        id: books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1,
        ownerId: getSavedUserId(),
      };
      saveMockBooks([...books, newBook]);
      return 'Book added successfully (Mock)';
    }
    // Set ownerId to current user
    const bookData = { ...book, id: 0, ownerId: getSavedUserId() };
    return apiFetch('/books/addBooks', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
  },

  // 5. Update a Book
  updateBook: async (id: number, book: Omit<Book, 'id' | 'ownerId'>): Promise<string> => {
    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const books = getMockBooks();
      const index = books.findIndex(b => b.id === id);
      if (index !== -1) {
        books[index] = { ...books[index], ...book };
        saveMockBooks(books);
        return 'Book updated successfully (Mock)';
      }
      throw new Error('Book not found');
    }
    const bookData = { ...book, id, ownerId: getSavedUserId() };
    return apiFetch(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    });
  },

  // 6. Delete a Book
  deleteBook: async (id: number): Promise<string> => {
    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const books = getMockBooks();
      const filtered = books.filter(b => b.id !== id);
      saveMockBooks(filtered);
      // Clean up rentals for this book
      const rentals = getMockRentals().filter(r => r.bookId !== id);
      saveMockRentals(rentals);
      return 'Book deleted successfully (Mock)';
    }
    return apiFetch(`/books/${id}`, {
      method: 'DELETE',
    });
  },

  // 7. Rent a Book
  rentBook: async (bookId: number): Promise<string> => {
    const userId = getSavedUserId();
    const rentalDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 14 days

    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const rentals = getMockRentals();
      const isRented = rentals.some(r => r.bookId === bookId && r.returnDate === null);
      if (isRented) throw new Error('Book is already rented!');
      
      const newRental: Rental = {
        id: rentals.length > 0 ? Math.max(...rentals.map(r => r.id)) + 1 : 1,
        bookId,
        userId,
        rentalDate,
        dueDate,
        returnDate: null,
      };
      saveMockRentals([...rentals, newRental]);
      return 'Book rented successfully! (Mock)';
    }

    const rentalPayload = {
      id: 0,
      bookId,
      userId,
      rentalDate,
      dueDate,
    };

    return apiFetch('/rent/rentBook', {
      method: 'POST',
      body: JSON.stringify(rentalPayload),
    });
  },

  // 8. Return a Book
  returnBook: async (rentalId: number): Promise<string> => {
    const returnDate = new Date().toISOString().split('T')[0];

    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const rentals = getMockRentals();
      const index = rentals.findIndex(r => r.id === rentalId);
      if (index !== -1) {
        rentals[index].returnDate = returnDate;
        saveMockRentals(rentals);
        return 'Book returned successfully! (Mock)';
      }
      throw new Error('Rental record not found');
    }

    const returnPayload = {
      id: rentalId,
      bookId: 0,
      userId: getSavedUserId(),
      rentalDate: returnDate,
      dueDate: '',
    };

    return apiFetch('/rent/returnBook', {
      method: 'POST',
      body: JSON.stringify(returnPayload),
    });
  },

  // 9. Fetch Rental History
  getHistory: async (): Promise<Rental[]> => {
    const userId = getSavedUserId();
    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return getMockRentals().filter(r => r.userId === userId);
    }
    return apiFetch(`/rent/history/${userId}`);
  }
};
