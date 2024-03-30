import { ProductsFormComponent } from './../../components/products-form/products-form.component';
import { GetAllProductsResponse } from 'src/app/models/interfaces/response/getAllProductsResponse';
import { ProductsService } from './../../../../services/products/products.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, take, takeUntil } from 'rxjs';
import { ProductsDataTransferService } from 'src/app/shared/services/products/products-data-transfer.service';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EventAction } from 'src/app/models/interfaces/event/eventAction';
import { DeleteProductAction } from 'src/app/models/interfaces/event/deleteProductAction';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: []
})
export class ProductsComponent implements OnDestroy, OnInit {
  private destroy$ = new Subject<void>()
  public productsList: Array<GetAllProductsResponse> = []
  private ref!: DynamicDialogRef

  constructor(
    private productsService: ProductsService,
    private productsDtService: ProductsDataTransferService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService
     ){}

  ngOnInit(): void {
    this.getServiceProductsDatas()
  }

    getServiceProductsDatas(){
      const productsLoaded = this.productsDtService.getProductsDatas()
      if(productsLoaded.length > 0){
        this.productsList = productsLoaded
      } else this.getAPIProductsData()
    }


  getAPIProductsData() {
    this.productsService.getAllProducts().pipe(takeUntil(this.destroy$)).subscribe({
      next: (r)=>{
        if(r.length > 0){
          this.productsList = r
        }
      },
      error: (e)=>{
        this.router.navigate(['/dashboard'])
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao realizar busca de produtos',
          life: 2500
        })
      }
    })
  }

  handleProductAction(event: EventAction): void {
    //Assim que receber um output a função roda
    if(event){
      this.ref = this.dialogService.open(ProductsFormComponent, {
        header: event?.action,
        width: '70%',
        contentStyle: { overflow: 'auto' },
        baseZIndex: 10000,
        maximizable: true,
        data: {
          event: event,
          productsList: this.productsList,
        }
      })
      this.ref.onClose.pipe(takeUntil(this.destroy$)).subscribe({
        next: ()=> this.getAPIProductsData(),
        error: (error) => console.error('Error in onClose event:', error),
      })
    }
  }

  handleDeleteAction(event: DeleteProductAction): void {
    if(event){
      this.confirmationService.confirm({
        message: `Confirma a exclusão do produto? ${event.product_name}?`,
        header: "Confirmar exclusão",
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sim',
        rejectLabel: 'Não',
        accept: ()=> this.deleteProduct(event?.product_id)
      })
    console.log(event)
    }
  }

  deleteProduct(product_id: string) {
    if(product_id) {
      this.productsService.deleteProduct(product_id).pipe(takeUntil(this.destroy$)).subscribe({
        next: (r)=> {
          if(r){
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Produto removido com sucesso',
            life: 2000,
          })
          this.getAPIProductsData()
        }
        },
        error: (e)=> {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao deletar produto',
            life: 2000,
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
