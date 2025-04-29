import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css',
})
export class SideBarComponent implements OnInit {
  @Input() isVisible = true;

  ngOnInit(): void {
    this.router.events
    .pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    )    .subscribe((event: NavigationEnd) => {
      const urlSegment = event.urlAfterRedirects.split('/')[1];
      this.activeRoute = urlSegment || 'books';
    });

  const currentUrl = this.router.url.split('/')[1];
  this.activeRoute = currentUrl || 'books';
  }

  activeRoute = 'books';
  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateTo(route: string) {
    this.activeRoute = route;
    // this.router.navigate(['/', route]);  
  }
}
