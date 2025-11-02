import { HttpInterceptorFn } from '@angular/common/http';
import { LoaderService } from '../services/loader-service';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
 
//Class türü interceptorler var.
export const httpLoaderInterceptor: HttpInterceptorFn = (req, next) => {
  // Loading servisini inject ediyoruz
  const loadingService = inject(LoaderService);

  console.log("istek başladı!!")
  // İstek başladığında loader'ı göster (sayacı artır)
  loadingService.show();

  return next(req).pipe(
    // İstek tamamlandığında (başarılı veya hatalı) loader'ı gizle (sayacı azalt)
    
    finalize(() => {
      console.log("istek bitti!!!")
      loadingService.hide();
    })
  );
};