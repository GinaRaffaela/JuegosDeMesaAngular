import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * @description Componente de la página de inicio.
 * Presenta el banner hero de bienvenida y las tarjetas de las categorías del catálogo.
 */
@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {}
