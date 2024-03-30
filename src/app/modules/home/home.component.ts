import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthRequest } from 'src/app/models/interfaces/auth/authRequest';
import { SignUpUserRequest } from 'src/app/models/interfaces/user/signUpUserRequest';
import { UserService } from 'src/app/services/user/user.service';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api'
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnDestroy {

  private destroy$ = new Subject<void>()
  cardView = true

   constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private cookieService: CookieService,
    private messageService: MessageService,
    private router: Router
    ){}


   loginForm = this.formBuilder.group({
    email: ['', Validators.required],
    password: ['', Validators.required]
   })

   signUpForm = this.formBuilder.group({
    name: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required]
   })

   onSubmitLoginForm():void{
    //validar as informações passadas pelo formBuilder
    if(this.loginForm.value && this.loginForm.valid){
    //após validar, utilizar o method e seus argumentos
      this.userService.authUser(this.loginForm.value as AuthRequest).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next:(response)=>{
          //caso de sucesso
          if(response){
            this.cookieService.set('USER_INFO', response?.token) //criação de cookie com as informações devolvidas
            this.loginForm.reset()
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `Bem-vindo de volta ${response?.name}`,
              life: 2000
            })
            this.router.navigate(['/dashboard'])
          }
        },
        error:(error)=>{
          console.log(error)
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: `Erro ao fazer o login`,
            life: 2000
          })
        }
      })
    }
   }

   onSubmitSignUpForm():void{
    if(this.signUpForm.value && this.signUpForm.valid){
    this.userService.signUpUser(this.signUpForm.value as SignUpUserRequest).pipe(
      takeUntil(this.destroy$)).subscribe({
      next:(response)=>{
        if(response){
        alert('User cadastrado com sucesso')
        this.signUpForm.reset()
        this.cardView = true
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Parabéns, ${response?.name} sua conta foi cadastrada com sucesso`,
          life: 2000
        })
        }
      },
      error:(error)=>{
        console.log(error)
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: `Erro ao cadastrar-se`,
          life: 2000
        })
      }
    })
   }
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

}
