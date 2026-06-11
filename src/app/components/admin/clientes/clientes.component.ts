import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ArcaneDataService, User } from '../../../services/arcane-data.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent implements OnInit {
  usersList: User[] = [];
  currentUser: User | null = null;

  // Campos del Formulario
  nombre: string = '';
  usuario: string = '';
  email: string = '';
  rol: 'administrador' | 'cliente' | '' = '';
  password: string = '';
  fechaNacimiento: string = '';
  direccion: string = '';

  isEditing: boolean = false;
  formTitle: string = 'Agregar Cuenta';
  btnSubmitText: string = 'Guardar Cuenta';
  labelPasswordText: string = 'Contraseña *';

  constructor(
    private service: ArcaneDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.service.checkAccessSecurity('administrador')) return;
    this.currentUser = this.service.getCurrentUser();
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usersList = this.service.getUsers();
  }

  onEdit(u: User): void {
    this.nombre = u.nombre;
    this.usuario = u.usuario;
    this.email = u.email;
    this.rol = u.rol;
    this.fechaNacimiento = u.fechaNacimiento || '';
    this.direccion = u.direccion === 'No especificada' ? '' : (u.direccion || '');
    this.password = ''; // Opcional en edición

    this.isEditing = true;
    this.formTitle = 'Editar Cuenta';
    this.btnSubmitText = 'Guardar Cambios';
    this.labelPasswordText = 'Nueva Contraseña (Opcional)';

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
    if (this.isEditing) {
      // Modo Edición
      const index = this.usersList.findIndex(u => u.usuario === this.usuario);
      if (index !== -1) {
        // Validar unicidad de email excluyendo a sí mismo
        const emailExists = this.usersList.some(u => u.usuario !== this.usuario && u.email === this.email);
        if (emailExists) {
          alert('El correo electrónico ya está registrado por otra cuenta.');
          return;
        }

        this.usersList[index].nombre = this.nombre;
        this.usersList[index].email = this.email;
        this.usersList[index].rol = this.rol as 'administrador' | 'cliente';
        this.usersList[index].fechaNacimiento = this.fechaNacimiento;
        this.usersList[index].direccion = this.direccion || 'No especificada';

        if (this.password !== '') {
          this.usersList[index].password = this.password;
        }

        this.service.saveUsers(this.usersList);
        
        // Si el admin se edita a sí mismo, refrescar la sesión activa
        if (this.currentUser && this.currentUser.usuario === this.usuario) {
          this.service.setCurrentUser(this.usersList[index]);
          this.currentUser = this.usersList[index];
        }

        alert('¡Cuenta modificada con éxito!');
      }
    } else {
      // Modo Creación
      const usernameExists = this.usersList.some(u => u.usuario === this.usuario);
      const emailExists = this.usersList.some(u => u.email === this.email);

      if (usernameExists) {
        alert('El nombre de usuario ya existe.');
        return;
      }
      if (emailExists) {
        alert('El correo electrónico ya está registrado.');
        return;
      }

      const newUser: User = {
        nombre: this.nombre,
        usuario: this.usuario,
        email: this.email,
        rol: this.rol as 'administrador' | 'cliente',
        password: this.password,
        fechaNacimiento: this.fechaNacimiento,
        direccion: this.direccion || 'No especificada'
      };

      this.usersList.push(newUser);
      this.service.saveUsers(this.usersList);
      alert('¡Cuenta creada con éxito!');
    }

    this.cargarUsuarios();
    this.resetForm();
  }

  resetForm(): void {
    this.nombre = '';
    this.usuario = '';
    this.email = '';
    this.rol = '';
    this.password = '';
    this.fechaNacimiento = '';
    this.direccion = '';
    
    this.isEditing = false;
    this.formTitle = 'Agregar Cuenta';
    this.btnSubmitText = 'Guardar Cuenta';
    this.labelPasswordText = 'Contraseña *';
  }
}
