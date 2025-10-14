import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PartyService } from '../services/partyService';

@Component({
  selector: 'app-add-party-dialog',
  standalone: true,
  templateUrl: './add-party-dialog.html',
  styleUrl: './add-party-dialog.css',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  providers: [PartyService]
})
export class AddPartyDialog {
  partyForm: FormGroup;
  PartyService: any;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddPartyDialog>,
    private partyService: PartyService
  ) {
    this.partyForm = this.fb.group({
      name: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      location: ['', Validators.required]
    });
  }
  
  onSave(): void {
    if (this.partyForm.valid) {
    const token = 'your-token-here'; // Replace with actual token logic
    this.partyService.saveParty(this.partyForm.value, token).subscribe({
      next: (response: any) => {
        console.log('Party saved:', response);
        this.dialogRef.close(response); // Optionally pass back saved data
      },
      error: (err: any) => {
        console.error('Error saving party:', err);
      }
    });
  }
  }

  closeModal(){
    this.dialogRef.close();
  }
}
