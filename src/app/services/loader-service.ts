import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loadingCounter = signal(0);
  public readonly isLoading = this.loadingCounter.asReadonly();

  show() {
    this.loadingCounter.update((count) => count + 1);
  }

  hide() {
    this.loadingCounter.update((count) => Math.max(0, count - 1));
  }
}
