import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  constructor(private http: HttpClient, private router: Router) {}
  isDarkMode: boolean = false;

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
    document.body.classList.toggle('light', !this.isDarkMode);
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/auth']);
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get<any>('http://localhost:8000/protected_endpoint/', { headers })
      .subscribe(
        (response) => {
          console.log(response);
        },
        (error) => {
          this.router.navigate(['/auth']);
        }
      );
  }

  logout(): void {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('logout');
      localStorage.clear();
      this.router.navigate(['/auth']);
    }
  }
}
