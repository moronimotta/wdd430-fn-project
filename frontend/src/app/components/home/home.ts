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
    { title: 'Best price in town!', copy: 'We guarantee the lowest prices on all your textbooks.' }
  ];
}
