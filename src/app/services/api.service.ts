import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable,Subject,BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // დარწმუნდი, რომ პორტი (7083) ზუსტია
  private baseUrl = 'https://localhost:7083/api';

private salesTrigger = new Subject<void>();
salesTrigger$ = this.salesTrigger.asObservable();

  constructor(private http: HttpClient) { }

triggerSalesFilter() {
    this.salesTrigger.next();
  }

  // api.service.ts-ში
  private cartCount = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCount.asObservable();
private searchTrigger = new Subject<string>();
searchTrigger$ = this.searchTrigger.asObservable();

triggerSearch(term: string) {
  this.searchTrigger.next(term);
}
  
  getCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/Categories`);
  }

 getProducts(filters: any): Observable<any> {
  let params = new HttpParams();

  // 1. ვაიძულებთ პროგრამას, რომ categoryId ციფრად აღიქვას (+)
  const catId = +filters.categoryId;

  // 2. თუ ID მეტია 0-ზე, აუცილებლად ვამატებთ პარამეტრებში
  if (catId > 0) {
    params = params.append('categoryId', catId.toString());
  }

  if (filters.minPrice) params = params.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice) params = params.append('maxPrice', filters.maxPrice.toString());
  if (filters.search) params = params.append('search', filters.search);
  if (filters.sort) params = params.append('sort', filters.sort);

  // 3. ეს ხაზი დაგვეხმარება დიაგნოსტიკაში - ნახე კონსოლში რა დაიბეჭდება!
  console.log('მოთხოვნა იგზავნება მისამართზე:', `${this.baseUrl}/Products?${params.toString()}`);

  return this.http.get<any>(`${this.baseUrl}/Products`, { params });
}
  

  addcart(userId: string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Carts/${userId}/items`, data);
  }
  
  // api.service.ts-ში დაამატე
getLowStockProducts(): Observable<any> {
  return this.http.get<any>(`https://localhost:7083/api/Products/low-stock`);
}

// აუცილებლად მიუთითე : Observable<any>
getProductById(id: number): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/Products/${id}`);
}

// api.service.ts
getReviews(): Observable<any[]> {
  // დარწმუნდი, რომ აქ this.baseUrl წერია და არა this.apiUrl
  return this.http.get<any[]>(`${this.baseUrl}/Reviews`);
}

// api.service.ts
private resetSearchTrigger = new Subject<void>();
resetSearchTrigger$ = this.resetSearchTrigger.asObservable();

triggerResetSearch() {
  this.resetSearchTrigger.next();
}

// კალათის წამოღება (userId: 2 სატესტოდ)
  getCart(userId: number = 2): Observable<any> {
    return this.http.get(`${this.baseUrl}/Carts/${userId}`).pipe(
      tap((res: any) => {
        const count = res.data?.items?.length || 0;
        this.cartCount.next(count); // ნავბარისთვის რაოდენობის განახლება
      })
    );
  }

  // კალათაში დამატება
  addToCart(userId: number, productId: number, quantity: number): Observable<any> {
  const payload = { 
    productId: productId, // დარწმუნდი რომ ბექენდშიც პატარა p-თი იწყება
    quantity: quantity 
  };
  return this.http.post(`${this.baseUrl}/Carts/${userId}/items`, payload);
}

  // ნივთის წაშლა კალათიდან
  removeItem(itemId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Carts/items/${itemId}`);
  }

 // api.service.ts-ში ჩაამატე ეს ფუნქცია
clearCart(userId: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/Carts/clear/${userId}`);
}

createOrder(orderData: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/Orders`, orderData);
}


}