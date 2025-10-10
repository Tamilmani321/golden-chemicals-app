import { Component, OnInit } from '@angular/core';
import { PartyService } from '../services/partyService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionComponent  } from '../transaction/transaction';
import { MatDialog } from '@angular/material/dialog';
import { AddPartyDialog } from '../add-party-dialog/add-party-dialog';
import { AddTransactionDialogue } from '../add-transaction-dialogue/add-transaction-dialogue';



export interface Transaction {
  txDate: string;
  product: string;
  remark: string;
  type: 'credit' | 'debit';
  amount: number;
  balance: number;
}

export interface PartyItem {
  id: number;
  name: string;
  mobileNumber: string;
  address: string;
  balance: number;
  transactions: Transaction[];
}


@Component({
  selector: 'app-party',
  standalone: true,
  imports: [CommonModule, FormsModule,TransactionComponent ],
  templateUrl: './party.html',
  styleUrl: './party.css'
})
export class Party implements OnInit {
  searchTerm: string = '';
  partyData: PartyItem[] = [];
  selectedParty: PartyItem | null = null;
  transactions: Transaction[] = [];
  showAddPartyForm = false;

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
  const dialogRef = this.dialog.open(AddPartyDialog);

  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      const newPartyItem: PartyItem = {
        id: Date.now(),
        name: result.name,
        mobileNumber: result.mobileNumber,
        address: result.location,
        balance: 0,
        transactions: []
      };
      this.partyData.push(newPartyItem);
    }
  });
}

openAddTransactionDialog(): void {
  console.log("Selected Party Id : "+this.selectedParty?.id);
  const dialogRef = this.dialog.open(AddTransactionDialogue,{
  data: { party: this.selectedParty?.id }
  
});

  
}
    
  get filteredParties(): PartyItem[] {
    return this.partyData.filter(p =>
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      p.mobileNumber.includes(this.searchTerm)
    );
  }

  selectParty(party: PartyItem): void {
    this.selectedParty = party;
    this.selectedParty.id;
  }

  getBalanceClass(balance: number): string {
    return balance < 0 ? 'red' : 'green';
  }

}
