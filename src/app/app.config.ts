import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { ArcaneDataService } from './services/arcane-data.service';

/**
 * @description Función factory para inicializar/sincronizar la base de datos de juegos antes del arranque.
 * @param {ArcaneDataService} arcaneDataService - Servicio central de datos del sistema.
 * @returns { () => Promise<void> } Función ejecutora de la sincronización.
 */
export function initializeApp(arcaneDataService: ArcaneDataService) {
  return () => arcaneDataService.syncWithJsonDatabase();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ArcaneDataService],
      multi: true
    }
  ]
};
