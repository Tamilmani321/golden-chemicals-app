import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { PartyItem } from '../party/party';
import { TransactionService } from '../services/transaction.service';


@Component({
  selector: 'app-add-transaction-dialogue',
  standalone: true,
  templateUrl: './add-transaction-dialogue.html',
  styleUrl: './add-transaction-dialogue.css',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule
  ]
})
export class AddTransactionDialogue {
  transactionForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddTransactionDialogue>,
    @Inject(MAT_DIALOG_DATA) public data: { pid: number },
    private transactionService: TransactionService
  ) 
  
  {
    this.transactionForm = this.fb.group({
      txDate: ['', Validators.required],
      product: ['', Validators.required],
      remark: [''],
      type: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]]
      
    });
    console.log('🆔 Party ID received in dialog:', data);
    const partyid = data.pid;
    console.log('🆔 Party ID extracted:', partyid);
  }
  
  onSave(): void {
    if (this.transactionForm.valid) {
      const token = localStorage.getItem('authToken') || '';
       const transactionData = {
      txDate: this.transactionForm.value.txDate, // should be ISO string
      product: this.transactionForm.value.product,
      remark: this.transactionForm.value.remark,
      type: this.transactionForm.value.type,
      amount: this.transactionForm.value.amount,
      partyDto: {
        id: this.data.pid
      }
    };
    console.log('📦 JSON payload:', JSON.stringify(transactionData, null, 2));

    // this.transactionService.saveTransaction(transactionData, token).subscribe({
    //   next: (response) => {
    //     console.log('✅ Transaction saved:', response);
    //     this.dialogRef.close(response);
    //   },
    //   error: (err) => {
    //     console.error('❌ Error saving transaction:', err);
    //   }
    // });
    
      this.transactionService.saveTransaction(transactionData, token).subscribe({
      next: () => {
        this.transactionService.getTransactionsByPartyId(transactionData.partyDto.id).subscribe({
          next: (updatedTransactions) => {
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
}
