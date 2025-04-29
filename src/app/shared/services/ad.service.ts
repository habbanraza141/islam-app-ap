import { Injectable } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { from, map, Observable } from 'rxjs';

interface Ad {
  id: number;
  image: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdService {
  private collectionPath = 'advertisements';

  constructor(private firestore: Firestore) {}

  addAd(ad: Ad): Observable<Ad> {
    const adsRef = collection(this.firestore, this.collectionPath);
    const docRef = doc(adsRef);
    return from(setDoc(docRef, ad)).pipe(
      map(() => ({ ...ad, docId: docRef.id }))
    );
  }

  updateAd(docId: string, updatedAd: any): Observable<void> {
    const adsRef = doc(this.firestore, this.collectionPath, docId);
    return from(updateDoc(adsRef, updatedAd)).pipe(map(() => {}));
  }

  getCarousels(): Observable<Ad[]> {
    const adsRef = collection(this.firestore, this.collectionPath);

    return from(getDocs(adsRef)).pipe(
      map(
        (snapshot) =>
          snapshot.docs.map((doc) => ({
            docId: doc.id,
            ...doc.data(),
          })) as unknown as Ad[]
      )
    );
  }

  deleteAd(id: string): Observable<void> {
    const adDocRef = doc(this.firestore, `${this.collectionPath}/${id}`);
    return from(deleteDoc(adDocRef)).pipe(map(() => {}));
  }
}
