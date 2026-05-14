import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      city: ['', [Validators.required]],
      address: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(7)]]
    });
  }

 onSubmit() {
  if (this.registerForm.valid) {
    this.api.register(this.registerForm.value).subscribe({
      next: (response) => {
        Swal.fire({
          title: 'წარმატებული რეგისტრაცია!',
          text: 'კეთილი იყოს შენი მობრძანება MarketGo-ში!',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          heightAuto: false,
          showClass: {
            popup: 'animate__animated animate__fadeInUp'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutDown'
          }
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        Swal.fire({
          title: 'შეცდომა!',
          text: 'რეგისტრაცია ვერ მოხერხდა. შესაძლოა მეილი უკვე დაკავებულია.',
          icon: 'error',
          confirmButtonText: 'გასაგებია',
          confirmButtonColor: '#2ecc71'
        });
      }
    });
  } else {
    Object.values(this.registerForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}

}