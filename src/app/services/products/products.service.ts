import { DeleteProductResponse } from './../../models/interfaces/response/deleteProductResponse';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { GetAllProductsResponse } from 'src/app/models/interfaces/response/getAllProductsResponse';
import { environment } from 'src/environments/environments';
import { map, filter } from 'rxjs';
import { CreateProductRequest } from 'src/app/models/interfaces/request/createProductRequest';
import { CreateProductResponse } from 'src/app/models/interfaces/response/createProductResponse';
import { EditProductRequest } from 'src/app/models/interfaces/request/editProductRequest';
import { SaleProductRequest } from 'src/app/models/interfaces/request/saleProductRequest';
import { SaleProductResponse } from 'src/app/models/interfaces/response/saleProductResponse';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private API_URL = environment.API_URL
  private JWT_TOKEN = this.cookie.get('USER_INFO')
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.JWT_TOKEN}`,
    })
  }

  constructor( private http: HttpClient, private cookie: CookieService ) { }

  getAllProducts(): Observable<Array<GetAllProductsResponse>>{
    return this.http.get<Array<GetAllProductsResponse>>(
      `${this.API_URL}/products`,
      this.httpOptions
    )
    .pipe(map((product)=> product.filter((data)=> data?.amount > 0)))
  }

  deleteProduct(product_id: string): Observable<DeleteProductResponse> {
   return this.http.delete<DeleteProductResponse>(`${this.API_URL}/product/delete`,{
    ...this.httpOptions,
    params: {
      product_id: product_id
    }
   })
  }

  createProduct(productInfo: CreateProductRequest): Observable<CreateProductResponse>{
    return this.http.post<CreateProductResponse>(
      `${this.API_URL}/product`,
      productInfo,
      this.httpOptions
    )
  }

  editProduct(productInfo: EditProductRequest): Observable<void> {
    return this.http.put<void>(
      `${this.API_URL}/product/edit`,
      productInfo,
      this.httpOptions
    )
  }

  saleProduct(requestDatas: SaleProductRequest): Observable<SaleProductResponse>{
    return this.http.put<SaleProductResponse>(
      `${this.API_URL}/product/sale`,
      {
        amount: requestDatas?.amount,
      },
      {
        ...this.httpOptions,
        params: {
          product_id: requestDatas?.product_id,
        }
      }
    )

  }

}
