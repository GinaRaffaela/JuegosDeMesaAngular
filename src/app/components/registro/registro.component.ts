import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ArcaneDataService, User } from '../../services/arcane-data.service';
import { ageValidator, passwordMatchValidator, passwordStrengthValidator } from '../../utils/custom-validators';

/**
 * @description Componente encargado del formulario de registro de nuevos usuarios.
 * Aplica reglas de negocio específicas como edad mínima de 13 años y fortaleza de contraseñas.
 */
@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent implements OnInit {
  /**
   * @description El formulario reactivo que maneja el registro del usuario.
   * @type {FormGroup}
   */
  registerForm!: FormGroup;

  /**
   * @description Constructor del componente.
   * @param {FormBuilder} fb - Servicio para la construcción de formularios reactivos.
   * @param {ArcaneDataService} service - Servicio de base de datos local y sesión.
   * @param {Router} router - Servicio de navegación entre rutas.
   */
  constructor(
    private fb: FormBuilder,
    private service: ArcaneDataService,
    private router: Router
  ) {}

  /**
   * @description Inicializa el formulario reactivo de registro de usuario con sus validadores y lógica de coincidencia.
   * @returns {void}
   */
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

  /**
   * @description Getter para acceder a los controladores de formulario de registro.
   * @returns { { [key: string]: AbstractControl } } Los controles del formulario.
   */
  get f() {
    return this.registerForm.controls;
  }

  /**
   * @description Procesa el envío del formulario de registro. Verifica unicidad de usuario/email y guarda la nueva cuenta en el localStorage.
   * @returns {void}
   */
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

  /**
   * @description Restablece todos los campos del formulario de registro y limpia los errores visuales.
   * @returns {void}
   */
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
