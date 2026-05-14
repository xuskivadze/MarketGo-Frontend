import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {
  product: any;
  reviews: any[] = [];
  selectedImage: string = '';
  public showToast: boolean = false;
  public toastMessage: string = '';
  public currentToastImage: string = '';
  private toastTimeout: any;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadData(id);
      }
    });
  }

  goToCart() {
  this.router.navigate(['/cart']);
}

  loadData(id: number) {
    this.apiService.getProductById(id).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this.product = res.data;
        this.selectedImage = this.product.pictureUrl;
      }
    });

    this.apiService.getReviews().subscribe((res: any) => {
      const allReviews = Array.isArray(res) ? res : (res?.data || []);
      this.reviews = allReviews.filter((r: any) => r.productId === id);
    });
  }

  selectImage(url: string) {
    this.selectedImage = url;
  }

  
 addToCart() {
  if (!this.product || !this.product.id) return;

  const token = localStorage.getItem('token');
  const currentUserId = Number(localStorage.getItem('userId')) || 1;
  if (!token) {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    
    this.toastMessage = 'ავტორიზაცია საჭიროა!';
    this.currentToastImage = '';
    this.showToast = false;
    
    setTimeout(() => { this.showToast = true; }, 10);
    this.toastTimeout = setTimeout(() => { this.showToast = false; }, 2500);
    return;
  }

  this.apiService.addToCart(currentUserId, this.product.id, 1).subscribe({
    next: (res: any) => {
      if (this.toastTimeout) clearTimeout(this.toastTimeout);
      this.toastMessage = `${this.product.name} დაემატა კალათაში ✅`;
      this.currentToastImage = this.product.pictureUrl || 'https://placehold.co/50x50';
      this.showToast = false;
      setTimeout(() => { this.showToast = true; }, 10);
      this.apiService.getCart(currentUserId).subscribe();
      this.toastTimeout = setTimeout(() => { this.showToast = false; }, 2500);
    },
    error: (err) => {
      if (this.toastTimeout) clearTimeout(this.toastTimeout);
      this.currentToastImage = ''; 
      this.toastMessage = err.status === 401 ? 'ავტორიზაცია საჭიროა' : 'ვერ მოხერხდა დამატება';
      this.showToast = false;
      setTimeout(() => { this.showToast = true; }, 10);
      this.toastTimeout = setTimeout(() => { this.showToast = false; }, 2500);
    }
  });
}

startShopping() {
  this.router.navigate(['/filter'], { fragment: 'products-section' });
}

viewSales() {
  this.router.navigate(['/filter'], { 
    fragment: 'products-section',
    queryParams: { sales: true } 
  });
}
}
