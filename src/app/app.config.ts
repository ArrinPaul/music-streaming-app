import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { errorHandlerInterceptor } from './core/interceptors/error-handler.interceptor';
import { loggingInterceptor } from './core/interceptors/logging.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideClientHydration(), 
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch(),
      withInterceptors([loggingInterceptor, errorHandlerInterceptor])
    )
  ]
};
