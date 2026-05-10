import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css'
  
})
export class FilterComponent implements OnInit {
  public categories: any[] = [];
  public products: any[] = [];
  public cartMessage: string | null = null;
 
  public totalPages: number = 0;
  public totalCount: number = 0;

  // ფილტრების ობიექტი ტიპიზაციის გარეშე (any), რომ ერორები აიცილო
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

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.loadCategories();
    this.applyFilters();
    this.loadLowStockStatus();

  this.apiService.salesTrigger$.subscribe(() => {
    this.filters.onlySales = true;
    this.applyFilters();
  });

  
  // ცალკე გამოწერა ძებნისთვის (გამოიტანეთ გარეთ!)
  this.apiService.searchTrigger$.subscribe((term: string) => {
    this.filters.search = term; 
    this.applyFilters();        
  });
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  loadCategories() {
    this.apiService.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res.data || res;
      },
      error: (err) => console.error('კატეგორიების ჩატვირთვის შეცდომა:', err)
    });
  }

// filter.component.ts



selectCategory(id: number) {
  console.log('სელექტორმა მიიღო ID:', id);
  
  // 1. განაახლე categoryId
  this.filters.categoryId = id; 
  
  // 2. გვერდი დააბრუნე პირველზე (თუ pagination გაქვს)
  this.filters.pageIndex = 1; 
  
  // 3. გამოიძახე applyFilters(), რადგან შენს კოდში ასე ჰქვია ფუნქციას
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
  // 1. ყოველთვის, როცა ფილტრს ვიყენებთ, სთეითი გადაგვყავს ჩატვირთვის რეჟიმში
  this.products = []; 

  this.apiService.getProducts(this.filters).subscribe({
    next: (res: any) => {
      // 2. ვიღებთ მონაცემებს PagedResult-იდან (res.data)
      // შენი Swagger-ის მიხედვით, პასუხი მოდის "data" ობიექტში
      const pagedData = res.data || res;
      let allItems = pagedData.items || [];

      // 3. ფასდაკლების ფილტრი (თუ ფრონტზე გაქვს SALE ჩართული)
      if (this.filters.onlySales === true) {
        this.products = allItems.filter((p: any) => p.currentPrice < p.price);
      } else {
        this.products = allItems;
      }

      // 4. პაგინაციის მონაცემების შენახვა კომპონენტის ცვლადებში
      // ეს მნიშვნელოვანია, რომ HTML-ში გვერდების ღილაკები გამოჩნდეს
      this.totalPages = pagedData.totalPages || 0;
      this.totalCount = pagedData.totalCount || 0;
      this.filters.pageIndex = pagedData.pageIndex || 1;
      
      console.log('მონაცემები ჩაიტვირთა:', {
        count: this.products.length,
        total: this.totalCount,
        pages: this.totalPages
      });
    },
    error: (err) => {
      console.error('პროდუქტების ჩატვირთვის შეცდომა:', err);
    }
  });
}



changePage(newPage: number) {
  if (newPage >= 1 && newPage <= this.totalPages) {
    this.filters.pageIndex = newPage;
    this.applyFilters();
    
    // გვერდზე გადასვლისას ავიდეს პროდუქტების დასაწყისში
    const element = document.getElementById('products-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

shouldShowPage(page: number): boolean {
  const current = this.filters.pageIndex;
  const last = this.totalPages;

  // თუ სულ 5 ან ნაკლები გვერდია, გამოაჩინე ყველა
  if (last <= 5) return true;

  // ყოველთვის გამოაჩინე პირველი და ბოლო გვერდი
  if (page === 1 || page === last) return true;

  // აჩვენე გვერდები მიმდინარეს გარშემო ისე, რომ ჯამში 5-მდე ავიდეს
  // (2 გვერდი აქეთ, 2 გვერდი იქით)
  if (Math.abs(page - current) <= 1) return true;

  return false;
}

showDots(page: number): boolean {
  const current = this.filters.pageIndex;
  const last = this.totalPages;

  // წერტილები გამოჩნდეს მხოლოდ მაშინ, როცა რეალური გამოტოვებაა
  if (page === 2 && current > 3) return true;
  if (page === last - 1 && current < last - 2) return true;

  return false;
}

// კომპონენტის შიგნით, კონსტრუქტორამდე დაამატე:
public showToast: boolean = false;
public toastMessage: string = '';
public currentToastImage: string = '';
private toastTimeout: any; // ტაიმერის შესანახად
// მეთოდი თავიდან ბოლომდე:

addtoCart(item: any) {
  if (!item || !item.id) {
    console.error('პროდუქტის მონაცემები არასრულია');
    return;
  }

  this.apiService.addToCart(2, item.id, 1).subscribe({
    next: (res: any) => {
      if (res) {
        // 1. წინა ტაიმერის გაუქმება
        if (this.toastTimeout) {
          clearTimeout(this.toastTimeout);
        }
        
        this.toastMessage = `${item.name} წარმატებით`;
        this.currentToastImage = item.pictureUrl || 'https://placehold.co/50x50';
        
        // ანიმაციის რესეტი (რომ ყოველ დაჭერაზე თავიდან შემოვიდეს)
        this.showToast = false;
        setTimeout(() => {
          this.showToast = true;
        }, 10);

        this.apiService.getCart(2).subscribe();

        // 2. მნიშვნელოვანია: ახალი ტაიმერი შეინახე ცვლადში!
        this.toastTimeout = setTimeout(() => {
          this.showToast = false;
        }, 2500);
      }
    },
    error: (err) => {
      console.error('კალათაში დამატების შეცდომა:', err);
      this.toastMessage = 'ვერ მოხერხდა დამატება ❌';
      this.showToast = true;
      
      this.toastTimeout = setTimeout(() => {
        this.showToast = false;
      }, 2500);
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

  // filter.component.ts-ში დაამატე ცვლადი
public lowStockIds: number[] = [];

// ngOnInit-ში გამოიძახე ახალი ფუნქცია

loadLowStockStatus() {
  this.apiService.getLowStockProducts().subscribe({
    next: (res: any) => {
      // res არის პროდუქტების მასივი, ჩვენ მხოლოდ ID-ები გვჭირდება
      this.lowStockIds = res.map((p: any) => p.id);
    },
    error: (err) => console.error('Low stock error:', err)
  });
}

// შექმენი დამხმარე ფუნქცია შემოწმებისთვის
isLowStock(productId: number): boolean {
  return this.lowStockIds.includes(productId);
}





}