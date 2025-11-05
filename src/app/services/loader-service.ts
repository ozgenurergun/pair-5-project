import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  // Yükleme durumunu bir sinyal olarak tutuyoruz
  private loadingCounter = signal(0);

  // Dışarıdan okunabilir (readonly) bir sinyal paylaşıyoruz
  public readonly isLoading = this.loadingCounter.asReadonly();

  /**
   * Loader'ı göster. Her çağrıldığında sayacı bir artırır.
   */
  show() {
    this.loadingCounter.update((count) => count + 1);
  }

  /**
   * Loader'ı gizle. Her çağrıldığında sayacı bir azaltır.
   * Sayaç 0'ın altına düşmez.
   */
  hide() {
    this.loadingCounter.update((count) => Math.max(0, count - 1));
  }
}
