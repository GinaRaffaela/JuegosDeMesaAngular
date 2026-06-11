import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ArcaneDataService, User } from '../../services/arcane-data.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  nombre: string = '';
  usuario: string = '';
  email: string = '';
  rol: string = '';
  password: string = '';
  confirmPassword: string = '';
  fechaNacimiento: string = '';
  direccion: string = '';

  constructor(
    private service: ArcaneDataService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    const users = this.service.getUsers();
    const exists = users.some(u => u.usuario === this.usuario || u.email === this.email);
    if (exists) {
      alert('El nombre de usuario o correo electrónico ya está registrado.');
      return;
    }

    const newUser: User = {
      nombre: this.nombre,
      usuario: this.usuario,
      email: this.email,
      password: this.password,
      fechaNacimiento: this.fechaNacimiento,
      direccion: this.direccion || 'No especificada',
      rol: this.rol as 'administrador' | 'cliente'
    };

    users.push(newUser);
    this.service.saveUsers(users);
    
    alert('¡Usuario registrado con éxito! Ahora puedes iniciar sesión.');
    this.router.navigate(['/login']);
  }

  onReset(): void {
    this.nombre = '';
    this.usuario = '';
    this.email = '';
    this.rol = '';
    this.password = '';
    this.confirmPassword = '';
    this.fechaNacimiento = '';
    this.direccion = '';
  }
}
