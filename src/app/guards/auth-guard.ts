import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. AuthService'teki güncel sinyali oku
  if (authService.userState().isLoggedIn) {
    return true; // Giriş yapmış, izin ver
  }

  // 2. Giriş yapmamışsa login'e yolla ve engelle
  router.navigateByUrl('/login');
  return false;
};
