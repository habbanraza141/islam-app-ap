import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsyncPipe } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  template: `
    <div class="loader-overlay" *ngIf="loadingService.loading$ | async">
      <div class="loader-box">
        <div class="spinner" aria-hidden="true"></div>
        <div class="loader-text">Loading…</div>
      </div>
    </div>
  `,
  styles: [
    `
    .loader-overlay {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.6);
      z-index: 9999;
      pointer-events: none;
    }
    .loader-box {
      pointer-events: auto;
      display:flex;
      flex-direction:column;
      align-items:center;
      padding: 12px 18px;
      border-radius: 8px;
      background: rgba(0,0,0,0.7);
      color: #fff;
      gap: 8px;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 4px solid rgba(255,255,255,0.25);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
    }
    .loader-text { font-size: 13px; opacity: .95 }
    @keyframes spin { to { transform: rotate(360deg) } }
    `,
  ],
})
export class LoaderComponent {
  constructor(public loadingService: LoadingService) {}
}
