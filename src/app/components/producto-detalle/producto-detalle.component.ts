import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArcaneDataService, Product } from '../../services/arcane-data.service';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './producto-detalle.component.html',
  styleUrl: './producto-detalle.component.css'
})
/**
 * @description Componente que maneja la vista detallada de la ficha técnica de un juego de mesa.
 * Proporciona información sobre el precio, descuento, stock disponible y permite al cliente agregarlo al carro en cantidades seleccionadas.
 */
export class ProductoDetalleComponent implements OnInit {
  /**
   * @description El identificador único del producto recuperado del parámetro de ruta activa.
   * @type {string}
   */
  productId: string = '';

  /**
   * @description El objeto del producto a detallar en la ficha, cargado de la base de datos local.
   * @type {Product | undefined}
   */
  product: Product | undefined;

  /**
   * @description La cantidad seleccionada por el usuario para agregar al carrito (por defecto 1).
   * @type {number}
   */
  quantity: number = 1;

  /**
   * @description Constructor del componente.
   * @param {ActivatedRoute} route - Servicio para leer parámetros de la ruta de Angular.
   * @param {Router} router - Servicio de navegación de rutas.
   * @param {ArcaneDataService} service - Servicio de base de datos local y sesión.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ArcaneDataService
  ) {}

  /**
   * @description Inicializa el componente y lee el ID del producto de los parámetros de ruta activa.
   * @returns {void}
   */
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.productId = params['id'] || '';
      this.cargarProducto();
    });
  }

  /**
   * @description Carga la información del producto correspondiente desde el servicio de datos locales.
   * @returns {void}
   */
  cargarProducto(): void {
    this.product = this.service.getProductById(this.productId);
    if (!this.product) {
      alert('Producto no encontrado.');
      this.router.navigate(['/']);
    }
  }

  /**
   * @description Agrega la cantidad indicada del producto al carro de compras del cliente autenticado.
   * Valida stock disponible y roles de cuenta.
   * @returns {void}
   */
  agregarAlCarrito(): void {
    if (!this.product) return;

    const user = this.service.getCurrentUser();
    if (!user) {
      alert('Debes iniciar sesión para poder comprar juegos.');
      this.router.navigate(['/login']);
      return;
    }

    if (user.rol === 'administrador') {
      alert('Los administradores no pueden realizar compras. Inicia sesión como cliente.');
      return;
    }

    if (this.quantity > this.product.stock) {
      alert(`Lo sentimos, solo hay ${this.product.stock} unidades disponibles.`);
      return;
    }

    this.service.addToCart(this.product, this.quantity);
    alert(`¡${this.product.nombre} (${this.quantity} unidad(es)) añadido al carrito!`);
    this.router.navigate(['/categoria', this.product.categoria]);
  }

  /**
   * @description Formatea un número como moneda CLP.
   * @param {number} value - El número a formatear.
   * @returns {string} El valor formateado.
   */
  formatearPrecio(value: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  }
}
