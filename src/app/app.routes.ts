import { Routes } from '@angular/router';
import { InicioComponent } from './components/inicio/inicio.component';
import { ContactoComponent } from './components/contacto/contacto.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { RecuperarComponent } from './components/recuperar/recuperar.component';
import { CategoriaComponent } from './components/categoria/categoria.component';
import { ProductoDetalleComponent } from './components/producto-detalle/producto-detalle.component';
import { CarritoComponent } from './components/cliente/carrito/carrito.component';
import { PerfilComponent } from './components/cliente/perfil/perfil.component';
import { PagoExitoComponent } from './components/cliente/pago-exito/pago-exito.component';
import { ProductosComponent } from './components/admin/productos/productos.component';
import { ClientesComponent } from './components/admin/clientes/clientes.component';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'recuperar', component: RecuperarComponent },
  { path: 'categoria/:tipo', component: CategoriaComponent },
  { path: 'producto/:id', component: ProductoDetalleComponent },
  
  // Rutas de Cliente
  { path: 'cliente/carrito', component: CarritoComponent },
  { path: 'cliente/perfil', component: PerfilComponent },
  { path: 'cliente/pago-exito', component: PagoExitoComponent },
  
  // Rutas de Administrador
  { path: 'admin/productos', component: ProductosComponent },
  { path: 'admin/clientes', component: ClientesComponent },
  
  // Comodín para redireccionar a inicio
  { path: '**', redirectTo: '' }
];
