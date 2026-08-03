import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="login-wrapper">
      <mat-card class="login-card glass-card">
        <mat-card-header class="card-header">
          <div class="brand-avatar">
            <mat-icon>lock</mat-icon>
          </div>
          <mat-card-title>Acesso ao Sistema</mat-card-title>
          <mat-card-subtitle>Entre com suas credenciais para gerenciar o SmartJewel</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <!-- Email Input -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>E-mail</mat-label>
              <input matInput formControlName="email" type="email" placeholder="exemplo@smartjewel.com" />
              <mat-icon matPrefix>email</mat-icon>
              @if (loginForm.get('email')?.hasError('required')) {
                <mat-error>O e-mail é obrigatório</mat-error>
              }
              @if (loginForm.get('email')?.hasError('email')) {
                <mat-error>Digite um e-mail válido</mat-error>
              }
            </mat-form-field>

            <!-- Senha Input -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input matInput formControlName="senha" [type]="hidePassword ? 'password' : 'text'" />
              <mat-icon matPrefix>key</mat-icon>
              <button
                type="button"
                mat-icon-button
                matSuffix
                (click)="hidePassword = !hidePassword"
                [attr.aria-label]="'Alternar visibilidade da senha'"
              >
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (loginForm.get('senha')?.hasError('required')) {
                <mat-error>A senha é obrigatória</mat-error>
              }
            </mat-form-field>

            <!-- Submit Button -->
            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="submit-button"
              [disabled]="loginForm.invalid || isLoading"
            >
              @if (isLoading) {
                <mat-spinner diameter="24" class="spinner"></mat-spinner>
              } @else {
                <ng-container>
                  <span>Entrar no Sistema</span>
                  <mat-icon>arrow_forward</mat-icon>
                </ng-container>
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: calc(100vh - 120px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 1.5rem 1rem;
      border-radius: 20px;
    }

    .card-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .brand-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      color: #ffffff;
      box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
    }

    .card-header mat-card-title {
      font-size: 1.6rem;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 0.4rem;
    }

    .card-header mat-card-subtitle {
      color: #94a3b8;
      font-size: 0.9rem;
    }

    .full-width {
      width: 100%;
      margin-bottom: 0.8rem;
    }

    .submit-button {
      width: 100%;
      height: 48px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 12px;
      margin-top: 0.5rem;
      background: linear-gradient(135deg, #3f51b5 0%, #a855f7 100%) !important;
      color: #ffffff !important;

      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .submit-button:disabled {
      opacity: 0.6;
    }

    .spinner {
      margin: 0 auto;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]]
  });

  hidePassword = true;
  isLoading = false;

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Login realizado com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        const errorMsg = err.error?.message || 'Falha na autenticação. Verifique seu e-mail e senha.';
        this.snackBar.open(errorMsg, 'Fechar', {
          duration: 5000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }
}
