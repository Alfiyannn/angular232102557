import { routes } from './../app.routes';
import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  @Input() moduleName: string = "";
  username: string = "";
  _header = document.querySelector('.main-header') as HTMLElement;

  constructor(private cookieService: CookieService, private router: Router) { }

  ngOnInit(): void {
    this.username = this.cookieService.get("userId");

    const saved = localStorage.getItem('adminlte-theme');

    if (saved === 'dark') {
      document.body.classList.add('dark-mode');

      if (this._header) {
        this._header.classList.remove('navbar-white', 'navbar-light');
        this._header.classList.add('navbar-dark', 'navbar-primary');
      }

    } else {

      if (this._header) {
        this._header.classList.remove('navbar-dark', 'navbar-primary');
        this._header.classList.add('navbar-white', 'navbar-light');
      }

    }

  }
  toggleTheme(): void {
    const isDark = document.body.classList.contains('dark-mode');
    document.body.classList.toggle('dark-mode');

    if (this._header) {
      if (!isDark) {
        this._header.classList.remove('navbar-white', 'navbar-light');
        this._header.classList.add('navbar-dark', 'navbar-primary');
      } else {
        this._header.classList.remove('navbar-dark', 'navbar-primary');
        this._header.classList.add('navbar-white', 'navbar-light');
      }
    }

    localStorage.setItem('adminlte-theme', isDark ? 'light' : 'dark');
  }

}
