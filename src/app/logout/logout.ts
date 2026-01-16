import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.html',
  styleUrl: './logout.css',
})
export class Logout {
  constructor(private cookieService: CookieService, private router: Router) { }

  ngOnInit(): void {
    // Hapus cookie atau token autentikasi
    this.cookieService.deleteAll();

    // Arahkan ke halaman login
    this.router.navigate(['/login']);
  }
}
