import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * @description Validador personalizado para asegurar que la fecha ingresada corresponde a un usuario con una edad mínima requerida.
 * @param {number} minAge - La edad mínima requerida en años (ej. 13).
 * @returns {ValidatorFn} Una función de validación de Angular que retorna null si cumple o un objeto con el error 'underage' si no cumple.
 */
export function ageValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const birthDate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= minAge ? null : { underage: { requiredAge: minAge, actualAge: age } };
  };
}

/**
 * @description Validador personalizado para comprobar que los campos de contraseña ('password') y confirmación de contraseña ('confirmPassword') coinciden exactamente.
 * Debe ser aplicado en el control padre (FormGroup).
 * @param {AbstractControl} control - El control FormGroup que contiene los subcontroles 'password' y 'confirmPassword'.
 * @returns {ValidationErrors | null} Un objeto con el error 'mismatch' si no coinciden, o null si la validación es exitosa.
 */
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  const matches = password.value === confirmPassword.value;
  if (!matches) {
    confirmPassword.setErrors({ mismatch: true });
    return { mismatch: true };
  } else {
    // Si tenían un error de mismatch previo, limpiarlo conservando otros posibles errores
    const errors = confirmPassword.errors;
    if (errors && errors['mismatch']) {
      delete errors['mismatch'];
      confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
    }
  }

  return null;
};

/**
 * @description Validador de fortaleza de clave. Requiere que la contraseña contenga por lo menos una letra mayúscula y al menos un número.
 * @param {AbstractControl} control - El control de Angular (FormControl) a validar.
 * @returns {ValidationErrors | null} Un objeto con el error 'weakPassword' si no cumple las reglas, o null si es válida.
 */
export const passwordStrengthValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (!value) {
    return null;
  }

  const hasUppercase = /[A-Z]/.test(value);
  const hasNumber = /\d/.test(value);

  const isValid = hasUppercase && hasNumber;
  return isValid ? null : { weakPassword: true };
};

