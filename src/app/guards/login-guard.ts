import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
 
export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
 
  // Eğer kullanıcı zaten giriş yaptıysa login sayfasına gitmesine izin verme
  if (authService.userState().isLoggedIn) {
    router.navigateByUrl('/search-customer'); // veya dashboard gibi ana sayfa
    return false;
  }
 
  // Henüz giriş yapılmamışsa login'e gidebilir
  return true;
};