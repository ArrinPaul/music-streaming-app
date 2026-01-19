import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';

/**
 * HTTP Interceptor for request/response logging
 * Logs all HTTP requests and responses for debugging
 */
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();

  console.log(`[HTTP Request] ${req.method} ${req.url}`, {
    headers: req.headers,
    body: req.body
  });

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const duration = Date.now() - startTime;
          console.log(`[HTTP Response] ${req.method} ${req.url}`, {
            status: event.status,
            duration: `${duration}ms`,
            body: event.body
          });
        }
      },
      error: (error) => {
        const duration = Date.now() - startTime;
        console.error(`[HTTP Error] ${req.method} ${req.url}`, {
          status: error.status,
          duration: `${duration}ms`,
          error: error.message
        });
      }
    })
  );
};
