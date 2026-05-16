import { Injectable } from '@angular/core';
import { HttpClient, HttpParams,HttpHeaders } from '@angular/common/http';
import { RegisterDto, LoginDto, UserResponse } from '../models/auth.model';
import { Observable,Subject,BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { API_URL } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = `${API_URL}/api`;
  private apiUrl = `${API_URL}/api/Account`;

  private authStatus = new BehaviorSubject<boolean>(this.isLoggedIn());
  authStatus$ = this.authStatus.asObservable();

  
  private salesTrigger = new Subject<void>();
  salesTrigger$ = this.salesTrigger.asObservable();

  private scrollTrigger = new Subject<void>();
  scrollTrigger$ = this.scrollTrigger.asObservable();

  private categoryScrollTrigger = new Subject<number>();
  categoryScrollTrigger$ = this.categoryScrollTrigger.asObservable();

  constructor(private http: HttpClient) { }


checkAuthStatus() {
    this.authStatus.next(this.isLoggedIn());
  }

  triggerScroll() {
  this.scrollTrigger.next();
}
  
  triggerSales() {
  this.salesTrigger.next();
}

  register(model: RegisterDto): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/register`, model);
  }

login(model: LoginDto): Observable<string> {
    return this.http.post(`${this.apiUrl}/login`, model, { responseType: 'text' }).pipe(
      tap(token => {
        if (token) {
          localStorage.setItem('token', token);
          
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          const userId = tokenData.nameid || tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
          if (userId) {
            localStorage.setItem('userId', userId.toString());
          }
          
          this.authStatus.next(true);
        }
      })
    );
  }

isLoggedIn(): boolean {
  return !!localStorage.getItem('token');
}

  logout() {
    const userId = 1;

    this.clearCart(userId).subscribe({
      next: () => {
        console.log('კალათა სერვერზე გასუფთავდა');
        this.finalizeLogout();
      },
      error: (err) => {
        console.error('სერვერზე კალათა ვერ გასუფთავდა:', err);
        this.finalizeLogout();
      }
    });
  }

    private finalizeLogout() {
    localStorage.removeItem('token');
    this.cartCount.next(0);
    this.authStatus.next(false);
  }


triggerSalesFilter() {
    this.salesTrigger.next();
  }

  private cartCount = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCount.asObservable();
  private searchTrigger = new Subject<string>();
  searchTrigger$ = this.searchTrigger.asObservable();

triggerSearch(term: string) {
  this.searchTrigger.next(term);
}

triggerCategoryScroll(categoryId: number) {
  this.categoryScrollTrigger.next(categoryId);
}
  
  getCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/Categories`);
  }
  
 getProducts(filters: any): Observable<any> {
  let params = new HttpParams();

  const pageIndex = filters.pageIndex || 1;
  const pageSize = filters.pageSize || 12;
  
  params = params.append('pageIndex', pageIndex.toString());
  params = params.append('pageSize', pageSize.toString());
  const catId = +filters.categoryId;

  if (catId > 0) {
    params = params.append('categoryId', catId.toString());
  }

  if (filters.minPrice) params = params.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice) params = params.append('maxPrice', filters.maxPrice.toString());
  if (filters.search) params = params.append('search', filters.search);
  if (filters.sort) params = params.append('sort', filters.sort);

  console.log('მოთხოვნა იგზავნება მისამართზე:', `${this.baseUrl}/Products?${params.toString()}`);

  return this.http.get<any>(`${this.baseUrl}/Products`, { params });
}
  
    addcart(userId: string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Carts/${userId}/items`, data);
  }
  
 getLowStockProducts(): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/Products/low-stock`);
}

  getProductById(id: number): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/Products/${id}`);
}

  getReviews(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/Reviews`);
}

private resetSearchTrigger = new Subject<void>();
resetSearchTrigger$ = this.resetSearchTrigger.asObservable();

triggerResetSearch() {
  this.resetSearchTrigger.next();
}

  getCart(userId: number | null = null): Observable<any> {
    const finalUserId = userId || Number(localStorage.getItem('userId'));
    if (!finalUserId) return this.http.get(`${this.baseUrl}/Carts/0`);

    return this.http.get(`${this.baseUrl}/Carts/${finalUserId}`).pipe(
      tap((res: any) => {
        const count = res.data?.items?.length || 0;
        this.cartCount.next(count);
      })
    );
  }

  addToCart(userId: any, productId: number, quantity: number): Observable<any> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Unauthorized: No token found');
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  const payload = { 
    ProductId: productId, 
    Quantity: quantity 
  };

  return this.http.post(`${this.baseUrl}/Carts/${userId.toString()}/items`, payload, { headers }).pipe(
    tap(() => {
      this.getCart(userId).subscribe();
    })
  );
}


 removeItem(itemId: number): Observable<any> {

  const userId = Number(localStorage.getItem('userId')) || 1;

  return this.http.delete(`${this.baseUrl}/Carts/items/${itemId}`).pipe(
    tap(() => {
      this.getCart(userId).subscribe(); 
    })
  );
}


createOrder(orderData: any): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/Orders`, orderData);
}

getOrdersByUserId(userId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(`${this.baseUrl}/Orders/user/${userId}`, { headers });
  }


  updateOrderStatus(orderId: number, status: string): Observable<any> {
  const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  return this.http.put(`${this.baseUrl}/Orders/${orderId}/status`, JSON.stringify(status), { headers });
}

  getUserOrders(userId: number): Observable<any> {
  return this.http.get(`${this.baseUrl}/Orders/user/${userId}`);
}

  updateCartCount(count: number) {
    this.cartCount.next(count);
  }
 
  clearCart(userId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Carts/clear/${userId}`);
  }

   clearCartData() {
      this.cartCount.next(0); 
    }


}