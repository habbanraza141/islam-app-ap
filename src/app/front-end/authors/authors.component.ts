import { Component, OnInit } from '@angular/core';
import { AuthorService } from '../../shared/services/author.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Author {
  id: number;
  bookWriter: string;
}

@Component({
  selector: 'app-authors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './authors.component.html',
  styleUrl: './authors.component.css',
})
export class AuthorsComponent implements OnInit {
  constructor(private authorService: AuthorService) {}
  authors: any[] = [];
  editIndex: number | null = null;
  author: Author = {
    id: 0,
    bookWriter: '',
  };
  ngOnInit() {
    this.authorService.getAuthors().subscribe({
      next: (data) => {
        this.authors = data;
        console.log('Authors fetched:', this.authors);
      },
      error: (err) => console.error('Error fetching Authors:', err),
    });
  }

  async submitForm() {
    if (this.editIndex !== null) {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to update this author?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, update it!',
        cancelButtonText: 'Cancel',
      });

      if (!result.isConfirmed) {
        return;
      }
      const docId = this.authors[this.editIndex].docId;
      if (!docId) {
        console.error('Missing docId for update');
        return;
      }
      const authorData = { ...this.author };
      console.log(authorData);
      this.authorService.updateAuthor(docId, authorData).subscribe({
        next: () => {
          this.authors[this.editIndex!] = { ...authorData, docId };
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'The author was updated successfully.',
            confirmButtonText: 'OK',
          });
          this.resetForm();
        },
        error: (err) => console.error('Error submitting category:', err),
      });
    } else {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to add this author?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, add it!',
        cancelButtonText: 'Cancel',
      });

      if (!result.isConfirmed) {
        return;
      }
      const authorData = { ...this.author };
      console.log(authorData);
      this.authorService.addAuthor(authorData).subscribe({
        next: () => {
          this.authors.push(authorData);
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'The author was added successfully.',
            confirmButtonText: 'OK',
          });
          this.resetForm();
        },
        error: (err) => console.error('Error submitting category:', err),
      });
    }
  }

  editAuthor(index: number) {
    this.editIndex = index;
    const authorToEdit = this.authors[index];
    this.author = { ...authorToEdit };
  }

  deleteAuthor(index: number) {
    const authorToDelete = this.authors[index];

    if (!authorToDelete.docId) {
      console.error('No Firestore document ID found for this author.');
      return;
    }

    Swal.fire({
      title: `Are you sure you want to delete this author"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.authorService.deleteAuthor(authorToDelete.docId).subscribe({
          next: () => {
            this.authors.splice(index, 1);
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: `Author was deleted successfully.`,
              timer: 1000,
              showConfirmButton: false,
            });
          },
          error: (err) => {
            console.error('Error deleting author:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'There was a problem deleting the author. Please try again later.',
            });
          },
        });
      }
    });
  }

  resetForm() {
    this.author = {
      id: 0,
      bookWriter: '',
    };
  }
}
