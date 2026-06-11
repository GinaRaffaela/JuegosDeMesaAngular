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
export class ProductoDetalleComponent implements OnInit {
  productId: string = '';
  product: Product | undefined;
  quantity: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ArcaneDataService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.productId = params['id'] || '';
      this.cargarProducto();
    });
  }

  cargarProducto(): void {
    this.product = this.service.getProductById(this.productId);
    if (!this.product) {
      alert('Producto no encontrado.');
      this.router.navigate(['/']);
    }
  }

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

  formatearPrecio(value: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  }
}
