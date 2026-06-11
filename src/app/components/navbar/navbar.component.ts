import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ArcaneDataService } from '../../services/arcane-data.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  constructor(public service: ArcaneDataService) {}

  get currentUser() {
    return this.service.getCurrentUser();
  }

  get cartCount() {
    return this.service.getCartCount();
  }

  logout(): void {
    this.service.logout();
  }
}
