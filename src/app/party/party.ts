import { Component, OnInit } from '@angular/core';
import { PartyService } from '../services/partyService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Transaction {
  date: string;
  description: string;
  type: 'credit' | 'debit';
  amount: number;
  balance: number;
}

interface PartyItem {
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
  imports: [CommonModule, FormsModule],
  templateUrl: './party.html',
  styleUrl: './party.css'
})
export class Party implements OnInit {
  searchTerm: string = '';
  partyData: PartyItem[] = [];
  selectedParty: PartyItem | null = null;

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
  }

  getBalanceClass(balance: number): string {
    return balance < 0 ? 'red' : 'green';
  }
}
