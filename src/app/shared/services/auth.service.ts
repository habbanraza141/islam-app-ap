import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable, from } from 'rxjs';
// import { Auth, onAuthStateChanged, signInWithEmailAndPassword, signOut,User  } from '@angular/fire/auth';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // old logic
  // private userSubject = new BehaviorSubject<User | null>(null);
  // user$ = this.userSubject.asObservable();

  // constructor(private auth: Auth) {
  //   onAuthStateChanged(this.auth, (user) => {
  //     this.userSubject.next(user);
  //   });
  // }

  // login(email: string, password: string): Observable<any> {
  //   return from(signInWithEmailAndPassword(this.auth, email, password));
  // }

  // logout(): Observable<void> {
  //   return from(signOut(this.auth));
  // }

  // isLoggedIn(): boolean {
  //   return !!this.auth.currentUser;
  // }



  // new logic
  private userSubject = new BehaviorSubject<any | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private firestore: Firestore) {}

  login(username: string, password: string): Observable<any> {
    const usersRef = collection(this.firestore, 'adminlogin');
    const q = query(usersRef, where('username', '==', username), where('password', '==', password));

    return new Observable((observer) => {
      getDocs(q).then((querySnapshot) => {
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          this.userSubject.next(userData);
          observer.next(userData);
          observer.complete();
        } else {
          observer.error(new Error('Invalid username or password'));
        }
      }).catch((error) => {
        observer.error(error);
      });
    });
  }

  logout(): Observable<void> {
    this.userSubject.next(null);
    return of(undefined);
  }

  isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  getCurrentUser(): any {
    return this.userSubject.value;
  }
}


