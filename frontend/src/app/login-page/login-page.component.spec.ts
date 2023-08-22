import {
  TestBed,
  ComponentFixture,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { LoginPageComponent } from './login-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  NgForm,
  NgModel,
} from '@angular/forms';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let mockRouter: Router;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginPageComponent],
      imports: [HttpClientTestingModule, RouterTestingModule, FormsModule],
      providers: [{ provide: Router, useValue: mockRouter }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to /home when login is successful', fakeAsync(() => {
    const httpSpy = spyOn(TestBed.inject(HttpClient), 'post').and.returnValue(
      of({ token: 'sample-token' })
    );

    const formBuilder: FormBuilder = TestBed.inject(FormBuilder);
    const formGroup: FormGroup = formBuilder.group({
      username: 'emirsahin',
      password: '123123',
    });

    const ngForm: NgForm = new NgForm([], []);
    ngForm.form = formGroup;

    component.onSubmit(ngForm);
    tick();
    fixture.detectChanges();

    expect(httpSpy).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  }));
  
  it('should set error to "Invalid credentials" when login fails', fakeAsync(() => {
    spyOn(TestBed.inject(HttpClient), 'post').and.returnValue(
      throwError({ status: 401 })
    );

    const formBuilder: FormBuilder = TestBed.inject(FormBuilder);
    const formGroup: FormGroup = formBuilder.group({
      username: 'user',
      password: '123123',
    });

    const ngForm: NgForm = new NgForm([], []);
    ngForm.form = formGroup;

    component.onSubmit(ngForm);
    tick();
    fixture.detectChanges();

    expect(component.error).toBe('Invalid credentials');
  }));

  // Similar tests for other cases should be added
});
