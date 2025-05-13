import { Component, OnInit } from '@angular/core';
import { AdService } from '../../shared/services/ad.service';
import {
  getDownloadURL,
  ref,
  Storage,
  uploadBytes,
} from '@angular/fire/storage';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

interface Advertisement {
  id: number;
  image: string;
}
@Component({
  selector: 'app-advertisement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './advertisement.component.html',
  styleUrl: './advertisement.component.css',
})
export class AdvertisementComponent implements OnInit {
  constructor(private adService: AdService, private storage: Storage) {}

  selectedFile: File | null = null;
  adContainer: any[] = [];
  editIndex: number | null = null;
  advertisement: Advertisement = {
    id: 0,
    image: '',
  };

  ngOnInit() {
    this.adService.getAds().subscribe({
      next: (data) => {
        this.adContainer = data;
        console.log('ad fetched:', this.adContainer);
      },
      error: (err) => console.error('Error fetching ad:', err),
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
      const filePath = `ad_images/${Date.now()}_${this.selectedFile.name}`;
      const storageRef = ref(this.storage, filePath);
      const uploadResult = await uploadBytes(storageRef, this.selectedFile);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      const newAd: Advertisement = {
        id: Date.now(),
        image: downloadURL,
      };

      this.adService.addAd(newAd).subscribe({
        next: () => {
          this.adContainer.push(newAd);
          this.resetForm();
          Swal.fire({
            icon: 'success',
            title: 'Submitted!',
            text: 'Your advertisement has been added.',
          });
  
        },
        error: (err) => {
          console.error('Error submitting ad:', err)
          Swal.fire({
            icon: 'error',
            title: 'Submission Failed',
            text: 'There was an error saving the ad.',
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

  editAd(index: number) {}

  deleteAd(index: number) {
      const imageToDelete = this.adContainer[index];
    
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
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.adService.deleteAd(imageToDelete.docId).subscribe({
            next: () => {
              this.adContainer.splice(index, 1);
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: `Image was deleted successfully.`,
                timer: 1000,
                showConfirmButton: false
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
    this.advertisement = {
      id: 0,
      image: '',
    };
  }
}
