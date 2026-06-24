import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArcaneDataService, Product } from '../../services/arcane-data.service';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.css'
})
/**
 * @description Componente encargado de listar los juegos pertenecientes a una categoría específica.
 * Filtra los productos de manera dinámica leyendo el parámetro de la ruta activa.
 */
export class CategoriaComponent implements OnInit {
  /**
   * @description El identificador/tipo de categoría recibido en la URL (ej. 'estrategia').
   * @type {string}
   */
  tipo: string = '';

  /**
   * @description El título estético correspondiente a la categoría activa.
   * @type {string}
   */
  titulo: string = '';

  /**
   * @description Breve descripción de la categoría para desplegar en el encabezado.
   * @type {string}
   */
  descripcion: string = '';

  /**
   * @description Listado de productos filtrados que pertenecen a esta categoría.
   * @type {Product[]}
   */
  productosFiltrados: Product[] = [];

  /**
   * @description Constructor del componente.
   * @param {ActivatedRoute} route - Servicio para leer parámetros de la ruta activa.
   * @param {Router} router - Servicio de enrutamiento de Angular.
   * @param {ArcaneDataService} service - Servicio de base de datos local y sesión.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ArcaneDataService
  ) {}

  /**
   * @description Se suscribe a los cambios del parámetro de la ruta para recargar la categoría correspondiente.
   * @returns {void}
   */
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tipo = params['tipo'] || '';
      this.cargarCategoria();
    });
  }

  /**
   * @description Carga la información de textos del switch-case y recupera de ArcaneDataService los juegos de esta categoría.
   * @returns {void}
   */
  cargarCategoria(): void {
    // Definir títulos y descripciones según el parámetro
    switch (this.tipo) {
      case 'estrategia':
        this.titulo = 'Juegos de Estrategia';
        this.descripcion = 'Pon a prueba tu mente y tácticas. Toma el control del tablero, administra recursos y supera a tus rivales.';
        break;
      case 'familiares':
        this.titulo = 'Juegos Familiares';
        this.descripcion = 'Diversión equilibrada para todas las edades. Reglas sencillas y dinámicas atrapantes para tardes inolvidables en familia.';
        break;
      case 'party':
        this.titulo = 'Party Games';
        this.descripcion = '¡Risas garantizadas! Juegos rápidos, dinámicos y sencillos ideales para romper el hielo y jugar con muchos amigos.';
        break;
      case 'cooperativos':
        this.titulo = 'Juegos Cooperativos';
        this.descripcion = 'Aquí todos ganan o todos pierden. Trabaja en equipo, combina habilidades y logren juntos la victoria contra el tablero.';
        break;
      default:
        this.titulo = 'Catálogo de Juegos';
        this.descripcion = 'Explora nuestro catálogo mágico de juegos de mesa modernos.';
        break;
    }

    // Filtrar productos
    const allProducts = this.service.getProducts();
    this.productosFiltrados = allProducts.filter(p => p.categoria === this.tipo);
  }

  /**
   * @description Añade el producto seleccionado al carrito del cliente activo. Solicita autenticación si es invitado.
   * @param {Product} product - El producto/juego a agregar.
   * @returns {void}
   */
  agregarAlCarrito(product: Product): void {
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

    this.service.addToCart(product, 1);
    alert(`¡${product.nombre} añadido al carrito con éxito!`);
  }

  /**
   * @description Formatea un número como moneda chilena (CLP).
   * @param {number} value - El número a formatear.
   * @returns {string} El string formateado.
   */
  formatearPrecio(value: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  }
}
