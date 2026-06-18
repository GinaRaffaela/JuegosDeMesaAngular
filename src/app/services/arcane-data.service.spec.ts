import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ArcaneDataService, Product, User } from './arcane-data.service';

describe('ArcaneDataService', () => {
  let service: ArcaneDataService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    // Limpiar localStorage antes de cada prueba para garantizar aislamiento
    localStorage.clear();

    const spy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        ArcaneDataService,
        { provide: Router, useValue: spy }
      ]
    });
    service = TestBed.inject(ArcaneDataService);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('debe inicializar correctamente el catálogo de 12 juegos predeterminados en localStorage', () => {
    const products = service.getProducts();
    expect(products.length).toBe(12);
    expect(products[0].nombre).toBe('Catan');
  });

  it('debe agregar un producto al carrito y respetar el límite de stock', () => {
    // 1. Configurar un usuario cliente actual
    const mockUser: User = {
      nombre: 'Cliente Prueba',
      usuario: 'clienteprueba',
      email: 'prueba@test.com',
      rol: 'cliente'
    };
    service.setCurrentUser(mockUser);

    // 2. Obtener un producto de prueba (Catan, con stock de 8)
    const product = service.getProducts()[0];
    expect(product.stock).toBe(8);

    // 3. Limpiar el carrito del usuario de prueba
    service.clearUserCart(mockUser.usuario);

    // 4. Agregar una cantidad menor al stock
    service.addToCart(product, 3);
    let cart = service.getUserCart(mockUser.usuario);
    expect(cart.length).toBe(1);
    expect(cart[0].productId).toBe(product.id);
    expect(cart[0].quantity).toBe(3);

    // 5. Intentar agregar excediendo el stock (3 + 10 = 13, que es mayor que 8)
    service.addToCart(product, 10);
    cart = service.getUserCart(mockUser.usuario);
    expect(cart[0].quantity).toBe(8); // Debe estar topado en el stock máximo de 8
  });
});
