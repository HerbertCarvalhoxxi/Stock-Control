import { EventAction } from 'src/app/models/interfaces/event/eventAction';
import { ProductEvent } from './../../../../models/enums/products/productEvent';
import { GetAllProductsResponse } from './../../../../models/interfaces/response/getAllProductsResponse';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DeleteProductAction } from 'src/app/models/interfaces/event/deleteProductAction';

@Component({
  selector: 'app-products-table',
  templateUrl: './products-table.component.html',
  styleUrls: []
})
export class ProductsTableComponent {

  @Input() products: Array<GetAllProductsResponse> = []
  @Output() productEvent = new EventEmitter<EventAction>
  @Output() deleteProductEvent = new EventEmitter<DeleteProductAction> //emite o output para uma função do componente pai

  public productSelected!: GetAllProductsResponse
  public addProductEvent = ProductEvent.ADD_PRODUCT_EVENT
  public editProductEvent = ProductEvent.EDIT_PRODUCT_EVENT

  handleProductEvent(action: string, id?: string): void {
    //recebe qual é o action pelo form
    if(action && action !== ''){
    const productEventData = id && id !== '' ? { action, id } : { action }
    this.productEvent.emit(productEventData)
    //seta o valor no output, que rodará a função do parent
    }
  }

  handleDeleteProduct(productId: string, productName: string): void {
    if(productId !== '' && productName !== ''){
      const productDeleteData = { product_id: productId, product_name: productName }
      this.deleteProductEvent.emit(productDeleteData)
    }
  }

}
