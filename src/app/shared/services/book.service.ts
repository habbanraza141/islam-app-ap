import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, updateDoc, deleteDoc, doc, getDocs, query } from '@angular/fire/firestore';
import { map, Observable, from } from 'rxjs';

interface Book {
  id: number;
  docId?: string;
  bookTitle: string;
  bookWriter: string;
  aboutBook: string;
  bookContent: string;
  categories: string[];
  mainCategory: string;
  language: string;
  image: string;
}

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private collectionPath = 'booksCollection001';

  constructor(private firestore: Firestore) {}

  
  addBook(book: Book): Observable<void> {
    const booksRef = collection(this.firestore, this.collectionPath);
    return from(addDoc(booksRef, book)).pipe(map(() => {})); 
  }
  
  updateBook(docId: string, updatedBook: any): Observable<void> {
    const booksRef = doc(this.firestore ,this.collectionPath, docId);
    return from(updateDoc(booksRef, updatedBook)).pipe(map(() => {})); 
  }

  getBooks(): Observable<Book[]> {
    const booksRef = collection(this.firestore, this.collectionPath);

    return from(getDocs(booksRef)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => ({
          docId: doc.id, 
          ...doc.data(), 
        })) as unknown as Book[]
      )
    );
  }

  async testFirestore() {
    const booksRef = collection(this.firestore, this.collectionPath);
    const snapshot = await getDocs(booksRef);
    if (snapshot.empty) {
      console.log('No books found');
    } else {
      snapshot.forEach((doc) => console.log(doc.id, '=>', doc.data()));
    }
  }

  deleteBook(id: string): Observable<void> {
    const bookDocRef = doc(this.firestore, `${this.collectionPath}/${id}`);
    return from(deleteDoc(bookDocRef)).pipe(map(() => {}));
  }
}
