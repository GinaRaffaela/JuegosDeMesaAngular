import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { ArcaneDataService } from './services/arcane-data.service';

/**
 * @description Función factory para inicializar/sincronizar la base de datos de juegos con Firebase antes del arranque.
 * @param {ArcaneDataService} arcaneDataService - Servicio central de datos del sistema.
 * @returns { () => Promise<void> } Función ejecutora de la sincronización.
 */
export function initializeApp(arcaneDataService: ArcaneDataService) {
  return () => arcaneDataService.syncWithFirebaseDatabase();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ArcaneDataService],
      multi: true
    }
  ]
};
