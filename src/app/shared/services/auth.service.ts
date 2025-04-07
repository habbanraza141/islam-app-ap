import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Auth, signInWithEmailAndPassword, signOut,  } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth) { }


  // Login method
  login(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }


  logout(): Observable<void> {
    return from(signOut(this.auth));
  }
}


