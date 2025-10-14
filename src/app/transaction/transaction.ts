import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PartyItem, Transaction } from '../party/party';
import { TransactionService } from '../services/transaction.service';
import { CommonModule, DecimalPipe, NgClass } from '@angular/common';
import flatpickr from 'flatpickr';
import { MatDialog } from '@angular/material/dialog';
import { AddTransactionDialogue } from '../add-transaction-dialogue/add-transaction-dialogue';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction.html',
  styleUrl: './transaction.css'
})
export class TransactionComponent  implements OnChanges, AfterViewInit{
 @Input() party: PartyItem | null = null;
 @Input() updatedTransactions: Transaction[] = [];
  transactions: Transaction[] = [];
  selectedParty: PartyItem | null = null;
  selectedRange: string | null = null;
  fp: any;

  constructor(private transactionService: TransactionService, private dialog: MatDialog) {}

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

  ngAfterViewInit(): void {
    this.fp = flatpickr("#fpRange", {
      mode: "range",
      dateFormat: "Y-m-d",
      onChange: (selectedDates, dateStr, instance) => {
        if (selectedDates.length === 2) {
          const start = instance.formatDate(selectedDates[0], "Y-m-d");
          const end = instance.formatDate(selectedDates[1], "Y-m-d");
          this.selectedRange = `${start} → ${end}`;
        } else {
          this.selectedRange = null;
        }
      }
    });

    const clearBtn = document.getElementById('fpClear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.fp.clear();
        this.selectedRange = null;
      });
    }
  }
  openAddTransactionDialog(): void {
    console.log("Selected Party Id : "+this.selectedParty?.id);
    const dialogRef = this.dialog.open(AddTransactionDialogue,{
    data: { pid: this.selectedParty?.id }
  }).afterClosed().subscribe((updatedTransactions) => {
    if (updatedTransactions) {
      this.transactions = updatedTransactions; // ✅ Refresh the list
      console.log('🔁 Transactions updated in parent:', updatedTransactions);
    }
  });
    
  }
}
