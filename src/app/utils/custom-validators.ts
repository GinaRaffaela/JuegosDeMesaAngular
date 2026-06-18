import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador para asegurar que la persona tiene una edad mínima requerida.
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
 * Validador para verificar que 'password' y 'confirmPassword' coinciden.
 * Debe aplicarse al FormGroup padre.
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
 * Validador de fortaleza de clave: al menos una mayúscula y al menos un número.
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
