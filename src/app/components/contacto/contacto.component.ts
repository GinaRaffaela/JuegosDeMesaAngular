import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent implements OnInit {
  contactForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''], // Opcional
      juego: ['', Validators.required],
      mensaje: ['', Validators.required]
    });
  }

  get f() {
    return this.contactForm.controls;
  }

  enviarMensaje(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    alert('¡Mensaje enviado con éxito! Nos comunicaremos contigo muy pronto.');
    this.onReset();
  }

  onReset(): void {
    this.contactForm.reset({
      nombre: '',
      email: '',
      telefono: '',
      juego: '',
      mensaje: ''
    });
  }
}
