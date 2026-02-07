import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PartyService } from '../services/partyService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionComponent  } from '../transaction/transaction';
import { MatDialog } from '@angular/material/dialog';
import { AddTransactionDialogue } from '../add-transaction-dialogue/add-transaction-dialogue';
import { AddPartyDialog } from '../add-party-dialog/add-party-dialog';



export interface Transaction {
  id: number;
  txDate: string;
  product?: string;
  products?: string[];
  remark: string;
  type: 'credit' | 'debit';
  amount: number;
  balance: number;
  selected?: boolean;
  pid?: number;
}

export interface PartyItem {
  id: number;
  name: string;
  mobileNumber: string;
  address: string;
  balance: number;
  transactions: Transaction[];
}

export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  number: number;
  totalElements: number;
}


@Component({
  selector: 'app-party',
  standalone: true,
  imports: [CommonModule, FormsModule,TransactionComponent],
  templateUrl: './party.html',
  styleUrl: './party.css'
})
export class Party implements OnInit {
  searchTerm: string = '';
  partyData: PartyItem[] = [];
  selectedParty: PartyItem | null = null;
  transactions: Transaction[] = [];
  currentBalance: number = 0;
  
  

  newParty = {
    name: '',
    mobileNumber: '',
    location: ''
  };


  constructor(private partyService: PartyService, private dialog: MatDialog) {}

  ngOnInit(): void {
    const token = 'your-token-here';
    this.partyService.getParties(token).subscribe({
      next: (data: PartyItem[]) => {
        this.partyData = data;
        console.log('Party data:', data);
      },
      error: (err) => {
        console.error('Error fetching party data:', err);
      }
    });
  }


  openAddPartyDialog(): void {
  const dialogRef = this.dialog.open(AddPartyDialog,{
  width: '500px',
  data: { existingParties: this.partyData } // Pass party list
});

  // dialogRef.afterClosed().subscribe((result) => {
  //   if (result) {
  //     const newPartyItem: PartyItem = {
  //       id: Date.now(),
  //       name: result.name,
  //       mobileNumber: result.mobileNumber,
  //       address: result.location,
  //       balance: 0,
  //       transactions: []
  //     };
  //     this.partyData.push(newPartyItem);
  //   }
  // });
    dialogRef.afterClosed().subscribe((result) => {
      console.log("Result : "+result);
      if(result){
        this.partyService.getParties("").subscribe({
        next: (data: PartyItem[]) => {
        this.partyData = data;
        console.log('Party data:', data);
      },
      error: (err) => {
        console.error('Error fetching party data:', err);
      }
    });
      }
    
  });
}
 
 selectParty(party: PartyItem): void {
    this.selectedParty = party;
    console.log('Selected Party ID &&&&&&&&:', this.selectedParty.id);
  }
    
  get filteredParties(): PartyItem[] {
    return this.partyData.filter(p =>
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      p.mobileNumber.includes(this.searchTerm)
    );
  }


  getCurrentBalance(balance: number): void { 
    console.log('Current Balance from Child:', balance);
    this.currentBalance = balance;
  }

}
