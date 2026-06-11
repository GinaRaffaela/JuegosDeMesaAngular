import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface Product {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: number;
  descuento: number; // percentage (e.g. 15 for 15% OFF)
  stock: number;
  imagen: string;
}

export interface User {
  nombre: string;
  usuario: string;
  email: string;
  password?: string;
  fechaNacimiento?: string;
  direccion?: string;
  rol: 'administrador' | 'cliente';
}

export interface CartItem {
  username: string;
  productId: string;
  nombre: string;
  precio: number; // unit price after discount
  imagen: string;
  quantity: number;
}

export interface PurchaseItem {
  id: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
}

export interface Purchase {
  id: string;
  usuario: string;
  clienteNombre: string;
  fecha: string;
  juegos: PurchaseItem[];
  total: number;
  direccion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArcaneDataService {
  private defaultProducts: Product[] = [
    {
      id: "est-catan",
      nombre: "Catan",
      categoria: "estrategia",
      descripcion: "Funda tus pueblos, traza rutas comerciales clave y compite astutamente por el control de los valiosos recursos de la isla de Catan.",
      precio: 34990,
      descuento: 15,
      stock: 8,
      imagen: "https://images.unsplash.com/photo-1605870445919-838d190e8e1b?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: "est-carcassonne",
      nombre: "Carcassonne",
      categoria: "estrategia",
      descripcion: "Crea un precioso paisaje medieval loseta por loseta. Ubica estratégicamente a tus caballeros, ladrones y monjes en caminos y castillos.",
      precio: 28990,
      descuento: 0,
      stock: 12,
      imagen: "https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: "est-splendor",
      nombre: "Splendor",
      categoria: "estrategia",
      descripcion: "Conviértete en un comerciante rico y prestigioso del Renacimiento. Adquiere gemas exclusivas, barcos de transporte y contrata artesanos.",
      precio: 32990,
      descuento: 10,
      stock: 5,
      imagen: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: "fam-ticket",
      nombre: "Ticket to Ride",
      categoria: "familiares",
      descripcion: "¡Una aventura ferroviaria! Reúne cartas de vagones de colores para conectar ciudades de Norteamérica y completar tus rutas secretas.",
      precio: 39990,
      descuento: 20,
      stock: 10,
      imagen: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: "fam-dixit",
      nombre: "Dixit",
      categoria: "familiares",
      descripcion: "Despierta tu creatividad. Narra pistas místicas inspiradas en hermosas e inusuales cartas ilustradas para que tus amigos las descubran.",
      precio: 24990,
      descuento: 0,
      stock: 15,
      imagen: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: "fam-kingoftokyo",
      nombre: "King of Tokyo",
      categoria: "familiares",
      descripcion: "Juega como un monstruo mutante gigante o un robot colosal. Lanza los dados para curarte, ganar energía o atacar ferozmente a tus rivales.",
      precio: 35990,
      descuento: 15,
      stock: 6,
      imagen: "https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: "pty-exploding",
      nombre: "Exploding Kittens",
      categoria: "party",
      descripcion: "¡Una ruleta rusa con gatitos explosivos y rayos láser! Evita a toda costa robar el gatito explosivo usando cartas de desactivación.",
      precio: 19990,
      descuento: 0,
      stock: 20,
      imagen: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: "pty-dobble",
      nombre: "Dobble",
      categoria: "party",
      descripcion: "¡El juego de velocidad visual definitivo! Encuentra el único símbolo coincidente entre dos cartas antes que tus oponentes.",
      precio: 14990,
      descuento: 10,
      stock: 25,
      imagen: "https://images.unsplash.com/photo-1589802829985-817e51171b92?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: "pty-junglespeed",
      nombre: "Jungle Speed",
      categoria: "party",
      descripcion: "Revela tus cartas y sé extremadamente rápido en atrapar el tótem de madera central cuando las formas coincidan exactamente.",
      precio: 21990,
      descuento: 15,
      stock: 4,
      imagen: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: "cop-pandemic",
      nombre: "Pandemic",
      categoria: "cooperativos",
      descripcion: "¡Salven al planeta entero de epidemias catastróficas! Encarnen a especialistas que viajan conteniendo brotes mientras buscan curas.",
      precio: 38990,
      descuento: 15,
      stock: 7,
      imagen: "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: "cop-island",
      nombre: "Isla Prohibida",
      categoria: "cooperativos",
      descripcion: "Coordinen habilidades en equipo para recuperar cuatro reliquias místicas ocultas en una isla que se sumerge segundo a segundo.",
      precio: 26990,
      descuento: 0,
      stock: 9,
      imagen: "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: "cop-themind",
      nombre: "The Mind",
      categoria: "cooperativos",
      descripcion: "Consigan apilar en orden numérico ascendente todas las cartas de sus manos sin hablar, gesticular, ni mandarse señales explícitas.",
      precio: 12990,
      descuento: 10,
      stock: 14,
      imagen: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=400&auto=format&fit=crop"
    }
  ];

  private defaultUsers: User[] = [
    {
      nombre: "Administrador Lagarto",
      usuario: "admin",
      email: "admin@lagartoarcano.cl",
      password: "Admin123!",
      fechaNacimiento: "1990-01-01",
      direccion: "Cueva del Mago 406, Viña del Mar",
      rol: "administrador"
    },
    {
      nombre: "Juan Pérez",
      usuario: "cliente",
      email: "cliente@gmail.com",
      password: "Cliente123!",
      fechaNacimiento: "2000-05-15",
      direccion: "Calle Valparaíso 123, Viña del Mar",
      rol: "cliente"
    }
  ];

  constructor(private router: Router) {
    this.initLocalStorage();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private initLocalStorage() {
    if (!this.isBrowser()) return;

    if (!localStorage.getItem('products')) {
      localStorage.setItem('products', JSON.stringify(this.defaultProducts));
    }
    if (!localStorage.getItem('registeredUsers')) {
      localStorage.setItem('registeredUsers', JSON.stringify(this.defaultUsers));
    }
    if (!localStorage.getItem('cart')) {
      localStorage.setItem('cart', JSON.stringify([]));
    }
    if (!localStorage.getItem('purchases')) {
      localStorage.setItem('purchases', JSON.stringify([]));
    }
  }

  // --- Session Management ---
  getCurrentUser(): User | null {
    if (!this.isBrowser()) return null;
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  }

  setCurrentUser(user: User | null): void {
    if (!this.isBrowser()) return;
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }

  logout(): void {
    this.setCurrentUser(null);
    this.router.navigate(['/']);
  }

  checkAccessSecurity(roleRequired?: 'cliente' | 'administrador'): boolean {
    const user = this.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }
    if (roleRequired && user.rol !== roleRequired) {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }

  // --- Products CRUD ---
  getProducts(): Product[] {
    if (!this.isBrowser()) return [];
    return JSON.parse(localStorage.getItem('products') || '[]');
  }

  getProductById(id: string): Product | undefined {
    return this.getProducts().find(p => p.id === id);
  }

  saveProducts(products: Product[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem('products', JSON.stringify(products));
  }

  // --- Users/Clients CRUD ---
  getUsers(): User[] {
    if (!this.isBrowser()) return [];
    return JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  }

  saveUsers(users: User[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem('registeredUsers', JSON.stringify(users));
  }

  // --- Cart Management ---
  getCart(): CartItem[] {
    if (!this.isBrowser()) return [];
    return JSON.parse(localStorage.getItem('cart') || '[]');
  }

  saveCart(cart: CartItem[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  getUserCart(username: string): CartItem[] {
    return this.getCart().filter(item => item.username === username);
  }

  addToCart(product: Product, quantity: number): void {
    const user = this.getCurrentUser();
    if (!user || user.rol !== 'cliente') return;

    const cart = this.getCart();
    const existingIndex = cart.findIndex(item => item.username === user.usuario && item.productId === product.id);

    const priceAfterDiscount = product.precio * (1 - (product.descuento || 0) / 100);

    if (existingIndex > -1) {
      const newQty = cart[existingIndex].quantity + quantity;
      cart[existingIndex].quantity = Math.min(newQty, product.stock);
    } else {
      cart.push({
        username: user.usuario,
        productId: product.id,
        nombre: product.nombre,
        precio: priceAfterDiscount,
        imagen: product.imagen,
        quantity: Math.min(quantity, product.stock)
      });
    }

    this.saveCart(cart);
  }

  updateCartQuantity(productId: string, quantity: number): void {
    const user = this.getCurrentUser();
    if (!user) return;

    const cart = this.getCart();
    const item = cart.find(i => i.username === user.usuario && i.productId === productId);
    if (item) {
      item.quantity = quantity;
      this.saveCart(cart);
    }
  }

  removeFromCart(productId: string): void {
    const user = this.getCurrentUser();
    if (!user) return;

    const cart = this.getCart();
    const updated = cart.filter(i => !(i.username === user.usuario && i.productId === productId));
    this.saveCart(updated);
  }

  clearUserCart(username: string): void {
    const cart = this.getCart();
    const updated = cart.filter(i => i.username !== username);
    this.saveCart(updated);
  }

  getCartCount(): number {
    const user = this.getCurrentUser();
    if (!user || user.rol !== 'cliente') return 0;
    return this.getUserCart(user.usuario).reduce((sum, item) => sum + item.quantity, 0);
  }

  // --- Purchase History ---
  getPurchases(): Purchase[] {
    if (!this.isBrowser()) return [];
    return JSON.parse(localStorage.getItem('purchases') || '[]');
  }

  savePurchases(purchases: Purchase[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem('purchases', JSON.stringify(purchases));
  }

  getUserPurchases(username: string): Purchase[] {
    return this.getPurchases().filter(p => p.usuario === username);
  }

  addPurchase(purchase: Purchase): void {
    const purchases = this.getPurchases();
    purchases.push(purchase);
    this.savePurchases(purchases);
  }

  getLastPurchaseTicket(): Purchase | null {
    if (!this.isBrowser()) return null;
    return JSON.parse(localStorage.getItem('lastPurchaseTicket') || 'null');
  }

  setLastPurchaseTicket(purchase: Purchase | null): void {
    if (!this.isBrowser()) return;
    if (purchase) {
      localStorage.setItem('lastPurchaseTicket', JSON.stringify(purchase));
    } else {
      localStorage.removeItem('lastPurchaseTicket');
    }
  }
}
