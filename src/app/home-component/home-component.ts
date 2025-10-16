import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-component',
  imports: [CommonModule,RouterModule],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css'
})
export class HomeComponent implements OnInit {
  username: string | undefined;

  ngOnInit() {
  this.username = history.state['username'];
  console.log('Username:', this.username);
}

}