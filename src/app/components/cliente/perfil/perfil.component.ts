import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ArcaneDataService, Purchase, User } from '../../../services/arcane-data.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  nombre: string = '';
  email: string = '';
  fechaNacimiento: string = '';
  direccion: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  userPurchases: Purchase[] = [];

  constructor(
    private service: ArcaneDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.service.checkAccessSecurity('cliente')) return;

    const user = this.service.getCurrentUser();
    if (user) {
      this.nombre = user.nombre;
      this.email = user.email;
      this.fechaNacimiento = user.fechaNacimiento || '';
      this.direccion = user.direccion === 'No especificada' ? '' : (user.direccion || '');
      this.userPurchases = this.service.getUserPurchases(user.usuario).reverse();
    }
  }

  onSubmitUpdate(): void {
    const user = this.service.getCurrentUser();
    if (!user) return;

    if (this.newPassword !== this.confirmNewPassword) {
      alert('Las contraseñas nuevas no coinciden.');
      return;
    }

    const users = this.service.getUsers();
    const userIndex = users.findIndex(u => u.usuario === user.usuario);
    if (userIndex !== -1) {
      users[userIndex].nombre = this.nombre;
      users[userIndex].email = this.email;
      users[userIndex].fechaNacimiento = this.fechaNacimiento;
      users[userIndex].direccion = this.direccion || 'No especificada';

      if (this.newPassword !== '') {
        users[userIndex].password = this.newPassword;
      }

      // Guardar cambios
      this.service.saveUsers(users);
      this.service.setCurrentUser(users[userIndex]);

      alert('¡Tus datos de arcanista han sido actualizados con éxito!');
      
      // Limpiar claves
      this.newPassword = '';
      this.confirmNewPassword = '';
    }
  }

  formatearPrecio(value: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  }
}
