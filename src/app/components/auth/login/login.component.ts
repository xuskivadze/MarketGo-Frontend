import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(7)]]
    });
  }

  ngOnInit() {
    if (this.apiService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
 onLogin() {
    if (this.loginForm.valid) {
      this.apiService.login(this.loginForm.value).subscribe({
        next: (response: any) => {
          const token = typeof response === 'string' ? response : response.token;

          if (token) {
            localStorage.setItem('token', token);
            
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const userId = tokenData.nameid || tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
            if (userId) {
              localStorage.setItem('userId', userId.toString());
            }

            this.apiService.checkAuthStatus();
            
            Swal.fire({
              title: 'წარმატებული ავტორიზაცია!',
              text: 'მოგესალმებით MarketGo-ზე',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            }).then(() => {
              this.router.navigate(['/']);
            });
          }
        },
        error: (err) => {
          console.error("ლოგინის შეცდომა:", err);
          Swal.fire({
            title: 'შეცდომა!',
            text: 'იმეილი ან პაროლი არასწორია',
            icon: 'error',
            confirmButtonColor: '#e94c49'
          });
        }
      });
    } 
  }
}