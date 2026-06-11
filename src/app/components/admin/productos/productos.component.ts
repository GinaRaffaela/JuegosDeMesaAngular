import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ArcaneDataService, Product } from '../../../services/arcane-data.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {
  productsList: Product[] = [];
  
  // Campos del Formulario
  id: string = '';
  nombre: string = '';
  categoria: string = '';
  descripcion: string = '';
  precio: number | null = null;
  descuento: number | null = null;
  stock: number | null = null;
  imagen: string = '';

  isEditing: boolean = false;
  formTitle: string = 'Agregar Nuevo Juego';
  btnSubmitText: string = 'Guardar Producto';

  constructor(
    private service: ArcaneDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.service.checkAccessSecurity('administrador')) return;
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productsList = this.service.getProducts();
  }

  onEdit(p: Product): void {
    this.id = p.id;
    this.nombre = p.nombre;
    this.categoria = p.categoria;
    this.descripcion = p.descripcion;
    this.precio = p.precio;
    this.descuento = p.descuento;
    this.stock = p.stock;
    this.imagen = p.imagen;

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
    if (this.isEditing) {
      // Modo Edición
      const index = this.productsList.findIndex(p => p.id === this.id);
      if (index !== -1) {
        this.productsList[index].nombre = this.nombre;
        this.productsList[index].categoria = this.categoria;
        this.productsList[index].descripcion = this.descripcion;
        this.productsList[index].precio = this.precio || 0;
        this.productsList[index].descuento = this.descuento || 0;
        this.productsList[index].stock = this.stock || 0;
        this.productsList[index].imagen = this.imagen;
        
        this.service.saveProducts(this.productsList);
        alert('¡Juego modificado con éxito!');
      }
    } else {
      // Modo Creación
      const newProduct: Product = {
        id: 'gen-' + Date.now(),
        nombre: this.nombre,
        categoria: this.categoria,
        descripcion: this.descripcion,
        precio: this.precio || 0,
        descuento: this.descuento || 0,
        stock: this.stock || 0,
        imagen: this.imagen
      };

      this.productsList.push(newProduct);
      this.service.saveProducts(this.productsList);
      alert('¡Juego agregado al inventario con éxito!');
    }

    this.cargarProductos();
    this.resetForm();
  }

  resetForm(): void {
    this.id = '';
    this.nombre = '';
    this.categoria = '';
    this.descripcion = '';
    this.precio = null;
    this.descuento = null;
    this.stock = null;
    this.imagen = '';
    
    this.isEditing = false;
    this.formTitle = 'Agregar Nuevo Juego';
    this.btnSubmitText = 'Guardar Producto';
  }

  formatearPrecio(value: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  }
}
