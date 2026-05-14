import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { RouterModule, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css'
})
export class FilterComponent implements OnInit {
  public categories: any[] = [];
  public products: any[] = [];
  public cartMessage: string | null = null;
  public totalPages: number = 0;
  public totalCount: number = 0;
  public isSubmitting: boolean = false;
  public showToast: boolean = false;
  public toastMessage: string = '';
  public currentToastImage: string = '';
  private toastTimeout: any;
  public lowStockIds: number[] = [];

  public filters: any = {
    categoryId: 0,
    minPrice: null,
    maxPrice: null,
    search: '',
    sort: 'name',
    onlySales: false,
    pageIndex: 1,
    pageSize: 9
  };

  constructor(private apiService: ApiService, public router: Router, private route: ActivatedRoute) {}


  

  ngOnInit() {
  this.loadCategories();
  this.applyFilters();
  this.loadLowStockStatus();

  this.apiService.salesTrigger$.subscribe(() => {
    this.filters.onlySales = true;
    this.filters.pageIndex = 1;
    this.applyFilters();
    this.scrollToProducts();
  });

  this.apiService.searchTrigger$.subscribe((term: string) => {
    this.filters.search = term; 
    this.filters.pageIndex = 1;
    this.applyFilters();         
  });
  
  this.apiService.scrollTrigger$.subscribe(() => {
    this.scrollToProducts();
  });

  this.route.fragment.subscribe(frag => {
    if (frag === 'products-section') {
      this.scrollToProducts();
    }
  });

  this.route.queryParams.subscribe(params => {
    if (params['sales'] === 'true' || params['onlySales'] === 'true') {
      this.filters.onlySales = true;
      this.applyFilters();
      this.scrollToProducts();
    }
  });

    this.route.fragment.subscribe(frag => {
      if (frag === 'products-section') {
        setTimeout(() => {
          const element = document.getElementById('products-section');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      }
    });
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  scrollToProducts() {
  setTimeout(() => {
    const element = document.getElementById('products-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
}

  loadCategories() {
    this.apiService.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res.data || res;
      },
      error: (err) => console.error('კატეგორიების ჩატვირთვის შეცდომა:', err)
    });
  }

  selectCategory(id: number) {
    this.filters.categoryId = id; 
    this.filters.pageIndex = 1; 
    this.applyFilters(); 
  }

  showSales() {
    this.filters.onlySales = true;
    this.applyFilters();
    
    const element = document.getElementById('products-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  applyFilters() {
    this.products = []; 
    this.apiService.getProducts(this.filters).subscribe({
      next: (res: any) => {
        const pagedData = res.data || res;
        let allItems = pagedData.items || [];

        if (this.filters.onlySales === true) {
          this.products = allItems.filter((p: any) => p.currentPrice < p.price);
        } else {
          this.products = allItems;
        }

        this.totalPages = pagedData.totalPages || 0;
        this.totalCount = pagedData.totalCount || 0;
        this.filters.pageIndex = pagedData.pageIndex || 1;
      },
      error: (err) => console.error('პროდუქტების ჩატვირთვის შეცდომა:', err)
    });
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.filters.pageIndex = newPage;
      this.applyFilters();
      
      const element = document.getElementById('products-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  shouldShowPage(page: number): boolean {
    const current = this.filters.pageIndex;
    const last = this.totalPages;
    if (last <= 5) return true;
    if (page === 1 || page === last) return true;
    if (Math.abs(page - current) <= 1) return true;
    return false;
  }

  showDots(page: number): boolean {
    const current = this.filters.pageIndex;
    const last = this.totalPages;
    if (page === 2 && current > 3) return true;
    if (page === last - 1 && current < last - 2) return true;
    return false;
  }

  addtoCart(item: any) {
    if (this.isSubmitting) return;

    const token = localStorage.getItem('token');
    const currentUserId = Number(localStorage.getItem('userId')) || 1;
    
    if (!token) {
      if (this.toastTimeout) clearTimeout(this.toastTimeout);
      
      this.toastMessage = 'ავტორიზაცია საჭიროა!';
      this.currentToastImage = ''; 
      this.showToast = false;
      setTimeout(() => {
        this.showToast = true;
      }, 10);

      this.toastTimeout = setTimeout(() => { 
        this.showToast = false; 
      }, 2500);
      return;
    }

    this.isSubmitting = true;

    this.apiService.addToCart(currentUserId, item.id, 1).subscribe({
      next: (res: any) => {
        if (this.toastTimeout) clearTimeout(this.toastTimeout);

        this.toastMessage = `${item.name} დაემატა კალათაში ✅`;
        this.currentToastImage = item.pictureUrl || 'https://placehold.co/50x50';
        this.showToast = false;

        setTimeout(() => {
          this.showToast = true;
          this.isSubmitting = false;
        }, 10);

        this.apiService.getCart(currentUserId).subscribe();

        this.toastTimeout = setTimeout(() => { 
          this.showToast = false; 
        }, 2500);
      },
      error: (err) => {
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.currentToastImage = '';
        this.toastMessage = err.status === 401 ? 'ავტორიზაცია საჭიროა!' : 'ვერ მოხერხდა დამატება ❌';
        this.showToast = false;

        setTimeout(() => {
          this.showToast = true;
          this.isSubmitting = false;
        }, 10);

        this.toastTimeout = setTimeout(() => { this.showToast = false; }, 2500);
      }
    });
  }

  reset() {
    this.filters = {
      categoryId: 0,
      minPrice: null,
      maxPrice: null,
      search: '',
      sort: 'name',
      onlySales: false,
      pageIndex: 1,
      pageSize: 9
    };
    this.apiService.triggerResetSearch();
    this.applyFilters();
  }

  loadLowStockStatus() {
  this.apiService.getLowStockProducts().subscribe({
    next: (res: any) => {
      this.lowStockIds = res.map((p: any) => p.id);
    },
    error: (err) => console.error('Low stock error:', err)
  });
}

  isLowStock(productId: number): boolean {
    return this.lowStockIds.includes(productId);
  }
}