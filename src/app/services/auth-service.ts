import { inject, Injectable, signal } from '@angular/core';
import { UserState } from '../models/authorization/userStateModel';
import { UserJwtModel } from '../models/authorization/userJwtModel';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { AuthResponse, LoginCredentials } from '../models/authorization/userLoginModel';


@Injectable({
  providedIn: 'root',
})

export class AuthService {
  public userState = signal<UserState>({ isLoggedIn: false });
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8091/authservice/api/auth/login';

  constructor() {
    this.loadInitialState();
  }

  loadInitialState() {
    const jwt = localStorage.getItem('token');
    const firstname = localStorage.getItem('firstname'); // İsmi storage'dan oku

    if (jwt) {
      const decodedJwt = jwtDecode<UserJwtModel>(jwt);
      this.userState.set({
        isLoggedIn: true,
        user: { 
            sub: decodedJwt.sub!, 
            roles: decodedJwt.roles,
            firstname: firstname || '' // Varsa state'e yükle
        },
      });
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(this.apiUrl, credentials)
      .pipe(
        tap((response: AuthResponse) => {
          // DÜZELTME BURADA:
          // Backend "jwtToken" gönderiyor, biz bunu alıp localStorage'a "token" adıyla kaydediyoruz.
          localStorage.setItem('token', response.jwtToken); 
          
          // Backend "firstName" gönderiyor, biz bunu alıp "firstname" adıyla saklıyoruz.
          localStorage.setItem('firstname', response.firstName);

          // Token'ı decode et
          const decodedJwt = jwtDecode<UserJwtModel>(response.jwtToken);
          
          // State'i güncelle
          this.userState.set({
            isLoggedIn: true,
            user: {
              sub: decodedJwt.sub!,
              roles: decodedJwt.roles,
              // State modelinizde 'firstname' (küçük harf) tanımlıysa burayı böyle eşliyoruz:
              firstname: response.firstName, 
            },
          });
          
          console.log("Giriş Başarılı, State:", this.userState());
        })
      );
  }

  logout() {
    this.userState.set({ isLoggedIn: false, user: undefined });
    localStorage.removeItem('token');
    localStorage.removeItem('firstname'); // Çıkışta ismi de sil
  }
}
