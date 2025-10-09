import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Auth } from '../auth';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule,CommonModule,RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;
  showError: boolean = false;

  constructor(private auth: Auth, private router:Router) {}

  onLogin(form: NgForm) {
    if (form.invalid) {
      form.form.markAllAsTouched(); // highlight all invalid fields
      return;
    } 
    this.loading = true;
    this.errorMessage = '';
    this.showError = false;

    this.auth.login(this.username, this.password).subscribe({
      next : (response) =>{
        if(response.token){
          this.auth.saveToken(response.token);
          console.log("Navigating to welcome page...");
          this.router.navigate(['party'], { state: { username: response.username || this.username } });
        }
        else {
          this.showAnimatedError('Invalid username or password');
        }
        this.loading = false;
        form.resetForm();
      },
      error: () => {
        this.showAnimatedError('Invalid username or password');
        form.resetForm();
        this.loading = false;
      }
    });
  }

  // onLogin(form: NgForm) {
  //   if (form.valid) {
  //     // Example login validation
  //     if (this.username === 'admin' && this.password === '123456') {
  //       // Navigate to HomeComponent (welcome route)
  //       // this.router.navigate(['/welcome'], { state: { username: this.username } });
  //       this.router.navigate(['/welcome'], { state: { username: this.username } });
  //     } else {
  //       alert('Invalid credentials!');
  //     }
  //   } else {
  //     alert('Please fill all required fields!');
  //   }
  // }

  showAnimatedError(msg: string) {
    this.errorMessage = msg;
    this.showError = true;
    // Hide automatically after 5 seconds
    setTimeout(() => {
      this.showError = false;
    }, 5000);
  }
  
}
