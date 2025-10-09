import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface LoginResponse {
  token: string;
  username: string
}
@Injectable({
  providedIn: 'root'
})
export class Auth {
  private baseUrl = 'http://localhost:8080/auth';  
  
  constructor(private http:HttpClient)  {}

  login(username: string, password: string):Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`,{
     username, password 
    });
  }

  saveToken(token: string) { 
    localStorage.setItem('authToken', token);
  }

  getToken():string | null {
    return localStorage.getItem('authToken');
  }

  clearToken() {
    localStorage.removeItem('authToken');
  }
}
