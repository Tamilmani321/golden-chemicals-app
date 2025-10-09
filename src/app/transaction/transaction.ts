import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Party, PartyItem } from '../party/party';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [],
  templateUrl: './transaction.html',
  styleUrl: './transaction.css'
})
export class TransactionComponent  implements OnChanges{
  @Input() party: PartyItem | null = null;
  constructor(private http: HttpClient) {}

  ngOnChanges(): void {
    if(this.party){
       const url = `http://localhost:8080/gmd/transaction/${this.party.id}`;
        this.http.get(url).subscribe({
        next: (data) => {
          console.log("Data:", JSON.stringify(data, null, 2));
          this.party!.transactions = data as any[]; // ideally type this properly
        },
        error: (err) => {
          console.error('Failed to fetch transactions:', err);
        }
      });
    }
  }

}
