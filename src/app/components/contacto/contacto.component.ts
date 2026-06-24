import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/**
 * @description Componente encargado del formulario de contacto para el sitio.
 * Permite a los visitantes enviar mensajes o solicitar asesorías sobre juegos de mesa.
 */
@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent implements OnInit {
  /**
   * @description El formulario reactivo que maneja los campos de contacto.
   * @type {FormGroup}
   */
  contactForm!: FormGroup;

  /**
   * @description Constructor del componente.
   * @param {FormBuilder} fb - Servicio para la construcción de formularios reactivos.
   */
  constructor(private fb: FormBuilder) {}

  /**
   * @description Inicializa el formulario reactivo del componente de contacto con sus respectivas validaciones.
   * @returns {void}
   */
  ngOnInit(): void {
    this.contactForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''], // Opcional
      juego: ['', Validators.required],
      mensaje: ['', Validators.required]
    });
  }

  /**
   * @description Getter para acceder a los controladores de formulario de contacto.
   * @returns { { [key: string]: AbstractControl } } Los controles del formulario.
   */
  get f() {
    return this.contactForm.controls;
  }

  /**
   * @description Procesa el envío del formulario. Si es válido, despliega una alerta e invoca el reseteo.
   * @returns {void}
   */
  enviarMensaje(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    alert('¡Mensaje enviado con éxito! Nos comunicaremos contigo muy pronto.');
    this.onReset();
  }

  /**
   * @description Restablece todos los campos del formulario de contacto a su estado inicial vacío.
   * @returns {void}
   */
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
