import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit{
  constructor() {}
  ngOnInit(): void {}
  @Output() toggle = new EventEmitter<void>();

  toggleSidebar() {
    this.toggle.emit(); // Notify parent to toggle sidebar
  }
}
