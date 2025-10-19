import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PagedResponse, Transaction } from '../party/party';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private baseUrl = 'http://localhost:8080/gmd/transaction';

  constructor(private http: HttpClient) {}

//   getTransactionsByPartyId(partyId: number, page: number, size: number): Observable<Transaction[]> {
//   const params = new HttpParams()
//     .set('page', page.toString())
//     .set('size', size.toString());

//   return this.http.get<PagedResponse<Transaction>>(`${this.baseUrl}/${partyId}`, { params });
// }
getTransactionsByPartyId(
  partyId: number,
  page: number,
  size: number
): Observable<PagedResponse<Transaction>> {
  const params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());

  return this.http.get<PagedResponse<Transaction>>(`${this.baseUrl}/${partyId}`, { params });
}



  saveTransaction(transaction: any, token:string): Observable<any> {
    const heaeders = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return this.http.post<any>(`${this.baseUrl}`, transaction, { headers: heaeders });
  }

  editTransaction(transaction: any, token:string): Observable<any> {
    const heaeders = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return this.http.put<any>(`${this.baseUrl}`, transaction, { headers: heaeders });
  }

 deleteTransaction(txId: number, token: string): Observable<{ message: string }> {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  return this.http.delete<{ message: string }>(`${this.baseUrl}/${txId}`, { headers });
}
}