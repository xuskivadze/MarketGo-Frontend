import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/Navbar/navbar.component';
import { CategoryMenuComponent } from './components/Category-menu/category-menu.component';
import { FilterComponent } from './components/Filter/filter.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    NavbarComponent, 
    CategoryMenuComponent, 
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ShopNet-Frontend';

  @ViewChild('filterSection') filterComponent!: FilterComponent;

  onCategoryChange(categoryId: number) {
    console.log('App-მა მიიღო ID:', categoryId);
    
    if (this.filterComponent) {
      this.filterComponent.selectCategory(categoryId);
    }
  }
}