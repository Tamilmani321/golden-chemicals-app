import { Component, OnInit } from '@angular/core';
import { PartyService } from '../services/partyService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionComponent  } from '../transaction/transaction';

export interface Transaction {
  date: string;
  description: string;
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



  constructor(private partyService: PartyService) {}

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
