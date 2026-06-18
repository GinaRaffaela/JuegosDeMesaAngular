import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ArcaneDataService, User } from '../../services/arcane-data.service';
import { ageValidator, passwordMatchValidator, passwordStrengthValidator } from '../../utils/custom-validators';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent implements OnInit {
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: ArcaneDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      usuario: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      rol: ['', Validators.required],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(18),
        passwordStrengthValidator
      ]],
      confirmPassword: ['', Validators.required],
      fechaNacimiento: ['', [Validators.required, ageValidator(13)]],
      direccion: [''] // Opcional
    }, { validators: passwordMatchValidator });
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { nombre, usuario, email, rol, password, fechaNacimiento, direccion } = this.registerForm.value;

    const users = this.service.getUsers();
    const exists = users.some(u => u.usuario === usuario || u.email === email);
    if (exists) {
      alert('El nombre de usuario o correo electrónico ya está registrado.');
      return;
    }

    const newUser: User = {
      nombre,
      usuario,
      email,
      password,
      fechaNacimiento,
      direccion: direccion || 'No especificada',
      rol: rol as 'administrador' | 'cliente'
    };

    users.push(newUser);
    this.service.saveUsers(users);
    
    alert('¡Usuario registrado con éxito! Ahora puedes iniciar sesión.');
    this.router.navigate(['/login']);
  }

  onReset(): void {
    this.registerForm.reset({
      nombre: '',
      usuario: '',
      email: '',
      rol: '',
      password: '',
      confirmPassword: '',
      fechaNacimiento: '',
      direccion: ''
    });
  }
}
