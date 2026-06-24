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
/**
 * @description Componente del perfil del cliente.
 * Permite actualizar los datos personales, la dirección de despacho y la contraseña,
 * además de listar el historial de compras realizadas.
 */
export class PerfilComponent implements OnInit {
  /**
   * @description El formulario reactivo que maneja la información del perfil del usuario.
   * @type {FormGroup}
   */
  profileForm!: FormGroup;

  /**
   * @description El listado de compras previas realizadas por el usuario actual.
   * @type {Purchase[]}
   */
  userPurchases: Purchase[] = [];

  /**
   * @description Constructor del componente.
   * @param {ArcaneDataService} service - Servicio de base de datos local y sesión.
   * @param {Router} router - Servicio de enrutamiento de Angular.
   * @param {FormBuilder} fb - Constructor de formularios reactivos.
   */
  constructor(
    private service: ArcaneDataService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  /**
   * @description Inicializa el componente, verifica permisos y construye el formulario de perfil con validadores.
   * @returns {void}
   */
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

  /**
   * @description Getter para acceder a los controladores del formulario en la plantilla HTML.
   * @returns { { [key: string]: AbstractControl } } Los controles del formulario.
   */
  get f() {
    return this.profileForm.controls;
  }

  /**
   * @description Procesa la actualización de los datos del perfil en localStorage.
   * @returns {void}
   */
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

  /**
   * @description Restablece los campos a sus valores actuales guardados del perfil en la base de datos local.
   * @returns {void}
   */
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

  /**
   * @description Formatea un valor numérico a moneda chilena (CLP).
   * @param {number} value - El número a formatear.
   * @returns {string} El string formateado en CLP.
   */
  formatearPrecio(value: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  }
}
