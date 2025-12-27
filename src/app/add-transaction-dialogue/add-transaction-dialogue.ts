import { Component, EventEmitter, Inject, Output } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
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
    MatDialogModule,
    MatSelectModule
  ]
})
export class AddTransactionDialogue {
  transactionForm: FormGroup;
  productList: string[] = [
  'SAFOLITE',
  'HYDROES',
  'BICARBONATE',
  'RB',
  'DENSE SODA',
  'S. BAG',
  'W. BAG',
  'SNL BAG',
  'NATURAL BAG',
  'NANA BAG',
  'SOAP',
  'OIL',
  'OTHERS'
];
  formattedAmount = '';
  originalAmount: number | null = null;
  @Output() currentBalanceEmit = new EventEmitter<number>();
  
  
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddTransactionDialogue>,
    @Inject(MAT_DIALOG_DATA) public data: { pid: number },
    private transactionService: TransactionService
  ) 
  
  {
    this.transactionForm = this.fb.group({
      txDate: ['', Validators.required],
      products: [[], Validators.required], 
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
      txDate: new Date(this.transactionForm.value.txDate).toISOString(),
      products: this.transactionForm.value.products,
      remark: this.transactionForm.value.remark,
      type: this.transactionForm.value.type,
      amount: this.transactionForm.value.amount,
      partyDto: {
        id: this.data.pid
      }
    };
    console.log('📦 JSON payload:', JSON.stringify(transactionData, null, 2));
    
      this.transactionService.saveTransaction(transactionData, token).subscribe({
      next: () => {
        
        this.transactionService.getTransactionsByPartyId(transactionData.partyDto.id,0,5).subscribe({
          next: (updatedTransactions) => {
            const data = updatedTransactions.content || [];
            this.currentBalanceEmit.emit(data[0]?.balance || 0);
            console.log("Current Balance%%%$$$%%$$% : "+ data[0]?.balance);
            console.log('🔁 Updated transactions:', data);
            this.dialogRef.close(data); // send updated list back
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
