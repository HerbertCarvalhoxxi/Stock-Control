import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { CategoryEvent } from 'src/app/models/enums/categories/categoryEvent';
import { EditCategoryAction } from 'src/app/models/interfaces/categories/editCategoryAction';
import { CategoriesService } from 'src/app/services/categories/categories.service';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: []
})
export class CategoryFormComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject

  public addCategoryAction = CategoryEvent.ADD_CATEGORY_ACTION
  public editCategoryAction = CategoryEvent.EDIT_CATEGORY_ACTION

  public categoryAction!: {event: EditCategoryAction}
  public categoryForm = this.formBuilder.group({
    name: ['', Validators.required],
  })

    constructor(
      private formBuilder: FormBuilder,
      private ref: DynamicDialogConfig,
      private messageService: MessageService,
      private categoriesService: CategoriesService
    ){}
  ngOnInit(): void {
    this.categoryAction = this.ref.data

    if((this.categoryAction?.event?.action === this.editCategoryAction && this.categoryAction?.event?.category_name !== null) || undefined){
      this.setCategoryName(this.categoryAction?.event?.category_name as string)
    }
  }

  handleSubmitAddCategory(): void {
    if(this.categoryForm?.valid && this.categoryForm?.value){
      const requestCreateCategory: {name: string} = {
        name: this.categoryForm.value.name as string,
      }
      this.categoriesService.createCategory(requestCreateCategory).pipe(takeUntil(this.destroy$)).subscribe({
        next: (r)=> {
          if(r){
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Categoria criada com sucesso',
              life: 3000
            })
          }
        },
        error: (e) => {
          console.log(e)
          this.categoryForm.reset()
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao criar categoria!',
            life: 3000
          })
        }

      })
    }
  }

  handleSubmitCategoryAction(): void {
    if(this.categoryAction?.event?.action === this.addCategoryAction){
      this.handleSubmitAddCategory()
    }
    else if(this.categoryAction?.event?.action === this.editCategoryAction){
      this.handleSubmitEditCategory()
    }
    return
  }

  handleSubmitEditCategory(): void {
    if(this.categoryForm?.value && this.categoryForm?.valid && this.categoryAction?.event?.id){
      const requestEditCategory: {name: string; category_id: string} = {
        name: this.categoryForm?.value?.name as string,
        category_id: this.categoryAction?.event?.id
      }

      this.categoriesService.editCategoryName(requestEditCategory).pipe(takeUntil(this.destroy$)).subscribe({
        next: ()=> {
          this.categoryForm.reset()
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Categoria editada com sucesso',
            life: 3000
          })
        },
        error: (e)=> {
          console.log(e)
          this.categoryForm.reset()
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao editar categoria',
            life: 3000
          })
        }
      })
    }
  }

  setCategoryName(category_name: string): void {
    if(category_name){
      this.categoryForm.setValue({
        name: category_name,
      })
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
