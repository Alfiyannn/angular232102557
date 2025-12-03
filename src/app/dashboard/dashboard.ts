import { AfterViewInit, Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Header } from "../header/header";
import { Sidebar } from "../sidebar/sidebar";
import { Footer } from "../footer/footer";

declare const $: any;

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, Header, Sidebar, Footer],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements AfterViewInit {

  constructor(private router: Router) { }

  ngAfterViewInit() {
    this.router.events.subscribe(() => {
      $('body')
        .addClass('sidebar-closed sidebar-collapse')
        .removeClass('sidebar-open');
    });
  }
}
