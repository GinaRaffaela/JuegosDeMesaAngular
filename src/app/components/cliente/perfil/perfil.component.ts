import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ArcaneDataService, Purchase, User } from '../../../services/arcane-data.service';
import { ageValidator, passwordMatchValidator, passwordStrengthValidator } from '../../../utils/custom-validators';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  profileForm!: FormGroup;
  userPurchases: Purchase[] = [];

  constructor(
    private service: ArcaneDataService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    if (!this.service.checkAccessSecurity('cliente')) return;

    this.profileForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      fechaNacimiento: ['', [Validators.required, ageValidator(13)]],
      direccion: [''],
      password: [''],
      confirmPassword: ['']
    }, { validators: passwordMatchValidator });

    // Validaciones condicionales para contraseña
    this.profileForm.get('password')?.valueChanges.subscribe(val => {
      const passCtrl = this.profileForm.get('password');
      const confirmCtrl = this.profileForm.get('confirmPassword');
      if (val) {
        passCtrl?.setValidators([
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(18),
          passwordStrengthValidator
        ]);
        confirmCtrl?.setValidators([Validators.required]);
      } else {
        passCtrl?.clearValidators();
        confirmCtrl?.clearValidators();
      }
      passCtrl?.updateValueAndValidity({ emitEvent: false });
      confirmCtrl?.updateValueAndValidity({ emitEvent: false });
    });

    const user = this.service.getCurrentUser();
    if (user) {
      this.profileForm.patchValue({
        nombre: user.nombre,
        email: user.email,
        fechaNacimiento: user.fechaNacimiento || '',
        direccion: user.direccion === 'No especificada' ? '' : (user.direccion || '')
      });
      this.userPurchases = this.service.getUserPurchases(user.usuario).reverse();
    }
  }

  get f() {
    return this.profileForm.controls;
  }

  onSubmitUpdate(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const user = this.service.getCurrentUser();
    if (!user) return;

    const val = this.profileForm.value;
    const users = this.service.getUsers();
    const userIndex = users.findIndex(u => u.usuario === user.usuario);
    if (userIndex !== -1) {
      users[userIndex].nombre = val.nombre;
      users[userIndex].email = val.email;
      users[userIndex].fechaNacimiento = val.fechaNacimiento;
      users[userIndex].direccion = val.direccion || 'No especificada';

      if (val.password) {
        users[userIndex].password = val.password;
      }

      // Guardar cambios
      this.service.saveUsers(users);
      this.service.setCurrentUser(users[userIndex]);

      alert('¡Tus datos de arcanista han sido actualizados con éxito!');
      
      // Limpiar claves
      this.profileForm.patchValue({
        password: '',
        confirmPassword: ''
      });
      this.profileForm.get('password')?.markAsPristine();
      this.profileForm.get('password')?.markAsUntouched();
      this.profileForm.get('confirmPassword')?.markAsPristine();
      this.profileForm.get('confirmPassword')?.markAsUntouched();
    }
  }

  onReset(): void {
    const user = this.service.getCurrentUser();
    if (user) {
      this.profileForm.reset({
        nombre: user.nombre,
        email: user.email,
        fechaNacimiento: user.fechaNacimiento || '',
        direccion: user.direccion === 'No especificada' ? '' : (user.direccion || ''),
        password: '',
        confirmPassword: ''
      });
    }
  }

  formatearPrecio(value: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  }
}
