import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CarouselService } from '../../shared/services/carousel.service';

interface Carousel {
  id: number;
  image: string;
}
@Component({
  selector: 'app-carousel-images',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carousel-images.component.html',
  styleUrl: './carousel-images.component.css',
})
export class CarouselImagesComponent implements OnInit {
  constructor(private carouselService: CarouselService) {}

  carouselContainer: any[] = [];
  editIndex: number | null = null;
  carousel: Carousel = {
    
    id: 0,
    image: '',
  };

  ngOnInit() {
    this.carouselService.getCarousels().subscribe({
      next: (data) => {
        this.carouselContainer = data;
        console.log('carousel fetched:', this.carouselContainer);
      },
      error: (err) => console.error('Error fetching carousel:', err),
    });
  }

  submitForm() {
    // const carouselData = { ...this.carousel };
    // console.log(carouselData);
    // this.carouselService.addCarousel(carouselData).subscribe({
    //   next: () => {
    //     this.carouselContainer.push(carouselData); // Optionally update the UI after successful submission
    //     this.resetForm();
    //   },
    //   error: (err) => console.error('Error submitting category:', err),
    // });
  }

  editCarousel(index: number) {}

  deleteCarousel(index: number) {}

  resetForm() {
    this.carousel = {
      id: 0,
      image: ''
    };
  }
}
