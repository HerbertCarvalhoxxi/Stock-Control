import { ChartData, ChartOptions } from 'chart.js';
import { GetAllProductsResponse } from './../../../../models/interfaces/response/getAllProductsResponse';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { ProductsService } from 'src/app/services/products/products.service';
import { ProductsDataTransferService } from 'src/app/shared/services/products/products-data-transfer.service';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: []
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  public productsList: Array<GetAllProductsResponse> = []
  private destroy$ = new Subject<void>()

  public ProductsChartDatas!: ChartData
  public ProductsChartOption!: ChartOptions

  constructor(
    private productsService: ProductsService,
    private messageService: MessageService,
    private productsDtService: ProductsDataTransferService){}

  ngOnInit(): void {
    this.getProductsData()
  }

  getProductsData(): void{
    this.productsService.getAllProducts().pipe(takeUntil(this.destroy$)).subscribe({
    next:(response)=>{
      if(response.length > 0){
        this.productsList = response
        console.log(response)
        this.productsDtService.setProductsDatas(this.productsList)
        this.setChartOptionsConfig()
      }
    },
    error: (err)=>{
      console.log(err)
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao buscar serviço',
        life: 2500,
      })
    }
    })
}

  ngOnDestroy(): void {
  this.destroy$.next()
  this.destroy$.complete()
}

  setChartOptionsConfig(): void{
    if(this.productsList){
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--text-color')
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary')
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border')

    this.ProductsChartDatas = {
      labels: this.productsList.map((element)=> element?.name),
      datasets: [
        {
          label: 'Quantidade',
          backgroundColor: documentStyle.getPropertyValue('--indigo-400'),
          borderColor: documentStyle.getPropertyValue('--indigo-400'),
          hoverBackgroundColor: documentStyle.getPropertyValue('--indigo-500'),
          data: this.productsList.map((element)=> element?.amount),
        },
      ],
    }

    this.ProductsChartOption = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins:{
        legend:{
          labels:{
            color: textColor
          }
        }
      },
      scales:{
        x:{
          ticks:{
            color: textColorSecondary,
            font: {
              weight: "bolder",
            },
          },
          grid:{
            color: surfaceBorder
          }
        },
        y:{
          ticks:{
            color: textColorSecondary,
            font: {
              weight: "bolder",
            },
          },
          grid:{
            color: surfaceBorder
          }

        }
      }
    }
  }
  }



}
