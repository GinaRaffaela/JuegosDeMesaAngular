import { FormControl, FormGroup } from '@angular/forms';
import { ageValidator, passwordMatchValidator, passwordStrengthValidator } from './custom-validators';

/**
 * @description Suite de pruebas para los validadores personalizados compartidos en el proyecto.
 */
describe('CustomValidators', () => {
  
  describe('ageValidator', () => {
    it('debe retornar null (válido) si la edad es mayor o igual a la mínima requerida (13 años)', () => {
      const validator = ageValidator(13);
      // Simular un control con fecha de nacimiento correspondiente a 18 años atrás
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 18);
      
      const control = new FormControl(birthDate.toISOString().split('T')[0]);
      expect(validator(control)).toBeNull();
    });

    it('debe retornar un objeto de error { underage: ... } si la edad es menor a la mínima requerida', () => {
      const validator = ageValidator(13);
      // Simular un control con fecha de nacimiento correspondiente a 10 años atrás
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 10);
      
      const control = new FormControl(birthDate.toISOString().split('T')[0]);
      const result = validator(control);
      
      expect(result).not.toBeNull();
      expect(result!['underage']).toBeDefined();
      expect(result!['underage'].requiredAge).toBe(13);
    });
  });

  describe('passwordStrengthValidator', () => {
    it('debe retornar null (válido) si la clave contiene al menos una mayúscula y un número', () => {
      const control = new FormControl('Clave123!');
      expect(passwordStrengthValidator(control)).toBeNull();
    });

    it('debe retornar un objeto de error { weakPassword: true } si la clave no cumple las reglas de fortaleza', () => {
      const controlWeak1 = new FormControl('clave123!'); // Sin mayúscula
      const controlWeak2 = new FormControl('CLAVEABC!'); // Sin número
      
      expect(passwordStrengthValidator(controlWeak1)).toEqual({ weakPassword: true });
      expect(passwordStrengthValidator(controlWeak2)).toEqual({ weakPassword: true });
    });
  });

  describe('passwordMatchValidator', () => {
    it('debe retornar null (válido) si las contraseñas coinciden exactamente en el FormGroup', () => {
      const group = new FormGroup({
        password: new FormControl('Clave123!'),
        confirmPassword: new FormControl('Clave123!')
      });

      expect(passwordMatchValidator(group)).toBeNull();
      expect(group.get('confirmPassword')?.errors).toBeNull();
    });

    it('debe retornar { mismatch: true } y setear error en confirmPassword si las contraseñas difieren', () => {
      const group = new FormGroup({
        password: new FormControl('Clave123!'),
        confirmPassword: new FormControl('Diferente1!')
      });

      const result = passwordMatchValidator(group);
      
      expect(result).toEqual({ mismatch: true });
      expect(group.get('confirmPassword')?.hasError('mismatch')).toBeTrue();
    });
  });
});
