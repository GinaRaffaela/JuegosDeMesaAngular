import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ArcaneDataService, CartItem, Purchase, PurchaseItem } from '../../../services/arcane-data.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements OnInit {
  userCart: CartItem[] = [];
  direccion: string = '';
  tarjetaNombre: string = '';
  tarjetaNumero: string = '';
  tarjetaVence: string = '';
  tarjetaCvv: string = '';

  constructor(
    public service: ArcaneDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Proteger ruta
    if (!this.service.checkAccessSecurity('cliente')) return;

    const user = this.service.getCurrentUser();
    if (user) {
      this.userCart = this.service.getUserCart(user.usuario);
      if (user.direccion && user.direccion !== 'No especificada') {
        this.direccion = user.direccion;
      }
    }
  }

  get subtotal(): number {
    return this.userCart.reduce((sum, item) => {
      const product = this.service.getProductById(item.productId);
      const originalPrice = product ? product.precio : item.precio;
      return sum + (originalPrice * item.quantity);
    }, 0);
  }

  get descuento(): number {
    return this.userCart.reduce((sum, item) => {
      const product = this.service.getProductById(item.productId);
      if (product && product.descuento > 0) {
        const discountAmt = product.precio * (product.descuento / 100);
        return sum + (discountAmt * item.quantity);
      }
      return sum;
    }, 0);
  }

  get total(): number {
    return this.subtotal - this.descuento;
  }

  // --- Cart Adjustments ---
  increment(item: CartItem): void {
    const product = this.service.getProductById(item.productId);
    if (product) {
      if (item.quantity < product.stock) {
        item.quantity++;
        this.service.updateCartQuantity(item.productId, item.quantity);
      } else {
        alert(`Lo sentimos, no hay más stock disponible de ${product.nombre}. (Stock actual: ${product.stock})`);
      }
    }
  }

  decrement(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
      this.service.updateCartQuantity(item.productId, item.quantity);
    }
  }

  removeItem(item: CartItem): void {
    if (confirm(`¿Quitar ${item.nombre} del carrito?`)) {
      this.service.removeFromCart(item.productId);
      const user = this.service.getCurrentUser();
      if (user) {
        this.userCart = this.service.getUserCart(user.usuario);
      }
    }
  }

  // --- Input Masking ---
  onCardNumberInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    value = value.match(/.{1,4}/g)?.join(' ') || value;
    this.tarjetaNumero = value;
  }

  onCardExpiryInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.tarjetaVence = value;
  }

  onCardCvvInput(event: any): void {
    this.tarjetaCvv = event.target.value.replace(/\D/g, '');
  }

  // --- Checkout ---
  onSubmitCheckout(): void {
    const user = this.service.getCurrentUser();
    if (!user) return;

    // A. Validar stock antes de continuar
    const products = this.service.getProducts();
    let insufficientStock = false;

    for (const item of this.userCart) {
      const product = products.find(p => p.id === item.productId);
      if (product && product.stock < item.quantity) {
        alert(`El juego "${product.nombre}" no cuenta con stock suficiente (${product.stock} disponibles). Por favor ajusta tu cantidad.`);
        insufficientStock = true;
        break;
      }
    }

    if (insufficientStock) return;

    // B. Descontar Inventario y Compilar Items de Compra
    const purchaseItems: PurchaseItem[] = [];
    let totalPaid = 0;

    this.userCart.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        product.stock -= item.quantity;
        const discountedPrice = product.precio * (1 - (product.descuento || 0) / 100);
        totalPaid += discountedPrice * item.quantity;

        purchaseItems.push({
          id: product.id,
          nombre: product.nombre,
          precioUnitario: discountedPrice,
          cantidad: item.quantity
        });
      }
    });

    // Guardar productos con stock actualizado
    this.service.saveProducts(products);

    // C. Registrar compra
    const purchaseTicket: Purchase = {
      id: 'LGA-' + Math.floor(100000 + Math.random() * 900000),
      usuario: user.usuario,
      clienteNombre: user.nombre,
      fecha: new Date().toLocaleDateString('es-CL'),
      juegos: purchaseItems,
      total: totalPaid,
      direccion: this.direccion
    };

    this.service.addPurchase(purchaseTicket);
    this.service.setLastPurchaseTicket(purchaseTicket);

    // D. Limpiar Carrito del Usuario
    this.service.clearUserCart(user.usuario);
    this.userCart = [];

    // Redirección
    this.router.navigate(['/cliente/pago-exito']);
  }

  formatearPrecio(value: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  }
}
