import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ArcaneDataService } from '../../services/arcane-data.service';

/**
 * @description Componente encargado del formulario de inicio de sesión.
 * Permite a los usuarios ingresar mediante su nombre de usuario o correo electrónico y contraseña.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  /**
   * @description El formulario reactivo que maneja las credenciales del usuario.
   * @type {FormGroup}
   */
  loginForm!: FormGroup;

  /**
   * @description Indica si ocurrió un error en las credenciales al intentar iniciar sesión.
   * @type {boolean}
   */
  loginError: boolean = false;

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
   * @description Inicializa el componente configurando el formulario reactivo y sus validadores.
   * @returns {void}
   */
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      identificador: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  /**
   * @description Getter para acceder de manera abreviada a los controles del formulario desde la plantilla.
   * @returns { { [key: string]: AbstractControl } } Controles del formulario.
   */
  get f() {
    return this.loginForm.controls;
  }

  /**
   * @description Procesa el envío del formulario. Valida las credenciales contra la base de datos de usuarios registrados en el servicio.
   * @returns {void}
   */
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

  /**
   * @description Restablece todos los campos del formulario de inicio de sesión y limpia los errores visuales.
   * @returns {void}
   */
  onReset(): void {
    this.loginForm.reset();
    this.loginError = false;
  }
}
