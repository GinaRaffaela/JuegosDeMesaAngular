import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  private firebaseDbUrl = 'https://juegos-de-mesa-angular-default-rtdb.firebaseio.com/';

  private get dbUrlClean(): string {
    return this.firebaseDbUrl.replace(/\/$/, '');
  }

  /**
   * @description Constructor del servicio ArcaneDataService. Inicializa la base de datos en localStorage si no existe.
   * @param {Router} router - El servicio de enrutamiento de Angular para redirecciones.
   * @param {HttpClient} http - Cliente HTTP para realizar peticiones REST a Firebase.
   */
  constructor(private router: Router, private http: HttpClient) {
    this.initLocalStorage();
  }

  /**
   * @description Determina si la aplicación se está ejecutando en el contexto del navegador para el uso seguro de localStorage.
   * @returns {boolean} True si está en el navegador, false de lo contrario.
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /**
   * @description Inicializa los datos por defecto (productos, usuarios de prueba, carrito y compras) en el localStorage.
   */
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

  /**
   * @description Sincroniza de forma asíncrona el catálogo de productos local con Firebase Realtime Database.
   * Realiza un GET a Firebase. Si la base de datos está vacía, la inicializa con el catálogo base de 12 juegos.
   * Si ya contiene datos, sincroniza e importa nuevos productos respetando el stock local y los juegos eliminados.
   * @returns {Promise<void>} Una promesa que se resuelve cuando la sincronización finaliza.
   */
  syncWithFirebaseDatabase(): Promise<void> {
    if (!this.isBrowser()) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.http.get<{ [key: string]: Product }>(`${this.dbUrlClean}/products.json`)
        .subscribe({
          next: (data) => {
            if (!data) {
              // Si la base de datos remota está vacía (primer arranque), la inicializamos
              console.log('Firebase Realtime Database está vacía. Inicializando...');
              this.initializeFirebaseWithDefaults().then(resolve);
            } else {
              // Convertir objeto de Firebase (key: Product) a array de productos
              const fbProducts = Object.values(data);
              const storedProductsStr = localStorage.getItem('products');
              const deletedIds: string[] = JSON.parse(localStorage.getItem('deletedProductIds') || '[]');

              let storedProducts: Product[] = [];
              if (storedProductsStr) {
                storedProducts = JSON.parse(storedProductsStr);
              } else {
                storedProducts = [...this.defaultProducts];
              }

              let modified = false;

              fbProducts.forEach(fp => {
                const localIndex = storedProducts.findIndex(sp => sp.id === fp.id);
                const wasDeleted = deletedIds.includes(fp.id);

                if (localIndex > -1) {
                  const localProduct = storedProducts[localIndex];
                  if (
                    localProduct.nombre !== fp.nombre ||
                    localProduct.categoria !== fp.categoria ||
                    localProduct.descripcion !== fp.descripcion ||
                    localProduct.precio !== fp.precio ||
                    localProduct.descuento !== fp.descuento ||
                    localProduct.imagen !== fp.imagen
                  ) {
                    storedProducts[localIndex] = {
                      ...localProduct,
                      nombre: fp.nombre,
                      categoria: fp.categoria,
                      descripcion: fp.descripcion,
                      precio: fp.precio,
                      descuento: fp.descuento,
                      imagen: fp.imagen
                    };
                    modified = true;
                  }
                } else if (!wasDeleted) {
                  storedProducts.push(fp);
                  modified = true;
                }
              });

              localStorage.setItem('products', JSON.stringify(storedProducts));
              console.log('Sincronización con Firebase finalizada.');
              resolve();
            }
          },
          error: (err) => {
            console.error('Error al conectar con Firebase Realtime Database. Usando base de datos local:', err);
            resolve();
          }
        });
    });
  }

  /**
   * @description Inicializa la base de datos de Firebase Realtime Database consumiendo la información del archivo local juegos.json.
   * Utiliza una llamada HTTP PUT para guardar la lista estructurada de productos en el servidor remoto.
   * @returns {Promise<void>} Promesa de resolución del estado.
   */
  private initializeFirebaseWithDefaults(): Promise<void> {
    return new Promise((resolve) => {
      // 1. Leer el archivo JSON local
      this.http.get<Product[]>('assets/juegos.json')
        .subscribe({
          next: (jsonProducts) => {
            const dataMap: { [key: string]: Product } = {};
            jsonProducts.forEach(p => {
              dataMap[p.id] = p;
            });

            // 2. Subir el mapa estructurado a Firebase
            this.http.put(`${this.dbUrlClean}/products.json`, dataMap)
              .subscribe({
                next: () => {
                  console.log('Firebase inicializado exitosamente usando el archivo juegos.json.');
                  localStorage.setItem('products', JSON.stringify(jsonProducts));
                  resolve();
                },
                error: (err) => {
                  console.error('Error al subir catálogo a Firebase:', err);
                  resolve();
                }
              });
          },
          error: (err) => {
            console.error('Error al cargar juegos.json local para inicializar Firebase. Usando fallback de código:', err);
            // Fallback secundario con la lista integrada si el archivo JSON no es accesible
            const dataMap: { [key: string]: Product } = {};
            this.defaultProducts.forEach(p => {
              dataMap[p.id] = p;
            });

            this.http.put(`${this.dbUrlClean}/products.json`, dataMap)
              .subscribe({
                next: () => {
                  localStorage.setItem('products', JSON.stringify(this.defaultProducts));
                  resolve();
                },
                error: () => resolve()
              });
          }
        });
    });
  }

  // --- Session Management ---

  /**
   * @description Recupera el usuario actualmente autenticado desde el localStorage.
   * @returns {User | null} El objeto del usuario logueado o null si no hay sesión activa.
   */
  getCurrentUser(): User | null {
    if (!this.isBrowser()) return null;
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  }

  /**
   * @description Guarda o elimina la sesión del usuario actual en el localStorage.
   * @param {User | null} user - El objeto del usuario a establecer, o null para remover la sesión.
   */
  setCurrentUser(user: User | null): void {
    if (!this.isBrowser()) return;
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }

  /**
   * @description Cierra la sesión activa del usuario y redirige a la página de inicio.
   */
  logout(): void {
    this.setCurrentUser(null);
    this.router.navigate(['/']);
  }

  /**
   * @description Comprueba si el usuario tiene acceso a una ruta basándose en su rol requerido. Redirecciona en caso de no estar autorizado.
   * @param {'cliente' | 'administrador'} [roleRequired] - El rol requerido para la ruta.
   * @returns {boolean} True si tiene acceso permitido, false si fue redireccionado por falta de privilegios.
   */
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

  /**
   * @description Obtiene el catálogo completo de productos/juegos guardados en localStorage.
   * @returns {Product[]} La lista de todos los productos.
   */
  getProducts(): Product[] {
    if (!this.isBrowser()) return [];
    return JSON.parse(localStorage.getItem('products') || '[]');
  }

  /**
   * @description Busca un juego por su identificador único en el catálogo.
   * @param {string} id - El ID del producto.
   * @returns {Product | undefined} El objeto del producto si se encuentra, de lo contrario undefined.
   */
  getProductById(id: string): Product | undefined {
    return this.getProducts().find(p => p.id === id);
  }

  /**
   * @description Guarda la lista completa de productos en el localStorage, detectando y registrando los productos eliminados, y sincroniza los cambios (creaciones, ediciones y eliminaciones) con Firebase Realtime Database.
   * @param {Product[]} products - La nueva lista de productos a persistir.
   */
  saveProducts(products: Product[]): void {
    if (!this.isBrowser()) return;
    
    // Obtener productos actuales antes de guardar para detectar cuáles fueron eliminados
    const oldProducts = this.getProducts();
    const deletedIds: string[] = JSON.parse(localStorage.getItem('deletedProductIds') || '[]');
    
    // 1. Detectar eliminados y aplicar DELETE en Firebase
    oldProducts.forEach(op => {
      const exists = products.some(p => p.id === op.id);
      if (!exists) {
        if (!deletedIds.includes(op.id)) {
          deletedIds.push(op.id);
        }
        this.http.delete(`${this.dbUrlClean}/products/${op.id}.json`)
          .subscribe({
            next: () => console.log(`Producto ${op.id} eliminado de Firebase.`),
            error: (err) => console.error(`Error al eliminar ${op.id} de Firebase:`, err)
          });
      }
    });
    
    // 2. Detectar nuevos o modificados y aplicar PUT en Firebase
    products.forEach(p => {
      const oldP = oldProducts.find(op => op.id === p.id);
      const hasChanged = !oldP || JSON.stringify(oldP) !== JSON.stringify(p);
      
      if (hasChanged) {
        this.http.put(`${this.dbUrlClean}/products/${p.id}.json`, p)
          .subscribe({
            next: () => console.log(`Producto ${p.id} guardado/actualizado en Firebase.`),
            error: (err) => console.error(`Error al guardar ${p.id} en Firebase:`, err)
          });
      }
    });
    
    localStorage.setItem('deletedProductIds', JSON.stringify(deletedIds));
    localStorage.setItem('products', JSON.stringify(products));
  }

  /**
   * @description Envía un mensaje de contacto a Firebase mediante una solicitud HTTP POST.
   * @param {any} message - Objeto con los datos del mensaje de contacto.
   * @returns {Observable<any>} Observable del resultado de la petición POST.
   */
  enviarMensajeContacto(message: any): Observable<any> {
    return this.http.post(`${this.dbUrlClean}/contacto.json`, message);
  }

  // --- Users/Clients CRUD ---

  /**
   * @description Obtiene la lista completa de usuarios registrados en el sistema.
   * @returns {User[]} La lista de usuarios registrados.
   */
  getUsers(): User[] {
    if (!this.isBrowser()) return [];
    return JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  }

  /**
   * @description Guarda la lista completa de usuarios en el localStorage.
   * @param {User[]} users - La lista de usuarios a persistir.
   */
  saveUsers(users: User[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem('registeredUsers', JSON.stringify(users));
  }

  // --- Cart Management ---

  /**
   * @description Recupera la base de datos completa de ítems de carrito de todos los usuarios.
   * @returns {CartItem[]} La lista de ítems de carrito.
   */
  getCart(): CartItem[] {
    if (!this.isBrowser()) return [];
    return JSON.parse(localStorage.getItem('cart') || '[]');
  }

  /**
   * @description Persiste la base de datos de carritos en el localStorage.
   * @param {CartItem[]} cart - El nuevo arreglo de ítems del carrito.
   */
  saveCart(cart: CartItem[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  /**
   * @description Obtiene el carrito de compras perteneciente a un usuario en específico.
   * @param {string} username - El nombre de usuario de la cuenta.
   * @returns {CartItem[]} El conjunto de productos en el carrito del usuario.
   */
  getUserCart(username: string): CartItem[] {
    return this.getCart().filter(item => item.username === username);
  }

  /**
   * @description Añade un producto al carrito del usuario logueado actualmente, respetando los límites de stock disponibles.
   * @param {Product} product - El objeto del producto a agregar.
   * @param {number} quantity - La cantidad a añadir.
   */
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

  /**
   * @description Actualiza directamente la cantidad de un ítem en el carrito del usuario activo.
   * @param {string} productId - El ID del producto a actualizar.
   * @param {number} quantity - La nueva cantidad.
   */
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

  /**
   * @description Elimina un ítem específico del carrito del usuario activo.
   * @param {string} productId - El ID del producto a remover.
   */
  removeFromCart(productId: string): void {
    const user = this.getCurrentUser();
    if (!user) return;

    const cart = this.getCart();
    const updated = cart.filter(i => !(i.username === user.usuario && i.productId === productId));
    this.saveCart(updated);
  }

  /**
   * @description Limpia por completo el carrito de compras de un usuario específico.
   * @param {string} username - El nombre de usuario de la cuenta.
   */
  clearUserCart(username: string): void {
    const cart = this.getCart();
    const updated = cart.filter(i => i.username !== username);
    this.saveCart(updated);
  }

  /**
   * @description Calcula la cantidad total de artículos en el carrito del usuario cliente actual.
   * @returns {number} El total de artículos acumulados.
   */
  getCartCount(): number {
    const user = this.getCurrentUser();
    if (!user || user.rol !== 'cliente') return 0;
    return this.getUserCart(user.usuario).reduce((sum, item) => sum + item.quantity, 0);
  }

  // --- Purchase History ---

  /**
   * @description Obtiene el historial global de todas las compras registradas en la aplicación.
   * @returns {Purchase[]} La lista completa de boletas de compra.
   */
  getPurchases(): Purchase[] {
    if (!this.isBrowser()) return [];
    return JSON.parse(localStorage.getItem('purchases') || '[]');
  }

  /**
   * @description Persiste la base de datos de compras en el localStorage.
   * @param {Purchase[]} purchases - La nueva lista de compras a guardar.
   */
  savePurchases(purchases: Purchase[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem('purchases', JSON.stringify(purchases));
  }

  /**
   * @description Obtiene el historial de compras pertenecientes a un usuario en específico.
   * @param {string} username - El nombre de usuario.
   * @returns {Purchase[]} El historial de compras del usuario.
   */
  getUserPurchases(username: string): Purchase[] {
    return this.getPurchases().filter(p => p.usuario === username);
  }

  /**
   * @description Agrega una nueva orden de compra exitosa al historial global.
   * @param {Purchase} purchase - El objeto con los detalles de la compra.
   */
  addPurchase(purchase: Purchase): void {
    const purchases = this.getPurchases();
    purchases.push(purchase);
    this.savePurchases(purchases);
  }

  /**
   * @description Recupera el ticket/boleta de la última compra exitosa del usuario.
   * @returns {Purchase | null} La última compra realizada o null si no se encuentra.
   */
  getLastPurchaseTicket(): Purchase | null {
    if (!this.isBrowser()) return null;
    return JSON.parse(localStorage.getItem('lastPurchaseTicket') || 'null');
  }

  /**
   * @description Guarda temporalmente los detalles del ticket de la última compra para su visualización.
   * @param {Purchase | null} purchase - El objeto de la última compra, o null para removerlo.
   */
  setLastPurchaseTicket(purchase: Purchase | null): void {
    if (!this.isBrowser()) return;
    if (purchase) {
      localStorage.setItem('lastPurchaseTicket', JSON.stringify(purchase));
    } else {
      localStorage.removeItem('lastPurchaseTicket');
    }
  }
}
