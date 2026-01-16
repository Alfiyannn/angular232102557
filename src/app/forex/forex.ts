import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Renderer2 } from '@angular/core';
import { Header } from "../header/header";
import { Sidebar } from "../sidebar/sidebar";
import { Footer } from "../footer/footer";

declare const $: any;

@Component({
  selector: 'app-forex',
  standalone: true,
  imports: [Header, Sidebar, Footer],
  templateUrl: './forex.html',
  styleUrls: ['./forex.css'],
})
export class Forex implements AfterViewInit {

  _table1: any;

  constructor(private renderer: Renderer2, private httpClient: HttpClient) { }

  // ==========================
  //  FORMAT TANGGAL
  // ==========================
  formatDate(date: Date): string {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  }

  // ==========================
  //  FORMAT CURRENCY
  // ==========================
  formatCurrency(value: number, locale: string, currency: string = "USD"): string {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency
    }).format(value);
  }

  // ==========================
  //  INIT VIEW
  // ==========================
  ngAfterViewInit(): void {

    this.renderer.removeClass(document.body, "sidebar-open");
    this.renderer.addClass(document.body, "sidebar-closed");
    this.renderer.addClass(document.body, "sidebar-collapsed");

    this._table1 = $("#table1").DataTable({
      columnDefs: [
        {
          targets: 3,
          className: "text-right"
        }
      ]
    });

    this.bindTable1();
  }

  // ==========================
  //  LOAD DATA FOREX
  // ==========================
  bindTable1(): void {
    console.log("bindTable1()");

    const ratesUrl =
      "https://openexchangerates.org/api/latest.json?app_id=ce6330971ada4b8aadd706cde549be1b";

    const currenciesUrl = "https://openexchangerates.org/api/currencies.json";

    this.httpClient.get(currenciesUrl).subscribe((currencies: any) => {

      this.httpClient.get(ratesUrl).subscribe((data: any) => {

        $("#tanggal").html(
          "Data per tanggal " + this.formatDate(new Date(data.timestamp * 1000))
        );

        const rates = data.rates;
        let index = 1;

        for (const currency in rates) {

          const currencyName = currencies[currency] || "-";

          // Fix: gunakan THIS.formatCurrency()
          const rate = rates.IDR / rates[currency];
          const formatRate = this.formatCurrency(rate, "id-ID", currency);

          console.log(`${currency}: ${currencyName} - ${formatRate}`);

          const row = [index++, currency, currencyName, formatRate];
          this._table1.row.add(row);
        }

        this._table1.draw(false);
      });

    });

  }
}
