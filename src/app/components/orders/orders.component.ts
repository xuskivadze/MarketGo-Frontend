import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  loading: boolean = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

 loadOrders(): void {

  const userId = Number(localStorage.getItem('userId')) || 1;

  this.apiService.getOrdersByUserId(userId).subscribe({
    next: (res: any) => {
      console.log('Orders received:', res);
      
      if (res && res.isSuccess) {
        this.orders = res.data || [];
        
      } else {
        this.orders = Array.isArray(res) ? res : [];
      }
      
      this.loading = false;
    },
    error: (err) => {
      console.error('Error fetching orders:', err);
      this.loading = false;
      this.orders = [];
    }
  });
}

  getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'PAID': return 'status-paid';
      case 'PENDING': return 'status-pending';
      case 'SHIPPED': return 'status-shipped';
      default: return 'status-default';
    }
  }
}