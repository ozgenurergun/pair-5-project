import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // LocalStorage'dan token'ı al
  const token = localStorage.getItem('token');

  // Eğer token varsa, isteği klonla ve header'a ekle
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  // Token yoksa isteği olduğu gibi devam ettir
  return next(req);
};