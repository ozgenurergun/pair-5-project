import { Component, signal, WritableSignal, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // @if için
import { FormsModule } from '@angular/forms'; // [(ngModel)] için
import { Router } from '@angular/router'; 
import { AuthService } from '../../services/auth-service';
import { Popup } from '../../components/popup/popup';

// 1. Popup component'ini buraya import et

@Component({
  selector: 'app-login',
  standalone: true,
  // 2. Popup'ı imports dizisine ekle
  imports: [CommonModule, FormsModule, Popup], 
  templateUrl: './login-page.html', // HTML dosyasının adı
  styleUrls: [] 
})
export class LoginComponent {
  // Değişkenlerin [(ngModel)] ile uyumlu
  email: string = ''; 
  password: string = '';
  
  // Sinyallerin
  isPasswordVisible = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Servislerin
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() { }

  togglePasswordVisibility() {
    this.isPasswordVisible.update(value => !value);
  }

  // Login mantığın (Hiç dokunmadım, zaten doğru)
  onLogin() {
    this.isLoading.set(true);     
    this.errorMessage.set(null); 

    const credentials = {
      email: this.email,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        console.log('Giriş başarılı, token alındı.');
        this.router.navigateByUrl('/'); 
      },
      error: (err) => {
        this.isLoading.set(false); 
        console.error('Giriş hatası:', err);
        // Hata mesajını ayarla (Popup bunu gösterecek)
        this.errorMessage.set('Wrong username or password. Please try again.');
      }
    });
  }
  
  // Popup'ı kapatma metodun (Hiç dokunmadım, zaten doğru)
  closeErrorPopup() {
    this.errorMessage.set(null);
  }
}