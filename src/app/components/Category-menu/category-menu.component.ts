import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-category-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-menu.component.html',
  styleUrls: ['./category-menu.component.css']
})
export class CategoryMenuComponent {
  @Output() categoryChanged = new EventEmitter<number>();

  categories = [
    { id: 1, name: 'Smartphones', icon: 'bi-phone' },
    { id: 2, name: 'Laptops', icon: 'bi-laptop' },
    { id: 3, name: 'TVs', icon: 'bi-tv' },
    { id: 4, name: 'Chargers', icon: 'bi-lightning-charge' },
    { id: 5, name: 'Watches', icon: 'bi-watch' },
    { id: 6, name: 'Car Accessories', icon: 'bi-car-front' },
    { id: 7, name: 'Audio System', icon: 'bi-speaker' }
  ];

  constructor(private apiService: ApiService, private router: Router) {}

  selectCategory(id: number) {
    console.log('არჩეული კატეგორია ID:', id);
    
    this.categoryChanged.emit(id);

    if (this.router.url !== '/filter' && this.router.url !== '/') {
      this.router.navigate(['/filter'], { fragment: 'products-section' });
    } else {
      this.apiService.triggerCategoryScroll(id);
    }
  }

}