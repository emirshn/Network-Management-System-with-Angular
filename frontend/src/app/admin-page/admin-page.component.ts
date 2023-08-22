import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css'],
})
export class AdminPageComponent implements OnInit {
  constructor(private http: HttpClient, private router: Router) {}

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
          console.log(error);
          this.router.navigate(['/auth']);
        }
      );
  }
}
