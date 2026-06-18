import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ArcaneDataService } from '../../services/arcane-data.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loginError: boolean = false;

  constructor(
    private fb: FormBuilder,
    private service: ArcaneDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      identificador: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loginError = false;
    const { identificador, password } = this.loginForm.value;

    const registeredUsers = this.service.getUsers();
    const matchedUser = registeredUsers.find(user => 
      user.usuario === identificador || user.email === identificador
    );

    if (matchedUser && matchedUser.password === password) {
      this.service.setCurrentUser(matchedUser);
      alert(`¡Bienvenido de vuelta, ${matchedUser.nombre}!`);
      
      if (matchedUser.rol === 'administrador') {
        this.router.navigate(['/admin/productos']);
      } else {
        this.router.navigate(['/']);
      }
    } else {
      this.loginError = true;
    }
  }

  onReset(): void {
    this.loginForm.reset();
    this.loginError = false;
  }
}
