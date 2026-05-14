import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import Swal from 'sweetalert2';


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
  private get userId(): number {
  return Number(localStorage.getItem('userId')) || 1;
}
  showPaymentModal: boolean = false;
  currentOrderId: number = 0;

  constructor(private apiService: ApiService, ) {}

  ngOnInit(): void {
    this.loadCart();
  }


 loadCart(): void {
    this.isLoading = true;
    this.apiService.getCart(this.userId).subscribe({
      next: (res: any) => {
        if (res && res.isSuccess) {
          this.cartData = res.data;
        } else {
          this.cartData = res;
        }
        this.isLoading = false;
        console.log('კალათის მონაცემები:', this.cartData);
      },
      error: (err) => {
        console.error('შეცდომა ჩატვირთვისას:', err);
        this.isLoading = false;
      }
    });
  }

  handleImageError(event: any) {
  event.target.src = 'assets/images/no-image.png'; 
}

 updateQuantity(item: any, change: number): void {
  const newQty = item.quantity + change;
  if (newQty < 1) return;

  item.quantity = newQty;

  this.apiService.addToCart(this.userId, item.productId, change).subscribe({
    next: () => {
      const totalCount = this.cartData.items.reduce((acc: number, i: any) => acc + i.quantity, 0);
      this.apiService.updateCartCount(totalCount);
      console.log('რაოდენობა წარმატებით განახლდა ბაზაში');
    },
    error: (err) => {
      console.error('შეცდომა რაოდენობისას:', err);
      item.quantity -= change; 
    }
  });
}

 deleteItem(itemId: number): void {
  if (!itemId) return;

  const index = this.cartData.items.findIndex((item: any) => item.id === itemId);
  
  if (index !== -1) {
    const removedItem = this.cartData.items[index];

    this.cartData.items.splice(index, 1);

    const newCount = this.cartData.items.length;
    this.apiService.updateCartCount(newCount);

    this.apiService.removeItem(itemId).subscribe({
      next: () => {
        console.log('ნივთი წარმატებით წაიშალა');
        this.apiService.getCart(this.userId).subscribe();
      },
      error: (err) => {
        console.error('წაშლის შეცდომა:', err);
        this.cartData.items.splice(index, 0, removedItem);
        alert("ნივთი ვერ წაიშალა, სცადეთ მოგვიანებით");
      }
    });
  }
}

  clearCart(): void {
    (Swal as any).fire({
      title: 'დარწმუნებული ხართ?',
      text: "კალათა სრულად გასუფთავდება!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2ECC71',
      cancelButtonColor: '#f8f9fa',
      cancelButtonText: '<span style="color: #495057">გაუქმება</span>',
      confirmButtonText: 'დიახ, დაცლა',
      reverseButtons: true,      
      background: '#ffffff',
      customClass: {
      popup: 'my-swal-popup',
      confirmButton: 'my-swal-confirm',
      cancelButton: 'my-swal-cancel'
    }
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.apiService.clearCart(this.userId).subscribe({
          next: () => {
            this.loadCart();
            (Swal as any).fire({
              title: 'გასუფთავდა!',
              icon: 'success',
              showConfirmButton: false,
              timer: 1500,
              customClass: {
              popup: 'my-swal-popup'
            }
            });
          },
          error: (err) => {
            console.error('შეცდომა:', err);
            this.isLoading = false;
          }
        });
      }
    });
  }

 calculateTotal() {
  if (!this.cartData || !this.cartData.items) return 0;

  return this.cartData.items.reduce((acc: number, item: any) => {
    const currentPrice = (item.discountPrice && item.discountPrice > 0) 
                         ? item.discountPrice 
                         : item.price;
    return acc + (currentPrice * item.quantity);
  }, 0);
}

processCheckout(): void {
  if (!this.cartData || !this.cartData.items || this.cartData.items.length === 0) {
    alert("კალათა ცარიელია!");
    return;
  }

  this.isLoading = true;

  const orderPayload = {
    basketId: this.userId.toString(),
    shippingAddress: "Tbilisi",
    paymentMethod: "card"
  };

  this.apiService.createOrder(orderPayload).subscribe({
    next: (res: any) => {
      console.log('სერვერის პასუხი:', res);
      if (res.isSuccess && res.data && res.data.id) {
        this.currentOrderId = res.data.id;
        this.showPaymentModal = true; 
      } else {
        alert("შეკვეთის შექმნა ვერ მოხერხდა: " + (res.message || "უცნობი შეცდომა"));
      }
      this.isLoading = false;
    },
    error: (err) => {
      console.error('API შეცდომა:', err);
      this.isLoading = false;
      this.showPaymentModal = true; 
    }
  });
}

confirmPayment(): void {
  if (this.currentOrderId === 0) {
    Swal.fire('შეცდომა', 'შეკვეთა ვერ მოიძებნა!', 'error');
    return;
  }

  this.isLoading = true;

  this.apiService.updateOrderStatus(this.currentOrderId, "PAID").subscribe({
    next: (res: any) => {
      if (res && res.isSuccess) {
        
        this.apiService.clearCart(this.userId).subscribe({
          next: () => {
            this.finishProcess(); 
          },
          error: (err) => {
            console.error("ბაზაში კალათა ვერ წაიშალა", err);
            this.finishProcess();
          }
        });

      } else {
        Swal.fire('შეცდომა', res.message || 'გადახდა ვერ დადასტურდა', 'error');
        this.isLoading = false;
      }
    },
    error: (err) => {
      console.error("სტატუსის განახლების შეცდომა:", err);
      this.isLoading = false;
      Swal.fire('შეცდომა', 'სერვერთან კავშირი გაწყდა', 'error');
    }
  });

  this.isLoading = true;

  this.apiService.updateOrderStatus(this.currentOrderId, "PAID").subscribe({
    next: (res: any) => {
      if (res && res.isSuccess) {
        
        this.apiService.clearCart(this.userId).subscribe({
          next: () => {
            this.finishProcess(); 
          },
          error: (err) => {
            console.error("ბაზაში კალათა ვერ წაიშალა", err);
            this.finishProcess();
          }
        });

      } else {
        Swal.fire('შეცდომა', res.message || 'გადახდის დადასტურება ვერ მოხერხდა', 'error');
        this.isLoading = false;
      }
    },
    error: (err) => {
      console.error("სტატუსის განახლების შეცდომა:", err);
      this.isLoading = false;
      Swal.fire('შეცდომა', 'სერვერთან კავშირი გაწყდა', 'error');
    }
  });
}

private finishProcess(): void {
  this.isLoading = false;
  this.showPaymentModal = false;
  
  this.cartData = { items: [], totalPrice: 0 };

  this.apiService.updateCartCount(0);

  (Swal as any).fire({
    icon: 'success',
    title: 'გადახდა წარმატებულია!',
    text: 'თქვენი შეკვეთა გაფორმდა და კალათა გასუფთავდა.',
    timer: 3000,
    showConfirmButton: false,
    heightAuto: false,
  });
}

  formatExpiry(input: HTMLInputElement) {
  let value = input.value.replace(/\D/g, ''); 
  
  if (value.length >= 2) {
    let month = parseInt(value.substring(0, 2));
    if (month > 12) value = '12' + value.substring(2);
    if (month === 0) value = '01' + value.substring(2);
  }

  if (value.length > 2) {
    let monthPart = value.substring(0, 2);
    let yearPart = value.substring(2, 6);
    input.value = monthPart + ' / ' + yearPart;
  } else {
    input.value = value;
  }
}


}