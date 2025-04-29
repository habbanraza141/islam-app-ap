import { Injectable } from '@angular/core';
import { collection, deleteDoc, doc, Firestore, getDocs, setDoc, updateDoc } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';

interface Carousel {
  id: number;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class CarouselService {
  private collectionPath = 'carouselimages';

  constructor(private firestore: Firestore) { }

  addCarousel(carousel: Carousel): Observable<Carousel> {
    const carouselsRef = collection(this.firestore, this.collectionPath);
    const docRef = doc(carouselsRef); 
    return from(setDoc(docRef, carousel)).pipe(
      map(() => ({ ...carousel, docId: docRef.id })) 
    );
  }


  updateCarousel(docId: string, updatedCarousel: any): Observable<void> {
    const carouselsRef = doc(this.firestore ,this.collectionPath, docId);
    return from(updateDoc(carouselsRef, updatedCarousel)).pipe(map(() => {})); 
  }

  getCarousels(): Observable<Carousel[]> {
    const carouselsRef = collection(this.firestore, this.collectionPath);

    return from(getDocs(carouselsRef)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => ({
          docId: doc.id, 
          ...doc.data(), 
        })) as unknown as Carousel[]
      )
    );
  }


  deleteCarousel(id: string): Observable<void> {
    const carouselDocRef = doc(this.firestore, `${this.collectionPath}/${id}`);
    return from(deleteDoc(carouselDocRef)).pipe(map(() => {}));
  }
}
