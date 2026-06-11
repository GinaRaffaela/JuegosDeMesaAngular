import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ArcaneDataService } from '../../services/arcane-data.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  identificador: string = '';
  password: string = '';
  loginError: boolean = false;

  constructor(
    private service: ArcaneDataService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.loginError = false;

    const registeredUsers = this.service.getUsers();
    const matchedUser = registeredUsers.find(user => 
      user.usuario === this.identificador || user.email === this.identificador
    );

    if (matchedUser && matchedUser.password === this.password) {
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
}
