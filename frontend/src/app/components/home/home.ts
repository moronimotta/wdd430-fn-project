import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  highlights = [
    { title: 'Fast delivery', copy: 'Textbooks packed and ready for the semester.' },
    { title: 'Simple checkout', copy: 'Essential order data only, with Stripe handling payments.' },
    { title: 'Admin visibility', copy: 'Review inventory and recent orders from one screen.' }
  ];
}
