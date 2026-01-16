import { AfterViewInit, Component, Renderer2 } from '@angular/core';
import { Header } from "../header/header";
import { Sidebar } from "../sidebar/sidebar";
import { Footer } from '../footer/footer';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

declare const $: any;
declare const moment: any;
import * as L from 'leaflet';


@Component({
  selector: 'app-cuaca',
  standalone: true,
  imports: [Header, Sidebar, Footer, RouterModule, CommonModule],
  templateUrl: './cuaca.html',
  styleUrl: './cuaca.css',
})
export class Cuaca implements AfterViewInit {
  map: any;
  currentWeather: any;
  getWindDirection(deg: number): string {
    if (deg > 337.5 || deg <= 22.5) return 'Utara';
    if (deg > 22.5 && deg <= 67.5) return 'Timur Laut';
    if (deg > 67.5 && deg <= 112.5) return 'Timur';
    if (deg > 112.5 && deg <= 157.5) return 'Tenggara';
    if (deg > 157.5 && deg <= 202.5) return 'Selatan';
    if (deg > 202.5 && deg <= 247.5) return 'Barat Daya';
    if (deg > 247.5 && deg <= 292.5) return 'Barat';
    if (deg > 292.5 && deg <= 337.5) return 'Barat Laut';
    return '';
  }

  // Ganti baris 26-28 dengan ini:
  getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }
  private table1: any;
  cityData: any;
  todayDate: any;

  // Tambahkan di constructor cuaca.ts
  constructor(private renderer: Renderer2, private http: HttpClient) {
    this.renderer.removeClass(document.body, "sidebar-open");
    this.renderer.addClass(document.body, "sidebar-closed");

    // Perbaikan Icon Marker Leaflet yang sering hilang di Angular
    const iconDefault = L.icon({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  ngAfterViewInit(): void {
    this.table1 = $("#table1").DataTable({
      columnDefs: [
        {
          targets: 0,
          renderer: function (data: string) {
            const waktu = moment.utc(data).utcOffset(7); // Langsung ke WIB
            return waktu.format("YYYY-MM-DD") + "<br />" + waktu.format("HH:mm") + " WIB";
          }
        },
        {
          targets: [1],
          render: function (data: string) {
            return "<img src='" + data + "' style='filter: drop-shadow(5px 5px 10px rgba(0, 0, 0, 0.7));' />";
          }
        },
        {
          targets: [2],
          render: function (data: string) {
            const array = data.split("||");
            const cuaca = array[0];
            const description = array[1];

            const html = "<strong>" + cuaca + "</strong> <br />" + description;

            return html;
          },
        },
      ],
    });
  }



  getData(city: string): void {
    city = encodeURIComponent(city);

    this.http
      .get(
        `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=6e8bfa651345f968751ebd48d46d7f2e`
      )
      .subscribe((data: any) => {
        this.cityData = data.city;

        if (data.list.length > 0) {
          this.currentWeather = data.list[0];

          // Ganti baris 90-92 dengan ini:
          this.todayDate = moment.utc(this.currentWeather.dt_txt).utcOffset(7).format('MMM DD, HH:mm') + " WIB";

          // MEMUNCULKAN PETA SESUAI LOKASI KOTA
          setTimeout(() => {
            this.initMap(
              this.cityData.coord.lat,
              this.cityData.coord.lon
            );
          }, 1000);
        }

        let list = data.list;
        console.log(list);

        this.table1.clear();

        list.forEach((element: any) => {
          const weather = element.weather[0];
          console.log(weather);

          const iconUrl = "https://openweathermap.org/img/wn/" + weather.icon + "@2x.png";
          const cuacaDeskripsi = weather.main + "|| " + weather.description;

          const main = element.main;
          console.log(main);

          const tempMin = this.kelvinToCelcius(main.temp_min);
          console.log({ tempMin });

          const tempMax = this.kelvinToCelcius(main.temp_max);
          console.log({ tempMax });

          const temp = tempMin + "°C - " + tempMax + "°C";

          const row = [element.dt_txt, iconUrl, cuacaDeskripsi, temp];

          this.table1.row.add(row);
        });

        this.table1.draw(false);
      },
        (error: any) => {
          alert(error.error.message);
          this.table1.clear();
          this.table1.draw(false);
        }
      );
  }
  kelvinToCelcius(kelvin: any): any {
    let celcius = kelvin - 273.15;
    celcius = Math.round(celcius * 100) / 100;

    return celcius;
  }
  // LOGIKA PETA LEAFLET
  private initMap(lat: number, lon: number): void {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('map-container').setView([lat, lon], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '©️ OpenStreetMap contributors',
    }).addTo(this.map);

    // BARU: Paksa peta untuk merender ulang ukuran agar ubin (tiles) tidak pecah
    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);

    L.marker([lat, lon])
      .addTo(this.map)
      .bindPopup(this.cityData.name)
      .openPopup();
  }

  handleEnter(event: any) {
    const cityName = event.target.value;

    if (cityName == "") {
      this.table1.clear();
      this.table1.draw(false);
    }

    this.getData(cityName);
  }

}