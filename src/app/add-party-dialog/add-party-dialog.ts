import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PartyService } from '../services/partyService';
import { PartyItem } from '../party/party';
import { of, Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

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
  partyForm!: FormGroup;

  existingPartyNames: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddPartyDialog>,
    private partyService: PartyService,
    @Inject(MAT_DIALOG_DATA) public data: { existingParties: PartyItem[] }
  ) {}

  ngOnInit(): void {
    this.existingPartyNames = this.data.existingParties.map(p => p.name.trim().toLowerCase());
    this.initForm();
  }

  initForm(): void {
    this.partyForm = this.fb.group({
      name: ['', {
        validators: [Validators.required],
        asyncValidators: [this.partyExistsValidator()],
        updateOn: 'change' // or 'change' for live typing
      }],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      location: ['', Validators.required]
    });
  }

  partyExistsValidator(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return of(control.value).pipe(
      debounceTime(300),
      map(value => {
        const normalized = value?.trim().toLowerCase();
        const exists = this.existingPartyNames.includes(normalized);
        return exists ? { partyExists: true } : null;
      })
    );
  };
}


  onSave(): void {
    if (this.partyForm.valid) {
      const token = 'your-token-here'; // Replace with actual token logic
      this.partyService.saveParty(this.partyForm.value, token).subscribe({
        next: (response: any) => {
          console.log('✅ Party saved:', response);
          this.dialogRef.close(response);
        },
        error: (err: any) => {
          console.error('❌ Error saving party:', err);
        }
      });
    }
  }

  closeModal(): void {
    this.dialogRef.close();
  }
}
