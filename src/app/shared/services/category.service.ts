import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from '@angular/fire/firestore';
import { map, Observable, from } from 'rxjs';

interface SubCategory {
  id: number;
  key: string;
  title: string;
}
interface Category {
  id: number;
  docId?: string; 
   category: string;
  subCategories: SubCategory[];
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private collectionPath = 'categories001';

  constructor(private firestore: Firestore) {}

  addCategory(category: Category): Observable<void> {
    const categoriesRef = collection(this.firestore, this.collectionPath);
    return from(addDoc(categoriesRef, category)).pipe(map(() => {})); // Return void
  }

  updateCategory(docId: string, updatedCategory: any): Observable<void> {
    const categoriesRef = doc(this.firestore ,this.collectionPath, docId);
    return from(updateDoc(categoriesRef, updatedCategory)).pipe(map(() => {})); 
  }
  
  getCategories(): Observable<Category[]> {
    const categoriesRef = collection(this.firestore, this.collectionPath);

    return from(getDocs(categoriesRef)).pipe(
      map(
        (snapshot) =>
          snapshot.docs.map((doc) => ({
            docId: doc.id,
            ...doc.data(),
          })) as unknown as Category[]
      )
      // map((snapshot) =>
      //   snapshot.docs.map((doc) => doc.data() as Category)
      // )
    );
  }

  deleteCategory(id: string): Observable<void> {
    const categoryDocRef = doc(this.firestore, `${this.collectionPath}/${id}`);
    return from(deleteDoc(categoryDocRef)).pipe(map(() => {}));
  }
}
