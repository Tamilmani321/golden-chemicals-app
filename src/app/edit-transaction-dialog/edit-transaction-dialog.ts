import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TransactionService } from '../services/transaction.service';

@Component({
  selector: 'app-edit-transaction-dialog',
  standalone: true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule],
  templateUrl: './edit-transaction-dialog.html',
  styleUrl: './edit-transaction-dialog.css'
})
export class EditTransactionDialog {
  formattedAmount = '';
  originalAmount: number | null = null;
  transactionForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditTransactionDialog>, 
    @Inject(MAT_DIALOG_DATA) public data: { mode: string; transaction: any },
    private transactionService: TransactionService)
   {
    const txn = data.transaction;
    console.log("PID : "+txn.pid);
    this.transactionForm = this.fb.group({
      txDate: [txn.txDate ? txn.txDate.split('T')[0] : '', Validators.required],
      product: [txn.product, Validators.required],
      remark: [txn.remark],
      type: [txn.type, Validators.required],
      amount: [Math.abs(txn.amount), [Validators.required, Validators.min(1)]],
      txId: txn.id
    });
  }

  onUpdate(): void {
    if (this.transactionForm.valid) {
      const token = localStorage.getItem('authToken') || '';
       const transactionData = {
      txDate: new Date(this.transactionForm.value.txDate).toISOString(),
      product: this.transactionForm.value.product,
      remark: this.transactionForm.value.remark,
      type: this.transactionForm.value.type,
      amount: this.transactionForm.value.amount,
      id: this.transactionForm.value.txId
    };
      this.transactionService.editTransaction(transactionData, token).subscribe({
      next: () => {
        this.transactionService.getTransactionsByPartyId(this.data.transaction.pid,0,10).subscribe({
          next: (updatedTransactions) => {
         //   this.currentBalanceEmit.emit(updatedTransactions[0]?.balance || 0);
            console.log('🔁 Updated transactions:', updatedTransactions);
            this.dialogRef.close(updatedTransactions); // send updated list back
          },
          error: (err) => {
            console.error('❌ Failed to fetch updated transactions:', err);
            this.dialogRef.close(); // still close, but without data
          }
        });
      },
      error: (err) => {
        console.error('❌ Failed to save transaction:', err);
      }
    });
  }
  }

  closeModal(): void {
    console.log("current Data : "+this.data);
     this.dialogRef.close();
  }
  onAmountInput(event: Event) {
  const input = (event.target as HTMLInputElement).value.replace(/,/g, '');
  const numericValue = parseInt(input, 10);

  if (!isNaN(numericValue)) {
    this.originalAmount = numericValue;
    this.formattedAmount = this.formatIndianRupee(numericValue);
    this.transactionForm.get('amount')?.setValue(numericValue);
  } else {
    this.originalAmount = null;
    this.formattedAmount = '';
    this.transactionForm.get('amount')?.setValue(null);
  }
}

formatIndianRupee(value: number): string {
  const x = value.toString();
  const lastThree = x.substring(x.length - 3);
  const otherNumbers = x.substring(0, x.length - 3);
  return otherNumbers !== ''
    ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
    : lastThree;
}

}
