import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { CookieService } from '../services/cookie.service';

export const authGuard: CanActivateFn = () => {
  const cookieService = inject(CookieService); // Inject CookieService
  const auth = inject(AuthService);
  const router = inject(Router);

  // return auth.user$.pipe(
  //   take(1),
  //   map((user) => {
  //     if (user) {
  //       return true;
  //     } else {
  //       router.navigate(['/login']);
  //       return false;
  //     }
  //   })
  // );


  
  const authToken = cookieService.getCookie('authToken');
  console.log(authToken);
  
  if (!authToken) {
    router.navigate(['/login']);  
    return false;
  }
  
  // if (auth.isLoggedIn()) {
  //   return true;
  // } else {
  //   router.navigate(['/login']);
  //   return false;
  // }
  
  return true;
};
