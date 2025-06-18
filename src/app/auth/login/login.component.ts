import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CookieService } from '../../shared/services/cookie.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email = '';
  password = '';
  username = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cookiesService: CookieService
  ) {}

  // login() {
  //   this.authService.login(this.email, this.password).subscribe({
  //     next: (userCredential) => {
  //       console.log('User logged in:', userCredential);
  //       userCredential.user.getIdToken().then((token: any) => {
  //         this.cookiesService.setCookie('authToken', token, 7); // Set token in cookie for 7 days
  //       });
  //       this.router.navigate(['/']);
  //     },
  //     error: (err) => console.error('Login error:', err),
  //   });
  // }

  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: (user) => {
        const token = this.generateFakeToken(); 
        this.cookiesService.setCookie('authToken', token, 7);
        this.cookiesService.setCookie('authUser', JSON.stringify(user), 7);
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Login error:', err.message)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Username or password is incorrect',
        });
      },
    });
  }

  logout() {
    this.cookiesService.deleteCookie('authToken');
    this.cookiesService.deleteCookie('authUser');
    this.authService.logout().subscribe({
      next: () => console.log('User logged out'),
      error: (err) => console.error('Logout error:', err),
    });
  }

  generateFakeToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}
