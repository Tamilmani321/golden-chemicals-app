import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PartyItem, Transaction } from '../party/party';
import { TransactionService } from '../services/transaction.service';
import { CommonModule, DecimalPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule,DecimalPipe, NgClass],
  templateUrl: './transaction.html',
  styleUrl: './transaction.css'
})
export class TransactionComponent  implements OnChanges{
 @Input() party: PartyItem | null = null;
  transactions: Transaction[] = [];

  constructor(private transactionService: TransactionService) {}

  ngOnChanges(): void {
    if (this.party) {
      this.transactionService.getTransactionsByPartyId(this.party.id).subscribe({
        next: (data) => {
          console.log('Fetched transactions:', data);
          this.transactions = data;
        },
        error: (err) => {
          console.error('Failed to fetch transactions:', err);
        }
      });
    }
  }

}
