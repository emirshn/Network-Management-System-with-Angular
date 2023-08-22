import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  constructor(private http: HttpClient, private router: Router) {}

  username: string = '';

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
      .get<any>('http://localhost:8000/get_user/', { headers })
      .subscribe(
        (response) => {
          this.username = response[1];
          this.username = this.username.toUpperCase();
          console.log(response);
        },
        (error) => {
          console.log(error);
          this.router.navigate(['/auth']);
        }
      );
  }
}
