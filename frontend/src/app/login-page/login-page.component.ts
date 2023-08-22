import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
})
export class LoginPageComponent {
  isLoginMode = true;
  isLoading = false;
  error: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    const user = {
      username: form.value.username,
      password: form.value.password,
    };

    if (this.isLoginMode) {
      this.http.post<any>('http://localhost:8000/login/', user).subscribe(
        (response) => {
          const token = response.token;

          localStorage.setItem('token', token);

          this.router.navigate(['/home']);

          // this.http
          //   .get<any>('http://localhost:8000/protected_endpoint/', {
          //     headers: new HttpHeaders({
          //       Authorization: `Bearer ${token}`,
          //     }),
          //   })
          //   .subscribe(
          //     (data) => {
          //       console.log(data);

          //       this.isLoading = false;
          //     },
          //     (error) => {
          //       console.error(error);
          //       this.isLoading = false;
          //     }
          //   );
        },
        (error) => {
          console.error(error);
          this.isLoading = false;
          this.error = 'Invalid credentials';
        }
      );
    } 
    else {
      this.http.post<any>('http://localhost:8000/register/', user).subscribe(
        (response) => {
          console.log(response);
          this.isLoading = false;
        },
        (error) => {
          console.error(error);
          this.isLoading = false;
          this.error = 'Username already exists';
        }
      );
    }

    form.reset();
  }
}
