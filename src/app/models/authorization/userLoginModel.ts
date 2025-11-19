export interface LoginCredentials {
  email: string; // Veya email, sub, her ne kullanıyorsanız
  password: string;
}
 

export interface AuthResponse {
  firstName: string; // Backend: "firstName" (Büyük N harfine dikkat)
  jwtToken: string;  // Backend: "jwtToken" (token yerine jwtToken)
}