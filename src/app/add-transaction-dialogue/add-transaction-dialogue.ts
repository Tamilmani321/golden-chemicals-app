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
    @Inject(MAT_DIALOG_DATA) public data: { party: PartyItem }
  ) {
    this.transactionForm = this.fb.group({
      txDate: ['', Validators.required],
      product: ['', Validators.required],
      remark: [''],
      type: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]]
    });
  }

  onSave(): void {
    if (this.transactionForm.valid) {
      const transactionData = {
        ...this.transactionForm.value,
        // partyId: this.data.party.id
      };

      console.log('✅ Transaction Data:', transactionData);
      console.log('🧑 Active Party ID:', this.data);

      this.dialogRef.close(transactionData);
    }
  }
}
