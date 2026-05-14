import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  showScrollBtn = false;
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showScrollBtn = window.scrollY > 400;
  }
 
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  scrollToProducts() {
    const element = document.querySelector('app-filter');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      this.scrollToTop();
    }
  }

  scrollToCategories() {
    const element = document.querySelector('app-category-menu');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}