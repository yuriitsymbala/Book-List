import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { Book } from '../classes/Book';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private readonly apiURL = 'http://localhost:3000/books';
  private books$ = new BehaviorSubject<Book[]>([]);
  private allBooks$ = new BehaviorSubject<number>(0);
  readonly updatedBooks$ = this.books$.asObservable();
  readonly allBooksLength$ = this.allBooks$.asObservable();
  filterStatus = new BehaviorSubject<string>('Show Active');

  constructor(private http: HttpClient) {}

  getBooks(): Observable<Book[]> {
    if (this.filterStatus.getValue() == 'Show All') {
      return this.http.get<Book[]>(this.apiURL).pipe(
        tap((value) => {
          this.books$.next(value);
          this.allBooks$.next(value.length);
        })
      );
    }

    if (this.filterStatus.getValue() == 'Show Active') {
      return this.getBooksByStatus(true);
    }

    if (this.filterStatus.getValue() == 'Show Deactivated') {
      return this.getBooksByStatus(false);
    }

    return this.http.get<Book[]>(this.apiURL).pipe(
      tap((value) => {
        this.books$.next(value);
        this.allBooks$.next(value.length);
      })
    );
  }

  getBooksByStatus(isActive: Boolean): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiURL).pipe(
      tap((value) => {
        this.books$.next(value.filter((book) => book.isActive == isActive));
      })
    );
  }

  addBook(book: Book): Observable<Book[]> {
    return this.http
      .post<Book[]>(this.apiURL, book)
      .pipe(switchMap(() => this.getBooks()));
  }

  updateBookById(book: Book): Observable<Book[]> {
    return this.http
      .put<Book[]>(`${this.apiURL}/${book.id}`, book)
      .pipe(switchMap(() => this.getBooks()));
  }

  deleteBookById(book: Book): Observable<Book[]> {
    return this.http
      .delete<Book[]>(`${this.apiURL}/${book.id}`)
      .pipe(switchMap(() => this.getBooks()));
  }

  getBookById(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.apiURL}/${id}`);
  }
}
