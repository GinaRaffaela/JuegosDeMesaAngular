import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ArcaneDataService, CartItem, Purchase, PurchaseItem } from '../../../services/arcane-data.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
/**
 * @description Componente del carrito de compras del cliente.
 * Permite listar los juegos seleccionados, ajustar cantidades, eliminar productos,
 * calcular subtotales y proceder con la simulación de pago utilizando tarjetas.
 */
export class CarritoComponent implements OnInit {
  /**
   * @description La lista de artículos en el carrito del cliente activo.
   * @type {CartItem[]}
   */
  userCart: CartItem[] = [];

  /**
   * @description El formulario reactivo que maneja los datos de facturación y despacho.
   * @type {FormGroup}
   */
  checkoutForm!: FormGroup;

  /**
   * @description Constructor del componente.
   * @param {ArcaneDataService} service - Servicio de base de datos local y sesión.
   * @param {Router} router - Servicio de enrutamiento de Angular.
   * @param {FormBuilder} fb - Constructor de formularios reactivos.
   */
  constructor(
    public service: ArcaneDataService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  /**
   * @description Inicializa el componente, verifica permisos y construye el formulario de checkout.
   * @returns {void}
   */
  ngOnInit(): void {
    // Proteger ruta
    if (!this.service.checkAccessSecurity('cliente')) return;

    this.checkoutForm = this.fb.group({
      direccion: [''], // Opcional
      tarjetaNombre: ['', Validators.required],
      tarjetaNumero: ['', [Validators.required, Validators.pattern(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/)]],
      tarjetaVence: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      tarjetaCvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]]
    });

    const user = this.service.getCurrentUser();
    if (user) {
      this.userCart = this.service.getUserCart(user.usuario);
      if (user.direccion && user.direccion !== 'No especificada') {
        this.checkoutForm.patchValue({ direccion: user.direccion });
      }
    }
  }

  /**
   * @description Getter para acceder a los controles del formulario desde la plantilla HTML.
   * @returns { { [key: string]: any } } Los controles del formulario.
   */
  get f() {
    return this.checkoutForm.controls;
  }

  /**
   * @description Calcula el subtotal acumulado de los ítems en el carrito usando precios originales.
   * @returns {number} El subtotal.
   */
  get subtotal(): number {
    return this.userCart.reduce((sum, item) => {
      const product = this.service.getProductById(item.productId);
      const originalPrice = product ? product.precio : item.precio;
      return sum + (originalPrice * item.quantity);
    }, 0);
  }

  /**
   * @description Calcula el total del descuento acumulado en el carrito de compras.
   * @returns {number} El descuento total restado.
   */
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

  /**
   * @description Calcula el monto neto total a pagar después de aplicar descuentos.
   * @returns {number} El total neto.
   */
  get total(): number {
    return this.subtotal - this.descuento;
  }

  // --- Cart Adjustments ---

  /**
   * @description Incrementa la cantidad de un ítem en el carrito respetando el stock disponible del producto.
   * @param {CartItem} item - El ítem a incrementar.
   * @returns {void}
   */
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

  /**
   * @description Decrementa la cantidad de un ítem en el carrito de compras (mínimo 1).
   * @param {CartItem} item - El ítem a decrementar.
   * @returns {void}
   */
  decrement(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
      this.service.updateCartQuantity(item.productId, item.quantity);
    }
  }

  /**
   * @description Remueve por completo un producto del carrito del cliente activo pidiendo confirmación.
   * @param {CartItem} item - El ítem del carrito a eliminar.
   * @returns {void}
   */
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

  /**
   * @description Enmascara la entrada del número de tarjeta para formatearlo como 'xxxx xxxx xxxx xxxx'.
   * @param {any} event - El evento de entrada de teclado.
   * @returns {void}
   */
  onCardNumberInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    value = value.match(/.{1,4}/g)?.join(' ') || value;
    this.checkoutForm.patchValue({ tarjetaNumero: value });
  }

  /**
   * @description Enmascara la entrada del vencimiento de la tarjeta formateándolo como 'MM/YY'.
   * @param {any} event - El evento de teclado.
   * @returns {void}
   */
  onCardExpiryInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.checkoutForm.patchValue({ tarjetaVence: value });
  }

  /**
   * @description Enmascara la entrada del código CVV de la tarjeta aceptando solo 3 dígitos numéricos.
   * @param {any} event - El evento de teclado.
   * @returns {void}
   */
  onCardCvvInput(event: any): void {
    const value = event.target.value.replace(/\D/g, '');
    this.checkoutForm.patchValue({ tarjetaCvv: value });
  }

  // --- Checkout ---

  /**
   * @description Procesa la orden de compra. Valida la disponibilidad de stock, debita existencias, registra el ticket en el historial y limpia la cesta de compra.
   * @returns {void}
   */
  onSubmitCheckout(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

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
      direccion: this.checkoutForm.value.direccion || 'No especificada'
    };

    this.service.addPurchase(purchaseTicket);
    this.service.setLastPurchaseTicket(purchaseTicket);

    // D. Limpiar Carrito del Usuario
    this.service.clearUserCart(user.usuario);
    this.userCart = [];

    // Redirección
    this.router.navigate(['/cliente/pago-exito']);
  }

  /**
   * @description Restablece todos los campos de la pasarela de pago a sus valores vacíos iniciales, conservando la dirección por defecto del cliente.
   * @returns {void}
   */
  onReset(): void {
    const user = this.service.getCurrentUser();
    this.checkoutForm.reset({
      direccion: (user && user.direccion && user.direccion !== 'No especificada') ? user.direccion : '',
      tarjetaNombre: '',
      tarjetaNumero: '',
      tarjetaVence: '',
      tarjetaCvv: ''
    });
  }

  /**
   * @description Formatea un número en formato de moneda chilena (CLP).
   * @param {number} value - El número a formatear.
   * @returns {string} El string formateado en CLP.
   */
  formatearPrecio(value: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  }
}
