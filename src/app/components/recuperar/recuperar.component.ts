import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

/**
 * @description Componente encargado del formulario de recuperación de contraseña.
 * Solicita el correo electrónico del usuario para enviar instrucciones de restauración.
 */
@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './recuperar.component.html',
  styleUrl: './recuperar.component.css'
})
export class RecuperarComponent implements OnInit {
  /**
   * @description El formulario reactivo que maneja el correo de recuperación.
   * @type {FormGroup}
   */
  recoverForm!: FormGroup;

  /**
   * @description Indica si el proceso de envío de recuperación fue exitoso.
   * @type {boolean}
   */
  recoverySuccess: boolean = false;

  /**
   * @description Constructor del componente.
   * @param {FormBuilder} fb - Constructor de formularios reactivos de Angular.
   */
  constructor(private fb: FormBuilder) {}

  /**
   * @description Inicializa el componente y configura el control de correo con validación de formato.
   * @returns {void}
   */
  ngOnInit(): void {
    this.recoverForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  /**
   * @description Getter para acceder a los controladores del formulario en la plantilla HTML.
   * @returns { { [key: string]: AbstractControl } } Los controles del formulario.
   */
  get f() {
    return this.recoverForm.controls;
  }

  /**
   * @description Procesa el envío del formulario. Marca el envío como exitoso si el formulario es válido.
   * @returns {void}
   */
  onSubmit(): void {
    if (this.recoverForm.invalid) {
      this.recoverForm.markAllAsTouched();
      return;
    }

    this.recoverySuccess = true;
    this.recoverForm.reset();
  }

  /**
   * @description Restablece todos los campos del formulario de recuperación y limpia el mensaje de éxito.
   * @returns {void}
   */
  onReset(): void {
    this.recoverForm.reset();
    this.recoverySuccess = false;
  }
}
