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
  private userId: number = 2;
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
      this.cartData = res.data || res;

      if (this.cartData.items) {
        this.cartData.items = this.cartData.items.map((item: any) => {
          // ბექენდიდან მოგდის item.discountPrice
          // თუ ის 0-ზე მეტია, ესე იგი ფასდაკლებაა
          return item;
        });
      }
      this.isLoading = false;
    },
    error: (err) => {
      console.error(err);
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

  // 1. ვიპოვოთ წასაშლელი ნივთის ინდექსი მასივში
  const index = this.cartData.items.findIndex((item: any) => item.id === itemId);
  
  if (index !== -1) {
    // 2. დროებით შევინახოთ წასაშლელი ნივთი (თუ API-მ დააღორა, რომ დავაბრუნოთ)
    const removedItem = this.cartData.items[index];

    // 3. ოპტიმისტურად ამოვშალოთ სიიდან მაშინვე
    this.cartData.items.splice(index, 1);

    // 4. API-ს გამოძახება ფონზე
    this.apiService.removeItem(itemId).subscribe({
      next: () => {
        console.log('ნივთი წარმატებით წაიშალა');
        // აუცილებლად განვაახლოთ ნავბარი, რადგან ნივთი აკლდება კალათას
        this.apiService.getCart(this.userId).subscribe();
      },
      error: (err) => {
        console.error('წაშლის შეცდომა:', err);
        // თუ ბექენდმა ერორი ამოაგდო, ნივთს ვაბრუნებთ სიაში
        this.cartData.items.splice(index, 0, removedItem);
        alert("ნივთი ვერ წაიშალა, სცადეთ მოგვიანებით");
      }
    });
  }
}

  // მხოლოდ ერთი clearCart, პრემიუმ დიზაინით
  clearCart(): void {
    (Swal as any).fire({
      title: 'დარწმუნებული ხართ?',
      text: "კალათა სრულად გასუფთავდება!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2ECC71',
      cancelButtonColor: '#f8f9fa', // ნაცრისფერი რომ დიზაინში ჩაჯდეს
      cancelButtonText: '<span style="color: #495057">გაუქმება</span>',
      confirmButtonText: 'დიახ, დაცლა',
      reverseButtons: true,
      borderRadius: '16px',
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
              borderRadius: '16px',
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
    // თუ discountPrice არსებობს და 0-ზე მეტია, ვიყენებთ მას
    const currentPrice = (item.discountPrice && item.discountPrice > 0) 
                         ? item.discountPrice 
                         : item.price;
    return acc + (currentPrice * item.quantity);
  }, 0);
}



// 1. ნაბიჯი: როცა აჭერ "გადახდას" კალათაში
  processCheckout(): void {
    if (!this.cartData || this.cartData.items.length === 0) {
      alert("კალათა ცარიელია!");
      return;
    }

    this.isLoading = true;

    const orderPayload = {
      basketId: this.userId.toString(), 
      shippingAddress: "Tbilisi, Georgia",
      paymentMethod: "Card"
    };

    console.log('ვქმნი ორდერს...', orderPayload);

    this.apiService.createOrder(orderPayload).subscribe({
      next: (res: any) => {
        console.log('ორდერი შეიქმნა:', res);
        // ვინახავთ ID-ს, რომელიც ბექენდმა დააბრუნა
        if (res.data && res.data.id) {
          this.currentOrderId = res.data.id;
        }
        this.isLoading = false;
        this.showPaymentModal = true; // ვაჩვენებთ ბარათის შესაყვან ფანჯარას
      },
      error: (err) => {
        console.error('შეკვეთის შექმნის შეცდომა:', err);
        this.isLoading = false;
        // იმ შემთხვევაშიც თუ ბექენდმა დააღორა, ტესტისთვის მაინც ვაჩვენებთ მოდალს
        this.showPaymentModal = true; 
      }
    });
  }

  // 2. ნაბიჯი: როცა ბარათის ფანჯარაში აჭერ "Pay Now"
  confirmPayment(): void {
  this.isLoading = true;

  // 1. ჯერ სტატუსს ვცვლით
  this.apiService.updateOrderStatus(this.currentOrderId, "PAID").subscribe({
    next: () => {
      // 2. მერე ბაზაში ვშლით კალათას
      this.apiService.clearCart(this.userId).subscribe({
        next: () => {
          // 3. აი აქ ხდება მთავარი ამბავი - ვიზუალური გასუფთავება:
          this.cartData = { items: [], totalPrice: 0 }; // ეკრანიდან ვაქრობთ ნივთებს
          this.isLoading = false;
          this.showPaymentModal = false;
          this.finishProcess();

          // 4. შეტყობინება
          Swal.fire({
            icon: 'success',
            title: 'გადახდა წარმატებულია!',
            text: 'კალათა გასუფთავდა.',
            timer: 2000,
            confirmButtonColor: '#2ECC71',
          });
        },
        error: (err) => {
          console.error("ბაზაში კალათა ვერ წაიშალა", err);
          this.isLoading = false;
        }
      });
    },
    error: (err) => {
      console.error("სტატუსის განახლების შეცდომა", err);
      this.isLoading = false;
    }
  });
}

  // 3. ნაბიჯი: პროცესის დასრულება და UI-ს გასუფთავება
private finishProcess(): void {
  this.isLoading = false;
  this.showPaymentModal = false;
  this.cartData = { items: [], totalPrice: 0 };

  // აი ეს ხაზი გაანულებს ციფრს Navbar-ში!
  this.apiService.updateCartCount(0);

    Swal.fire({
      icon: 'success',
      title: 'გადახდა წარმატებულია!',
      text: 'თქვენი შეკვეთა გაფორმდა და კალათა გასუფთავდა.',
      timer: 3000,
      showConfirmButton: false,
      heightAuto: false
    });
  }


  formatExpiry(input: HTMLInputElement) {
  // 1. მხოლოდ ციფრებს ვიღებთ
  let value = input.value.replace(/\D/g, ''); 
  
  // 2. თვის ვალიდაცია
  if (value.length >= 2) {
    let month = parseInt(value.substring(0, 2));
    if (month > 12) value = '12' + value.substring(2);
    if (month === 0) value = '01' + value.substring(2);
  }

  // 3. ფორმატირება
  if (value.length > 2) {
    // მაქსიმუმ 6 ციფრი (2 თვის + 4 წლის)
    let monthPart = value.substring(0, 2);
    let yearPart = value.substring(2, 6);
    input.value = monthPart + ' / ' + yearPart;
  } else {
    input.value = value;
  }
}





}