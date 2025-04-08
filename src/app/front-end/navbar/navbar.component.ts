import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit{
  constructor (private authService: AuthService, private router : Router) {}
  ngOnInit(): void {}
  @Output() toggle = new EventEmitter<void>();
  showLogoutMenu = false;

  toggleLogoutMenu() {
    this.showLogoutMenu = !this.showLogoutMenu;
  }

  toggleSidebar() {
    this.toggle.emit(); // Notify parent to toggle sidebar
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => console.error('Logout failed:', err)
    });
  }  
}
