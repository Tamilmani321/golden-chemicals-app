import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, output, SimpleChanges } from '@angular/core';
import { PartyItem, Transaction } from '../party/party';
import { TransactionService } from '../services/transaction.service';
import { CommonModule } from '@angular/common';
import flatpickr from 'flatpickr';
import { MatDialog } from '@angular/material/dialog';
import { AddTransactionDialogue } from '../add-transaction-dialogue/add-transaction-dialogue';
import { FormsModule, NgModel } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { EditTransactionDialog } from '../edit-transaction-dialog/edit-transaction-dialog';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './transaction.html',
  styleUrl: './transaction.css'
})
export class TransactionComponent implements OnChanges, AfterViewInit {
  @Input() party: PartyItem | null = null;
  @Input() updatedTransactions: Transaction[] = [];
  @Output() currentBalanceEmit = new EventEmitter<number>();


  allTransactions: Transaction[] = []; // Full list
  transactions: Transaction[] = [];    // Filtered list
  selectedRange: string | null = null;
  activePid: number | null = null;
  fp: any;
  Math = Math;
  selectAll: boolean = false;
  //
  page: number = 0;
  size: number = 10;
  loading = false;
  totalPages: number = 0;
  currentPage: number = 0;
  pages: number [] = [];

  constructor(private transactionService: TransactionService, private dialog: MatDialog, private cdRef: ChangeDetectorRef) {} // 

  ngOnChanges(changes: SimpleChanges): void {
    this.activePid = this.party?.id ?? null;
    if (this.activePid) {
      this.transactionService.getTransactionsByPartyId(this.activePid,this.page,this.size).subscribe({
      next: (response) => {
    // Extract the list from `content`
    const data = response.content || [];

    // ✅ emit the latest balance safely
    this.currentBalanceEmit.emit(data[0]?.balance || 0);

    // ✅ store data for display
    this.allTransactions = data;
    this.transactions = [...data];

    // ✅ pagination values
    this.totalPages = response.totalPages;
    this.currentPage = response.number;
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
  },
  error: (err) => console.error('Error fetching transactions', err)
});

    }
  }
  

  updateSelectionState(): void {
  this.selectAll = this.transactions.every(txn => txn.amount);
  }

toggleSelectAll(): void {
  this.transactions.forEach(txn => txn.selected = this.selectAll);
}

hasSelection(): boolean {
  return this.transactions.some(txn => txn.selected);
}

// deleteCurrentTxn(txn: Transaction): void {
//   const confirmed = confirm('Are you sure you want to delete this transaction?');
//   if (!confirmed) return;

//   const activePid = this.party?.id ?? 0;
//   const token = localStorage.getItem('authToken') || '';

//   console.log("Deleting transaction ID:", txn.id);

//   // Call delete API and wait for response
//   this.transactionService.deleteTransaction(txn.id, token).subscribe({
//     next: () => {
//       console.log(`Transaction ${txn.id} deleted successfully`);
        
//       // Reload transactions after successful delete
//       this.transactionService
//         .getTransactionsByPartyId(activePid, this.page, this.size)
//         .subscribe({
//           next: (response) => {
//             const data = response.content || [];

//             this.currentBalanceEmit.emit(data[0]?.balance || 0);
//             this.allTransactions = data;
//             this.transactions = [...data];

//             this.totalPages = response.totalPages;
//             this.currentPage = response.number;
//             this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
//           },
//           error: (err) => console.error('Error fetching transactions:', err)
//         });
//     },
//     error: (err) => console.error('Error deleting transaction:', err)
//   });
// }

deleteCurrentTxn(txn: Transaction): void {
  const confirmed = confirm('Are you sure you want to delete this transaction?');
  if (!confirmed) return;

  const activePid = this.party?.id ?? 0;
  const token = localStorage.getItem('authToken') || '';

  console.log("Deleting transaction ID:", txn.id);

  this.transactionService.deleteTransaction(txn.id, token).subscribe({
    next: (response) => {
      console.log(response.message); // ✅ Will show "Deleted"

      // ✅ Optionally, show a popup/toast:
      // alert('Transaction deleted successfully.');

      // Reload updated transactions
      this.transactionService.getTransactionsByPartyId(activePid, this.page, this.size)
        .subscribe({
          next: (response) => {
            const data = response.content || [];

            this.currentBalanceEmit.emit(data[0]?.balance || 0);
            this.allTransactions = data;
            this.transactions = [...data];

            this.totalPages = response.totalPages;
            this.currentPage = response.number;
            this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
          },
          error: (err) => console.error('Error fetching transactions:', err)
        });
    },
    error: (err) => {
      console.error('Error deleting transaction:', err);
      alert('Error while deleting transaction.');
    }
  });
}



deleteSelected():void{

}


  ngAfterViewInit(): void {
    this.fp = flatpickr('#fpRange', {
      mode: 'range',
      dateFormat: 'Y-m-d',
      onChange: (selectedDates, dateStr, instance) => {
        if (selectedDates.length === 2) {
          const start = selectedDates[0];
          const end = selectedDates[1];
          this.selectedRange = `${instance.formatDate(start, 'Y-m-d')} → ${instance.formatDate(end, 'Y-m-d')}`;
          this.filterByDateRange(start, end);
        } else {
          this.selectedRange = null;
          this.transactions = [...this.allTransactions]; // Reset
        }
      }
    });

    const clearBtn = document.getElementById('fpClear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.fp.clear();
        this.selectedRange = null;
        this.transactions = [...this.allTransactions]; // Reset
      });
    }
  }

  filterByDateRange(start: Date, end: Date): void {
    this.transactions = this.allTransactions.filter(txn => {
      const txDate = new Date(txn.txDate);
      return txDate >= start && txDate <= end;
    });
  }

  openAddTransactionDialog(): void {
    const dialogRef = this.dialog.open(AddTransactionDialogue, {
      data: { pid: this.activePid }
    });

    dialogRef.afterClosed().subscribe((updatedTransactions) => {
      if (updatedTransactions) {
        this.allTransactions = updatedTransactions;
        this.transactions = [...updatedTransactions];
      }
    });
  }

 printTransactions(): void {
  const printContent = document.getElementById('printSection');
  if (!printContent) return;

  // Clone the table to avoid modifying the actual DOM
  const clonedTable = printContent.cloneNode(true) as HTMLElement;

  // Remove all elements marked as non-printable
  const nonPrintableElements = clonedTable.querySelectorAll('.non-printable');
  nonPrintableElements.forEach(el => el.remove());

  // Open system print dialog
  const printWindow = window.open('', '', 'width=900,height=650');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Transaction Details</title>
          <link rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #f8f9fa; }
            .CREDIT { color: green; font-weight: 600; }
            .DEBIT { color: red; font-weight: 600; }
            h4, p { text-align: center; margin: 0; }
          </style>
        </head>
        <body>
          ${clonedTable.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
}

editTransaction(txn:any ): void {
  console.log("Transaction Data : "+txn);
 const dialog = this.dialog.open(EditTransactionDialog,{
    width: '500px',
    data: { mode: 'edit', transaction: { ...txn, pid:this.activePid } }
  });

   dialog.afterClosed().subscribe((updatedTransactions) => {
      if (updatedTransactions) {
        this.transactions = [...updatedTransactions];
        console.log("Transaction Data : "+this.transactions)
      }
    });
}

loadPage(page: number): void {
  const pid = this.party?.id ?? 0;
  this.loading = true;

  this.transactionService.getTransactionsByPartyId(pid, page, 10).subscribe({
    next: (data) => {
      this.transactions = data.content;
      this.totalPages = data.totalPages;
      this.currentPage = data.number;
      this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
      this.loading = false;
    },
    error: () => {
      this.loading = false;
      console.error('Failed to load page data');
    }
  });
}

goToPage(page: number): void {
  if (page >= 0 && page < this.totalPages) {
    this.loadPage(page);
  }
}
}