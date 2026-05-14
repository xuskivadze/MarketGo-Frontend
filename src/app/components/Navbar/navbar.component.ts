import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit { 
   isMenuCollapsed = true;
   cartItemCount: number = 0;
   isMenuOpen = false;
   isLoggedIn: boolean = false;


constructor(public apiService: ApiService, public router: Router) {}

  toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
  ngOnInit() {

  const currentUserId = Number(localStorage.getItem('userId')) || 1;
  
  this.apiService.getCart(currentUserId).subscribe()
  this.apiService.resetSearchTrigger$.subscribe(() => {
    const searchInput = document.getElementById('navbarSearch') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
  });
  this.apiService.authStatus$.subscribe(status => {
    this.isLoggedIn = status;
  });

  this.apiService.cartCount$.subscribe(count => {
      this.cartItemCount = count;
    });
}

logout() {
  this.apiService.logout();
  this.apiService.checkAuthStatus();
}

scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onEnterSearch() {
  this.scrollToProducts();
}

onSearch(event: any) {
  const searchTerm = event.target.value;
  this.apiService.triggerSearch(searchTerm); 
}

scrollToProducts() {
  if (this.router.url !== '/filter' && this.router.url !== '/') {
    this.router.navigate(['/filter'], { fragment: 'products-section' });
  } else {
    this.apiService.triggerScroll();
  }
  this.isMenuCollapsed = true;
}

showSales() {
  if (this.router.url !== '/filter' && this.router.url !== '/') {
    this.router.navigate(['/filter'], { queryParams: { sales: true }, fragment: 'products-section' });
  } else {
    this.apiService.triggerSales();
  }
  this.isMenuCollapsed = true;
}

}

