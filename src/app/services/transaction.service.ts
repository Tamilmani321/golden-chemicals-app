import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Transaction } from '../party/party';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private baseUrl = 'http://localhost:8080/gmd/transaction';

  constructor(private http: HttpClient) {}

  getTransactionsByPartyId(partyId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/${partyId}`);
  }
  saveTransaction(transaction: any, token:string): Observable<any> {
    const heaeders = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return this.http.post<any>(`${this.baseUrl}`, transaction, { headers: heaeders });
  }
}