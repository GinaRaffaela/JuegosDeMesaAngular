import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';

/**
 * @description Componente raíz de la aplicación web Lagarto Arcano.
 * Carga el layout base con el navbar, el footer, el contenedor de rutas
 * y la barra flotante de navegación rápida para desarrolladores y evaluadores.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  /**
   * @description Título de la aplicación.
   * @type {string}
   */
  title = 'JuegosDeMesaAngular';

  /**
   * @description Controla la visibilidad del panel lateral de navegación rápida.
   * @type {boolean}
   */
  isQuickNavOpen: boolean = false;

  /**
   * @description Alterna el estado de visualización del menú flotante de componentes.
   * @returns {void}
   */
  toggleQuickNav(): void {
    this.isQuickNavOpen = !this.isQuickNavOpen;
  }
}
