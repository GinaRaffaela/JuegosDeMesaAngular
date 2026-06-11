import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArcaneDataService, Purchase } from '../../../services/arcane-data.service';

@Component({
  selector: 'app-pago-exito',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pago-exito.component.html',
  styleUrl: './pago-exito.component.css'
})
export class PagoExitoComponent implements OnInit {
  ticket: Purchase | null = null;

  constructor(private service: ArcaneDataService) {}

  ngOnInit(): void {
    if (!this.service.checkAccessSecurity('cliente')) return;

    this.ticket = this.service.getLastPurchaseTicket();
    // Limpiar para que no persista si refresca
    this.service.setLastPurchaseTicket(null);
  }

  formatearPrecio(value: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  }
}
