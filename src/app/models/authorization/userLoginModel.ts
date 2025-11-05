interface LoginCredentials {
  email: string; // Veya email, sub, her ne kullanıyorsanız
  password: string;
}
 
interface AuthResponse {
  token: string; // Backend'in döndürdüğü JWT alanı
}