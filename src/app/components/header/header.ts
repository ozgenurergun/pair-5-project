import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
    private authService = inject(AuthService);
    private router = inject(Router);
  logout() {
  
    // AuthService'teki logout'u çağır
    this.authService.logout(); 
    
    // Kullanıcıyı login sayfasına yönlendir
    // (Guard zaten bunu yapacak ama biz garantiye alalım)
    this.router.navigateByUrl('/login');
  }

}
