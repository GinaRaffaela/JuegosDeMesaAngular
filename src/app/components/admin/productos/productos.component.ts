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
export class ProductosComponent implements OnInit {
  productsList: Product[] = [];
  productForm!: FormGroup;
  id: string = ''; // ID del producto siendo editado

  isEditing: boolean = false;
  formTitle: string = 'Agregar Nuevo Juego';
  btnSubmitText: string = 'Guardar Producto';

  constructor(
    private service: ArcaneDataService,
    private router: Router,
    private fb: FormBuilder
  ) {}

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

  get f() {
    return this.productForm.controls;
  }

  cargarProductos(): void {
    this.productsList = this.service.getProducts();
  }

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

  onDelete(p: Product): void {
    if (confirm(`¿Estás seguro/a de eliminar el juego "${p.nombre}" del catálogo de inventario?`)) {
      const updated = this.productsList.filter(prod => prod.id !== p.id);
      this.service.saveProducts(updated);
      this.cargarProductos();
      this.resetForm();
    }
  }

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

  formatearPrecio(value: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  }
}
