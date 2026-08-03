import { Routes } from '@angular/router';
import { authGuard } from '@shared-core';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  { path: '**', redirectTo: '' }
];
