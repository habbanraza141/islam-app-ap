import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _loading = new BehaviorSubject<boolean>(false);
  loading$ = this._loading.asObservable();

  private counter = 0;

  show(): void {
    this.counter++;
    if (this.counter > 0) {
      this._loading.next(true);
    }
  }

  hide(): void {
    if (this.counter > 0) {
      this.counter--;
    }
    if (this.counter === 0) {
      this._loading.next(false);
    }
  }

  reset(): void {
    this.counter = 0;
    this._loading.next(false);
  }
}
