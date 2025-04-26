// SearchBooks.tsx
import { useState, useEffect, FormEvent } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import Auth from '../utils/auth';
import { searchGoogleBooks } from '../utils/API';
import { saveBookIds, getSavedBookIds } from '../utils/localStorage';
import { SAVE_BOOK } from '../utils/mutations';
import type { Book } from '../models/Book';

const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState<Book[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());
  const [saveBookMutation] = useMutation(SAVE_BOOK);

  useEffect(() => {
    return () => saveBookIds(savedBookIds);
  }, [savedBookIds]);

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchInput) return;
    const res = await searchGoogleBooks(searchInput);
    if (!res.ok) throw new Error('Google Books failed');
    const { items } = await res.json();
    const books = items.map((b: any) => ({
      bookId: b.id,
      authors: b.volumeInfo.authors || ['No author to display'],
      title: b.volumeInfo.title,
      description: b.volumeInfo.description,
      image: b.volumeInfo.imageLinks?.thumbnail || '',
      link: b.volumeInfo.infoLink || ''
    }));
    setSearchedBooks(books);
    setSearchInput('');
  };

  const handleSaveBook = async (bookId: string) => {
    if (!Auth.loggedIn()) return;
    const book = searchedBooks.find(b => b.bookId === bookId)!;
    await saveBookMutation({ variables: { input: book } });
    setSavedBookIds([...savedBookIds, bookId]);
  };

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Form.Group controlId="searchInput" className="d-flex">
              <Form.Control
                type="text"
                size="lg"
                placeholder="Search for a book"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
              <Button type="submit" variant="success" size="lg" className="ms-2">
                Submit
              </Button>
            </Form.Group>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className="pt-5">
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>

        <div className="masonry">
          {searchedBooks.map(book => (
            <Card border="dark" key={book.bookId}>
              {book.image && (
                <Card.Img
                  src={book.image}
                  alt={`Cover for ${book.title}`}
                  variant="top"
                />
              )}
              <Card.Body>
                <Card.Title>{book.title}</Card.Title>
                <p className="small">
                  Authors: {book.authors.join(', ')}
                </p>
                <Card.Text>{book.description}</Card.Text>
                {Auth.loggedIn() && (
                  <Button
                    variant={savedBookIds.includes(book.bookId) ? 'secondary' : 'primary'}
                    className="w-100 mt-2"
                    disabled={savedBookIds.includes(book.bookId)}
                    onClick={() => handleSaveBook(book.bookId)}
                  >
                    {savedBookIds.includes(book.bookId)
                      ? 'Book Already Saved!'
                      : 'Save This Book!'}
                  </Button>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      </Container>
    </>
  );
};

export default SearchBooks;
