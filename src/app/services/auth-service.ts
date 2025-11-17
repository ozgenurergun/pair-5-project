import { inject, Injectable, signal } from '@angular/core';
import { UserState } from '../models/authorization/userStateModel';
import { UserJwtModel } from '../models/authorization/userJwtModel';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

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
    if (jwt) {
      const decodedJwt = jwtDecode<UserJwtModel>(jwt);
      this.userState.set({
        isLoggedIn: true,
        user: { sub: decodedJwt.sub!, roles: decodedJwt.roles },
      });
    }
  }

  login(credentials: LoginCredentials): Observable<string> {
    return this.http
      .post<string>(this.apiUrl, credentials, { responseType: 'text' as 'json' })
      .pipe(
        tap((jwt: string) => {
          localStorage.setItem('token', jwt);

          const decodedJwt = jwtDecode<UserJwtModel>(jwt);
          this.userState.set({
            isLoggedIn: true,
            user: {
              sub: decodedJwt.sub!,
              roles: decodedJwt.roles,
            },
          });
          console.log(this.userState());
        })
      );
  }

  logout() {
    this.userState.set({ isLoggedIn: false, user: undefined });
    localStorage.removeItem('token');
  }
}
