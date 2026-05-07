import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/Navbar/navbar.component';
import { CategoryMenuComponent } from './components/Category-menu/category-menu.component';
import { FilterComponent } from './components/Filter/filter.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    NavbarComponent, 
    CategoryMenuComponent, 
    FilterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ShopNet-Frontend';

  // @ViewChild-ით ჩვენ პირდაპირ წვდომას ვიღებთ FilterComponent-ის მეთოდებზე
  @ViewChild('filterSection') filterComponent!: FilterComponent;

  // ეს ფუნქცია გამოიძახება, როცა კატეგორიას დააჭერ
  onCategoryChange(categoryId: number) {
    console.log('App-მა მიიღო ID:', categoryId);
    
    // თუ ფილტრის კომპონენტი არსებობს, გადავცეთ მას ID
    if (this.filterComponent) {
      this.filterComponent.selectCategory(categoryId);
    }
  }
}