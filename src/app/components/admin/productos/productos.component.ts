import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ArcaneDataService, Product } from '../../../services/arcane-data.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
/**
 * @description Componente encargado del mantenedor CRUD de productos.
 * Permite listar, agregar, editar y eliminar juegos del catálogo de inventario.
 */
export class ProductosComponent implements OnInit {
  /**
   * @description La lista completa de productos del inventario.
   * @type {Product[]}
   */
  productsList: Product[] = [];

  /**
   * @description El formulario reactivo que maneja la información del producto.
   * @type {FormGroup}
   */
  productForm!: FormGroup;

  /**
   * @description ID del producto siendo editado en modo edición (vacío en modo creación).
   * @type {string}
   */
  id: string = '';

  /**
   * @description Determina si el componente se encuentra en modo edición o modo creación.
   * @type {boolean}
   */
  isEditing: boolean = false;

  /**
   * @description Título dinámico para el encabezado del formulario.
   * @type {string}
   */
  formTitle: string = 'Agregar Nuevo Juego';

  /**
   * @description Texto del botón de envío del formulario.
   * @type {string}
   */
  btnSubmitText: string = 'Guardar Producto';

  /**
   * @description Constructor del componente.
   * @param {ArcaneDataService} service - Servicio de base de datos local y sesión.
   * @param {Router} router - Servicio de enrutamiento de Angular.
   * @param {FormBuilder} fb - Constructor de formularios reactivos de Angular.
   */
  constructor(
    private service: ArcaneDataService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  /**
   * @description Inicializa el componente, verifica accesos y configura el formulario de productos.
   * @returns {void}
   */
  ngOnInit(): void {
    if (!this.service.checkAccessSecurity('administrador')) return;

    this.productForm = this.fb.group({
      nombre: ['', Validators.required],
      categoria: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: [null, [Validators.required, Validators.min(0)]],
      descuento: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      stock: [null, [Validators.required, Validators.min(0)]],
      imagen: ['', Validators.required]
    });

    this.cargarProductos();
  }

  /**
   * @description Getter para acceder a los controles del formulario en la plantilla HTML.
   * @returns { { [key: string]: AbstractControl } } Los controles del formulario.
   */
  get f() {
    return this.productForm.controls;
  }

  /**
   * @description Carga la lista actualizada de productos desde el servicio central de datos.
   * @returns {void}
   */
  cargarProductos(): void {
    this.productsList = this.service.getProducts();
  }

  /**
   * @description Activa el modo edición cargando los datos del producto seleccionado en el formulario.
   * @param {Product} p - El producto a editar.
   * @returns {void}
   */
  onEdit(p: Product): void {
    this.id = p.id;
    this.productForm.patchValue({
      nombre: p.nombre,
      categoria: p.categoria,
      descripcion: p.descripcion,
      precio: p.precio,
      descuento: p.descuento,
      stock: p.stock,
      imagen: p.imagen
    });

    this.isEditing = true;
    this.formTitle = 'Editar Juego';
    this.btnSubmitText = 'Guardar Cambios';

    // Desplazar vista al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * @description Elimina un juego del catálogo de inventario tras pedir confirmación.
   * @param {Product} p - El producto a eliminar.
   * @returns {void}
   */
  onDelete(p: Product): void {
    if (confirm(`¿Estás seguro/a de eliminar el juego "${p.nombre}" del catálogo de inventario?`)) {
      const updated = this.productsList.filter(prod => prod.id !== p.id);
      this.service.saveProducts(updated);
      this.cargarProductos();
      this.resetForm();
    }
  }

  /**
   * @description Procesa el envío del formulario. Guarda los cambios de un producto existente u registra uno nuevo.
   * @returns {void}
   */
  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const val = this.productForm.value;

    if (this.isEditing) {
      // Modo Edición
      const index = this.productsList.findIndex(p => p.id === this.id);
      if (index !== -1) {
        this.productsList[index].nombre = val.nombre;
        this.productsList[index].categoria = val.categoria;
        this.productsList[index].descripcion = val.descripcion;
        this.productsList[index].precio = val.precio;
        this.productsList[index].descuento = val.descuento;
        this.productsList[index].stock = val.stock;
        this.productsList[index].imagen = val.imagen;
        
        this.service.saveProducts(this.productsList);
        alert('¡Juego modificado con éxito!');
      }
    } else {
      // Modo Creación
      const newProduct: Product = {
        id: 'gen-' + Date.now(),
        nombre: val.nombre,
        categoria: val.categoria,
        descripcion: val.descripcion,
        precio: val.precio,
        descuento: val.descuento,
        stock: val.stock,
        imagen: val.imagen
      };

      this.productsList.push(newProduct);
      this.service.saveProducts(this.productsList);
      alert('¡Juego agregado al inventario con éxito!');
    }

    this.cargarProductos();
    this.resetForm();
  }

  /**
   * @description Restablece todos los campos del formulario de producto a su estado inicial.
   * @returns {void}
   */
  resetForm(): void {
    this.productForm.reset({
      nombre: '',
      categoria: '',
      descripcion: '',
      precio: null,
      descuento: null,
      stock: null,
      imagen: ''
    });
    
    this.id = '';
    this.isEditing = false;
    this.formTitle = 'Agregar Nuevo Juego';
    this.btnSubmitText = 'Guardar Producto';
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
