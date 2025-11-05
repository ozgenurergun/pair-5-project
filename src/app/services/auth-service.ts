import { inject, Injectable, signal } from '@angular/core';
import { UserState } from '../models/authorization/userStateModel';
import { UserJwtModel } from '../models/authorization/userJwtModel';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode'; // <-- DOĞRU IMPORT BU

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public userState = signal<UserState>({ isLoggedIn: false });
  private http = inject(HttpClient); // HttpClient injection
  private apiUrl = 'http://localhost:8091/authservice/api/auth/login';  

  constructor() {
    this.loadInitialState();
  }

  loadInitialState() {
    const jwt = localStorage.getItem("token"); // Tarayıcı depolamasındaki JWT'yi kontrol eder.
    if(jwt) {
      // Token varsa, geçerli kabul edilir ve çözümlenerek kullanıcı bilgileri alınır.
      const decodedJwt = jwtDecode<UserJwtModel>(jwt);
      this.userState.set({isLoggedIn: true, user: {sub:decodedJwt.sub!, roles: decodedJwt.roles}})
    }
    // Token yoksa, userState varsayılan değeriyle (isLoggedIn: false) kalır.
  }


  // --- LOGIN METODU: Belirtilen Endpoint'e İstek Atar ---
login(credentials: LoginCredentials): Observable<string> { // 2. DÜZELTME: Observable<AuthResponse> DEĞİL, Observable<string>
    
    // 3. DÜZELTME: 
    //    - post<string> olarak değiştirildi.
    //    - { responseType: 'text' as 'json' } eklendi. Bu, Angular'a JSON değil, TEXT beklemesini söyler.
    return this.http.post<string>(this.apiUrl, credentials, { responseType: 'text' as 'json' })
      .pipe(
        // 4. DÜZELTME: 'response' artık 'jwt' string'inin kendisidir.
        tap((jwt: string) => { 
          
          // const jwt = response.token; // <-- BU SATIR TAMAMEN SİLİNMELİ!
          
          localStorage.setItem("token", jwt); // Token'ı Local Storage'a kaydet

          // JWT'yi çöz ve userState'i güncelle
          const decodedJwt = jwtDecode<UserJwtModel>(jwt);
          this.userState.set({
            isLoggedIn: true, 
            user: {
              sub: decodedJwt.sub!, 
              roles: decodedJwt.roles // Hata burada çözülmüş olmalı
            }
          });
          console.log(this.userState());
        })
      );
  }

logout() {
    // userState Signal'ini temizler ve oturumu kapatır.
    this.userState.set({isLoggedIn:false, user:undefined})
    // Token'ı depolamadan siler, böylece sayfa yenilense bile loadInitialState oturumu açamaz.
    localStorage.removeItem("token");
  }
}
