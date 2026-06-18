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
export class ClientesComponent implements OnInit {
  usersList: User[] = [];
  currentUser: User | null = null;
  clientForm!: FormGroup;

  isEditing: boolean = false;
  formTitle: string = 'Agregar Cuenta';
  btnSubmitText: string = 'Guardar Cuenta';
  labelPasswordText: string = 'Contraseña *';

  constructor(
    private service: ArcaneDataService,
    private router: Router,
    private fb: FormBuilder
  ) {}

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

  get f() {
    return this.clientForm.controls;
  }

  cargarUsuarios(): void {
    this.usersList = this.service.getUsers();
  }

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
