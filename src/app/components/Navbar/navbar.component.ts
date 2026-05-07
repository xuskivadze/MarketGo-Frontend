import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service'; // <-- დაამატეთ იმპორტი (გზა გადაამოწმეთ)
import { RouterModule } from '@angular/router'; // <-- routerLink-ისთვის

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit { 
   isMenuCollapsed = true; // თავიდან მენიუ დაკეტილია

constructor(public apiService: ApiService) {}
  toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  // navbar.component.ts
ngOnInit() {
  this.apiService.getCart(2).subscribe();
  this.apiService.resetSearchTrigger$.subscribe(() => {
    const searchInput = document.getElementById('navbarSearch') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = ''; // ნავბარში ტექსტის წაშლა
    }
  });
}



scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}



showSales() {
  this.scrollToProducts(); // ჩამოსქროლვა
  this.apiService.triggerSalesFilter(); // სიგნალის გაშვება
}

// navbar.component.ts

onEnterSearch() {
  // ვიძახებთ ჩამოსქროლვის ფუნქციას, რომელიც უკვე გაწერილი გაქვთ
  this.scrollToProducts();
}

onSearch(event: any) {
  const searchTerm = event.target.value;
  this.apiService.triggerSearch(searchTerm); 
}

scrollToProducts() {
  const element = document.getElementById('products-section');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

}

