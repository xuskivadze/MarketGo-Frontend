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
  selectedImage: string = ''; // აქ შევინახავთ აქტიურ ფოტოს
  public showToast: boolean = false;
  public toastMessage: string = '';
  public currentToastImage: string = '';
  private toastTimeout: any;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router
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
        // როცა პროდუქტი ჩაიტვირთება, პირველადი ფოტო იყოს pictureUrl
        this.selectedImage = this.product.pictureUrl;
      }
    });

    this.apiService.getReviews().subscribe((res: any) => {
      const allReviews = Array.isArray(res) ? res : (res?.data || []);
      this.reviews = allReviews.filter((r: any) => r.productId === id);
    });
  }

  // ფუნქცია, რომელიც შეცვლის მთავარ ფოტოს პატარა ფოტოზე დაჭერისას
  selectImage(url: string) {
    this.selectedImage = url;
  }

 // განახლებული addToCart მეთოდი
  addToCart() {
    if (!this.product || !this.product.id) return;

    this.apiService.addToCart(2, this.product.id, 1).subscribe({
      next: (res: any) => {
        if (res) {
          // 1. ძველი ტაიმერის გასუფთავება
          if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
          }

          // 2. მონაცემების მომზადება
          this.toastMessage = `${this.product.name} - ${this.product.currentPrice} ₾`;
          this.currentToastImage = this.product.pictureUrl || 'https://placehold.co/50x50';
          
          // 3. ანიმაციის რესეტი და ჩვენება
          this.showToast = false;
          setTimeout(() => {
            this.showToast = true;
          }, 10);

          // 4. ნავბარის ციფრის განახლება
          this.apiService.getCart(2).subscribe();

          // 5. გაქრობის ტაიმერი
          this.toastTimeout = setTimeout(() => {
            this.showToast = false;
          }, 2500);
        }
      },
      error: (err) => {
        console.error('შეცდომა კალათაში დამატებისას:', err);
        this.toastMessage = 'ვერ მოხერხდა დამატება ❌';
        this.showToast = true;
        this.toastTimeout = setTimeout(() => { this.showToast = false; }, 2500);
      }
    });
  }
}
