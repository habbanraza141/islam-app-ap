import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, getDocs, query, updateDoc } from '@angular/fire/firestore';
import { map, Observable, from } from 'rxjs';


interface Author {
  id: number;
  bookWriter: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthorService {
  private collectionPath = 'Authors';

  constructor(private firestore: Firestore) { }

  addAuthor(author: Author): Observable<void> {
    const authorsRef = collection(this.firestore, this.collectionPath);
    return from(addDoc(authorsRef, author)).pipe(map(() => {})); 
  }

  getAuthors(): Observable<Author[]> {
    const authorsRef = collection(this.firestore, this.collectionPath);

    return from(getDocs(authorsRef)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => ({
          docId: doc.id, 
          ...doc.data(), 
        })) as unknown as Author[]
      )
    );
  }

  deleteAuthor(id: string): Observable<void> {
    const authorDocRef = doc(this.firestore, `${this.collectionPath}/${id}`);
    return from(deleteDoc(authorDocRef)).pipe(map(() => {}));
  }

  updateAuthor(docId: string, updatedAuthor: any): Observable<void> {
    const authorDocRef = doc(this.firestore, this.collectionPath, docId);
    return from(updateDoc(authorDocRef, updatedAuthor)).pipe(map(() => {}));
  }
}
