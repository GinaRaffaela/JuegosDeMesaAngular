import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent {
  nombre: string = '';
  email: string = '';
  telefono: string = '';
  juego: string = '';
  mensaje: string = '';

  enviarMensaje(): void {
    alert('¡Mensaje enviado con éxito! Nos comunicaremos contigo muy pronto.');
    // Limpiar formulario
    this.nombre = '';
    this.email = '';
    this.telefono = '';
    this.juego = '';
    this.mensaje = '';
  }
}
