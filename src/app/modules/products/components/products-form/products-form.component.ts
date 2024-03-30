import { GetAllCategories } from 'src/app/models/interfaces/categories/getAllCategories';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { CategoriesService } from 'src/app/services/categories/categories.service';
import { ProductsService } from 'src/app/services/products/products.service';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { EventAction } from 'src/app/models/interfaces/event/eventAction';
import { GetAllProductsResponse } from 'src/app/models/interfaces/response/getAllProductsResponse';
import { ProductsDataTransferService } from 'src/app/shared/services/products/products-data-transfer.service';
import { ProductEvent } from 'src/app/models/enums/products/productEvent';
import { EditProductRequest } from 'src/app/models/interfaces/request/editProductRequest';
import { SaleProductResponse } from 'src/app/models/interfaces/response/saleProductResponse';
import { SaleProductRequest } from 'src/app/models/interfaces/request/saleProductRequest';

@Component({
  selector: 'app-products-form',
  templateUrl: './products-form.component.html',
  styleUrls: []
})
export class ProductsFormComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>()
  public categoriesDatas: Array<GetAllCategories> = []
  public selectedCategory: Array<{name: string; code: string}> = []
  public productAction!: {
    event: EventAction,
    productDatas: Array<GetAllProductsResponse>
  }
  public productSelectedDatas!: GetAllProductsResponse
  public productsData: Array<GetAllProductsResponse> = []
  public addProductForm = this.formBuilder.group({
    name: ['', Validators.required],
    price: ['', Validators.required],
    description: ['', Validators.required],
    category_id: ['', Validators.required],
    amount: [0, Validators.required]
  })

  public addProductAction = ProductEvent.ADD_PRODUCT_EVENT
  public editProductAction = ProductEvent.EDIT_PRODUCT_EVENT
  public saleProductAction = ProductEvent.SALE_PRODUCT_EVENT
  public handlerDropDown = false

  public editProductForm = this.formBuilder.group({
    name: ['', Validators.required],
    price: ['', Validators.required],
    description: ['', Validators.required],
    amount: [0, Validators.required],
    category_id: ['', Validators.required]
  })

  public saleProductForm = this.formBuilder.group({
    amount: [0, Validators.required],
    product_id: ['', Validators.required]
  })

  public saleProductSelected!: GetAllProductsResponse

  constructor( private router: Router,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private categoriesService: CategoriesService,
    private productService: ProductsService,
    private ref: DynamicDialogConfig,
    private productsDtService: ProductsDataTransferService){ }

  ngOnInit(): void {
    this.productAction = this.ref.data

    this.productAction?.event?.action === this.saleProductAction && this.getProductDatas()

    this.getAllCategories()
    this.handlerDropDown = true
  }

  getAllCategories(): void {
    this.categoriesService.getAllCategories().pipe(takeUntil(this.destroy$)).subscribe({
      next: (r)=>{
        if(r.length > 0){
          if(this.productAction?.event?.action === this.editProductAction && this.productAction?.productDatas) {
            this.getProductSelectedDatas(this.productAction?.event?.id as string)
          }
          this.categoriesDatas = r
        }
      }
    })
  }

  handleSubmitAddProduct(): void{
    if(this.addProductForm?.value && this.addProductForm?.valid){
      const requestCreateProduct = {
        name: this.addProductForm.value.name as string,
        price: this.addProductForm.value.price as string,
        description: this.addProductForm.value.description as string,
        category_id: this.addProductForm.value.category_id as string,
        amount: Number(this.addProductForm.value.amount)
      }
      this.productService.createProduct(requestCreateProduct).pipe(takeUntil(this.destroy$)).subscribe({
        next: (r)=> {
          if(r){
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Produto criado com sucesso',
              life: 2500,
            })
          }
        },
        error: (e)=> {
          console.log(e)
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao cadastrar produto',
            life: 2500,
          })
        }
      })
    }
    this.addProductForm.reset()
  }

  handleEditProduct(): void {
    if(this.editProductForm.value && this.editProductForm.valid && this.productAction.event.id){
      const requestEditProduct: EditProductRequest = {
        name: this.editProductForm.value.name as string,
        price: this.editProductForm.value.price as string,
        description: this.editProductForm.value.description as string,
        product_id: this.productAction?.event.id as string ,
        amount: this.editProductForm.value.amount as number,
        category_id: this.editProductForm.value.category_id as string
      }
      this.productService.editProduct(requestEditProduct).pipe(takeUntil(this.destroy$)).subscribe({
        next: ()=> {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Produto editado com sucesso',
            life: 2500
          })
          this.editProductForm.reset()
        },
        error: (e)=> {
          console.log(e)
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao editar produto',
            life: 2500
          })
          this.editProductForm.reset()
        }
      })
    }
  }

  handleSubmitSaleProduct(): void{
    if(this.saleProductForm?.value && this.saleProductForm?.valid){
      const requestDatas: SaleProductRequest = {
        amount: this.saleProductForm.value?.amount as number,
        product_id: this.saleProductForm.value?.product_id as string,
      }
      this.productService.saleProduct(requestDatas).pipe(takeUntil(this.destroy$)).subscribe({
        next: (r)=> {
          if(r) {
            this.saleProductForm.reset()
            this.getProductDatas()
            this.router.navigate(['/dashboard'])
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Venda realizada com sucesso',
              life: 3000
            })
          }
        },
        error: (e)=> {
          console.log(e)
          this.saleProductForm.reset()
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao realizar venda',
            life: 3000
          })
        }
      })
    }
  }

  getProductSelectedDatas(productId: string): void {
    const allProducts = this.productAction?.productDatas

    if(allProducts.length > 0){
      const productFiltered = allProducts.filter(
        (element) => element?.id === productId
      )
      if(productFiltered){
        this.productSelectedDatas = productFiltered[0]

        this.editProductForm.setValue({
          name: this.productSelectedDatas?.name,
          price: this.productSelectedDatas?.price,
          amount: this.productSelectedDatas?.amount,
          description: this.productSelectedDatas?.description,
          category_id: this.productSelectedDatas?.category?.id
        })
      }
    }
  }

  getProductDatas(): void {
    this.productService.getAllProducts().pipe(takeUntil(this.destroy$)).subscribe({
      next: (r)=>{
        if(r.length > 0) {
          this.productsData = r
          this.productsData && this.productsDtService.setProductsDatas(this.productsData)
        }
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
