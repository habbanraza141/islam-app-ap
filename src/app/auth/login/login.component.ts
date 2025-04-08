import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CookieService } from '../../shared/services/cookie.service';

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

  constructor(
    private authService: AuthService,
    private router: Router,
    private cookiesService: CookieService
  ) {}

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: (userCredential) => {
        console.log('User logged in:', userCredential);
        userCredential.user.getIdToken().then((token: any) => {
          this.cookiesService.setCookie('authToken', token, 7); // Set token in cookie for 7 days
        });
        this.router.navigate(['/']);
      },
      error: (err) => console.error('Login error:', err),
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => console.log('User logged out'),
      error: (err) => console.error('Logout error:', err),
    });
  }
}
