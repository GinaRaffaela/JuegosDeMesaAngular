import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ArcaneDataService, User } from '../../../services/arcane-data.service';
import { ageValidator, passwordStrengthValidator } from '../../../utils/custom-validators';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
/**
 * @description Componente encargado de la administración CRUD de las cuentas de usuario y clientes.
 * Permite cambiar roles, registrar nuevos usuarios y editar datos de despacho/desactivación.
 */
export class ClientesComponent implements OnInit {
  /**
   * @description La lista completa de usuarios registrados.
   * @type {User[]}
   */
  usersList: User[] = [];

  /**
   * @description Los detalles del usuario administrador autenticado en la sesión activa.
   * @type {User | null}
   */
  currentUser: User | null = null;

  /**
   * @description El formulario reactivo que maneja la información de la cuenta del cliente/administrador.
   * @type {FormGroup}
   */
  clientForm!: FormGroup;

  /**
   * @description Determina si el componente se encuentra en modo edición o modo creación.
   * @type {boolean}
   */
  isEditing: boolean = false;

  /**
   * @description Título dinámico para el encabezado del formulario.
   * @type {string}
   */
  formTitle: string = 'Agregar Cuenta';

  /**
   * @description Texto del botón de envío del formulario.
   * @type {string}
   */
  btnSubmitText: string = 'Guardar Cuenta';

  /**
   * @description Etiqueta dinámica para el campo de la contraseña.
   * @type {string}
   */
  labelPasswordText: string = 'Contraseña *';

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
   * @description Inicializa el componente, verifica accesos y configura el formulario de clientes.
   * @returns {void}
   */
  ngOnInit(): void {
    if (!this.service.checkAccessSecurity('administrador')) return;
    this.currentUser = this.service.getCurrentUser();

    this.clientForm = this.fb.group({
      nombre: ['', Validators.required],
      usuario: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      rol: ['', Validators.required],
      fechaNacimiento: ['', [Validators.required, ageValidator(13)]],
      direccion: [''],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(18), passwordStrengthValidator]]
    });

    this.clientForm.get('password')?.valueChanges.subscribe(val => {
      const passCtrl = this.clientForm.get('password');
      if (this.isEditing) {
        if (val) {
          passCtrl?.setValidators([
            Validators.minLength(6),
            Validators.maxLength(18),
            passwordStrengthValidator
          ]);
        } else {
          passCtrl?.clearValidators();
        }
      } else {
        passCtrl?.setValidators([
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(18),
          passwordStrengthValidator
        ]);
      }
      passCtrl?.updateValueAndValidity({ emitEvent: false });
    });

    this.cargarUsuarios();
  }

  /**
   * @description Getter para acceder a los controladores del formulario en la plantilla HTML.
   * @returns { { [key: string]: AbstractControl } } Los controles del formulario.
   */
  get f() {
    return this.clientForm.controls;
  }

  /**
   * @description Carga la lista actualizada de usuarios desde el servicio central de datos.
   * @returns {void}
   */
  cargarUsuarios(): void {
    this.usersList = this.service.getUsers();
  }

  /**
   * @description Activa el modo edición cargando los datos del usuario seleccionado en el formulario.
   * @param {User} u - El usuario a editar.
   * @returns {void}
   */
  onEdit(u: User): void {
    this.isEditing = true;
    this.formTitle = 'Editar Cuenta';
    this.btnSubmitText = 'Guardar Cambios';
    this.labelPasswordText = 'Nueva Contraseña (Opcional)';

    this.clientForm.get('usuario')?.disable();
    this.clientForm.get('password')?.clearValidators();
    this.clientForm.get('password')?.updateValueAndValidity();

    this.clientForm.patchValue({
      nombre: u.nombre,
      usuario: u.usuario,
      email: u.email,
      rol: u.rol,
      fechaNacimiento: u.fechaNacimiento || '',
      direccion: u.direccion === 'No especificada' ? '' : (u.direccion || ''),
      password: ''
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * @description Elimina una cuenta de usuario del sistema tras pedir confirmación.
   * @param {User} u - El usuario a eliminar.
   * @returns {void}
   */
  onDelete(u: User): void {
    if (this.currentUser && this.currentUser.usuario === u.usuario) {
      alert('No puedes eliminar tu propia cuenta de administrador activa.');
      return;
    }

    if (confirm(`¿Estás seguro/a de eliminar al usuario @${u.usuario} (${u.nombre})?`)) {
      const updated = this.usersList.filter(user => user.usuario !== u.usuario);
      this.service.saveUsers(updated);
      this.cargarUsuarios();
      this.resetForm();
    }
  }

  /**
   * @description Procesa el envío del formulario. Si es válido, guarda los cambios de un usuario existente o registra un nuevo usuario.
   * @returns {void}
   */
  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    const val = this.clientForm.getRawValue();

    if (this.isEditing) {
      // Modo Edición
      const index = this.usersList.findIndex(u => u.usuario === val.usuario);
      if (index !== -1) {
        // Validar unicidad de email excluyendo a sí mismo
        const emailExists = this.usersList.some(u => u.usuario !== val.usuario && u.email === val.email);
        if (emailExists) {
          alert('El correo electrónico ya está registrado por otra cuenta.');
          return;
        }

        this.usersList[index].nombre = val.nombre;
        this.usersList[index].email = val.email;
        this.usersList[index].rol = val.rol;
        this.usersList[index].fechaNacimiento = val.fechaNacimiento;
        this.usersList[index].direccion = val.direccion || 'No especificada';

        if (val.password) {
          this.usersList[index].password = val.password;
        }

        this.service.saveUsers(this.usersList);
        
        // Si el admin se edita a sí mismo, refrescar la sesión activa
        if (this.currentUser && this.currentUser.usuario === val.usuario) {
          this.service.setCurrentUser(this.usersList[index]);
          this.currentUser = this.usersList[index];
        }

        alert('¡Cuenta modificada con éxito!');
      }
    } else {
      // Modo Creación
      const usernameExists = this.usersList.some(u => u.usuario === val.usuario);
      const emailExists = this.usersList.some(u => u.email === val.email);

      if (usernameExists) {
        alert('El nombre de usuario ya existe.');
        return;
      }
      if (emailExists) {
        alert('El correo electrónico ya está registrado.');
        return;
      }

      const newUser: User = {
        nombre: val.nombre,
        usuario: val.usuario,
        email: val.email,
        rol: val.rol,
        password: val.password,
        fechaNacimiento: val.fechaNacimiento,
        direccion: val.direccion || 'No especificada'
      };

      this.usersList.push(newUser);
      this.service.saveUsers(this.usersList);
      alert('¡Cuenta creada con éxito!');
    }

    this.cargarUsuarios();
    this.resetForm();
  }

  /**
   * @description Restablece todos los campos del formulario de usuario a su estado inicial.
   * @returns {void}
   */
  resetForm(): void {
    this.isEditing = false;
    this.formTitle = 'Agregar Cuenta';
    this.btnSubmitText = 'Guardar Cuenta';
    this.labelPasswordText = 'Contraseña *';
    
    if (this.clientForm) {
      this.clientForm.get('usuario')?.enable();
      this.clientForm.reset({
        nombre: '',
        usuario: '',
        email: '',
        rol: '',
        fechaNacimiento: '',
        direccion: '',
        password: ''
      });
      // Restaurar validadores de creación
      this.clientForm.get('password')?.setValidators([
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(18),
        passwordStrengthValidator
      ]);
      this.clientForm.get('password')?.updateValueAndValidity();
    }
  }
}
