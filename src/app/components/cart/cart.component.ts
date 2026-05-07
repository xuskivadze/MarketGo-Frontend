import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  public cartData: any = null;
  public isLoading: boolean = false;
  private userId: number = 2; // ID გამოვიტანოთ ცალკე, რომ ყველგან არ ვწეროთ

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this.apiService.getCart(this.userId).subscribe({
      next: (res: any) => {
        // აქ დავაზუსტოთ მონაცემების სტრუქტურა
        if (res && res.isSuccess) {
          this.cartData = res.data;
        } else {
          this.cartData = res;
        }
        this.isLoading = false;
        console.log('კალათის მონაცემები:', this.cartData); // დალოგე, რომ ნახო რა მოდის
      },
      error: (err) => {
        console.error('შეცდომა ჩატვირთვისას:', err);
        this.isLoading = false;
      }
    });
  }

  handleImageError(event: any) {
  // თუ სურათი ვერ ჩაიტვირთა, ჩაანაცვლებს "No Image" placeholder-ით
  event.target.src = 'assets/images/no-image.png'; 
}

 updateQuantity(item: any, change: number): void {
  const newQty = item.quantity + change;
  if (newQty < 1) return;

  // 1. ოპტიმისტური განახლება (UI-ში მაშინვე იცვლება ციფრი)
  item.quantity = newQty;

  // 2. API-ს გამოძახება ფონურ რეჟიმში
  this.apiService.addToCart(this.userId, item.productId, change).subscribe({
    next: () => {
      // აქ წავშალეთ this.loadCart(), რომ ეკრანი არ აციმციმდეს.
      // თუ ნავბარში რაოდენობის განახლება გინდა, გამოიყენე BehaviorSubject სერვისში.
      console.log('რაოდენობა წარმატებით განახლდა ბაზაში');
    },
    error: (err) => {
      console.error('შეცდომა რაოდენობისას:', err);
      // თუ ბექენდმა შეცდომა დააბრუნა, მხოლოდ მაშინ დავაბრუნოთ ძველი მნიშვნელობა
      item.quantity -= change; 
    }
  });
}

  deleteItem(itemId: number): void {
    if (!itemId) return;
    this.apiService.removeItem(itemId).subscribe({
      next: () => this.loadCart(),
      error: (err) => console.error('წაშლის შეცდომა:', err)
    });
  }

  clearCart(): void {
    if (confirm('ნამდვილად გსურთ კალათის სრული გასუფთავება?')) {
      this.isLoading = true;
      this.apiService.clearCart(this.userId).subscribe({
        next: () => {
          this.loadCart();
        },
        error: (err) => {
          console.error('გასუფთავების შეცდომა:', err);
          this.isLoading = false;
        }
      });
    }
  }

  calculateTotal() {
  if (!this.cartData || !this.cartData.items) return 0;

  return this.cartData.items.reduce((acc: number, item: any) => {
    const currentPrice = (item.salePrice && item.salePrice > 0) ? item.salePrice : item.price;
    return acc + (currentPrice * item.quantity);
  }, 0);
}

  checkout(): void {
    alert('შეკვეთა გაფორმდა!');
  }
}