  import { Routes } from '@angular/router';
  import { Login } from './login/login';
  import { HomeComponent } from './home-component/home-component';
import { Party } from './party/party';

  export const routes: Routes = [
    { path: '', component: Login },
    { path: 'welcome', component: HomeComponent },
    { path: 'party', component: Party },
    { path: '**', redirectTo: '' }
  ];
