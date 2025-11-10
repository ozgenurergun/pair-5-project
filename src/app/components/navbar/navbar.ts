import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
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
