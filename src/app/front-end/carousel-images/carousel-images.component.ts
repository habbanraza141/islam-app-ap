import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CarouselService } from '../../shared/services/carousel.service';
import {
  getDownloadURL,
  ref,
  Storage,
  uploadBytes,
} from '@angular/fire/storage';
import Swal from 'sweetalert2';

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
  constructor(
    private carouselService: CarouselService,
    private storage: Storage
  ) {}
  selectedFile: File | null = null;
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

  async submitForm() {
    if (!this.selectedFile) {
      Swal.fire({
        icon: 'warning',
        title: 'No Image Selected',
        text: 'Please select an image before submitting.',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to submit this advertisement?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, submit it!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const filePath = `carousel_images/${Date.now()}_${
        this.selectedFile.name
      }`;
      const storageRef = ref(this.storage, filePath);
      const uploadResult = await uploadBytes(storageRef, this.selectedFile);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      const newCarousel: Carousel = {
        id: Date.now(), 
        image: downloadURL,
      };

      this.carouselService.addCarousel(newCarousel).subscribe({
        next: () => {
          this.carouselContainer.push(newCarousel);
          this.resetForm();
          Swal.fire({
            icon: 'success',
            title: 'Submitted!',
            text: 'Your carousel has been added.',
          });
        },
        error: (err) => {
          console.error('Error submitting carousel:', err);
          Swal.fire({
            icon: 'error',
            title: 'Submission Failed',
            text: 'There was an error saving the carousel.',
          });
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Something went wrong while uploading the image.',
      });
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  editCarousel(index: number) {
    this.editIndex = index;
    const carouselToEdit = this.carouselContainer[index];
    this.carousel = { ...carouselToEdit };
  }

  deleteCarousel(index: number) {
    const imageToDelete = this.carouselContainer[index];

    if (!imageToDelete.docId) {
      console.error('No Firestore document ID found for this image.');
      return;
    }

    Swal.fire({
      title: `Are you sure you want to delete this image"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.carouselService.deleteCarousel(imageToDelete.docId).subscribe({
          next: () => {
            this.carouselContainer.splice(index, 1);
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: `Image was deleted successfully.`,
              timer: 1000,
              showConfirmButton: false,
            });
          },
          error: (err) => {
            console.error('Error deleting image:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'There was a problem deleting the image. Please try again later.',
            });
          },
        });
      }
    });
  }

  resetForm() {
    this.carousel = {
      id: 0,
      image: '',
    };
  }
}
