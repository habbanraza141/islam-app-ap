import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BookService } from '../../shared/services/book.service';
import { CategoryService } from '../../shared/services/category.service';
import { AuthorService } from '../../shared/services/author.service';
import { LoadingService } from '../../shared/services/loading.service';
import Swal from 'sweetalert2';
import * as mammoth from 'mammoth';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
} from '@angular/fire/storage';

interface Book {
  id: number;
  bookTitle: string;
  bookWriter: string;
  docSharedLink: string;
  aboutBook: string;
  bookContent: string;
  categories: string[];
  mainCategory: string;
  language: string;
  image: string;
  docId?: string;
  isPopular?: boolean;
  isFeatured?: boolean;
  isLatest?: boolean;
  isPoetry?: boolean;
}

@Component({
  selector: 'app-book-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-admin.component.html',
  styleUrls: ['./book-admin.component.css'],
})
export class BookAdminComponent implements OnInit {
  categories: any[] = [];
  subCategories: any[] = [];
  selectedCategoryId: number | null = null;
  selectedAuthorId: number | null = null;
  selectedSubCategory: string | null = null;
  bookList: any[] = [];
  authors: any[] = [];
  docContent: string = '';
  selectedFile: File | null = null;
  isLoading: boolean = false;
  @ViewChild('imageInput') imageInputRef!: ElementRef<HTMLInputElement>;

  constructor(
    private bookService: BookService,
    private categoryService: CategoryService,
    private authorService: AuthorService,
    private storage: Storage,
    private loadingService: LoadingService
  ) {}
  editIndex: number | null = null;

  book: Book = {
    id: 0,
    bookTitle: '',
    bookWriter: '',
    language: '',
    bookContent: '',
    image: '',
    aboutBook: '',
    docSharedLink: '',
    mainCategory: '',
    isPopular: false,
    isFeatured: false,
    isLatest: false,
    isPoetry: false,

    categories: [] as string[],
  };

  handleFileUpload(event: any) {
    const file = event.target.files[0];

    if (file && file.name.endsWith('.docx')) {
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const arrayBuffer = e.target.result;

        try {
          const result = await mammoth.convertToHtml({ arrayBuffer });
          let html = result.value;
          html = html.replace(/<p>(.*?)<br\s*\/?><\/p>/g, '<p>$1</p><br />');
          html = html.replace(/<p>\s*<\/p>/g, '<br />');
          this.book.bookContent = html; 
          console.log('Converted HTML:', html);
        } catch (error) {
          console.error('Error converting docx:', error);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Only .docx files are supported.');
    }
  }

  ngOnInit() {
    // Show loader for Firestore calls (these are not intercepted by HttpClient)
    this.loadingService.show();
    this.authorService.getAuthors().pipe().subscribe({
      next: (data) => {
        this.authors = data;
        console.log('Authors fetched:', this.authors);
        this.loadingService.hide();
      },
      error: (err) => {
        console.error('Error fetching Authors:', err);
        this.loadingService.hide();
      },
    });

    this.loadingService.show();
    this.categoryService.getCategories().subscribe((categories) => {
      this.categories = categories;
      this.loadingService.hide();
    }, (err) => {
      console.error('Error fetching categories:', err);
      this.loadingService.hide();
    });

    this.loadingService.show();
    this.bookService.getBooks().subscribe({
      next: (data) => {
        this.bookList = data;
        console.log('Books fetched:', this.bookList);
        this.loadingService.hide();
      },
      error: (err) => {
        console.error('Error fetching books:', err);
        this.loadingService.hide();
      },
    });
  }

  onCategoryChange() {
    const selectedCategory = this.categories.find(
      (cat) => cat.id == this.selectedCategoryId
    );
    this.subCategories = selectedCategory ? selectedCategory.subCategories : [];
    this.book.mainCategory = selectedCategory ? selectedCategory.category : '';
  }

  onAuthorChange() {
    const selectedAuthor = this.authors.find(
      (auth) => auth.id == this.selectedAuthorId
    );
    this.book.bookWriter = selectedAuthor ? selectedAuthor.bookWriter : '';
  }

  toggleSubcategory(subKey: any) {
    if (this.book.categories.includes(subKey)) {
      this.book.categories = this.book.categories.filter((s) => s !== subKey);
    } else {
      this.book.categories.push(subKey);
    }
  }

  async submitForm() {
    const bookData = { ...this.book };

    if (
      !bookData.bookTitle ||
      !bookData.bookContent ||
      !bookData.mainCategory ||
      !bookData.bookWriter
    ) {
      alert('Please fill all required fields.');
      return;
    }

    try {
      this.isLoading = true;

      // Handle image upload for new file or preserve existing image
      if (this.selectedFile) {
        // New file selected - upload it
        const filePath = `book_images/${Date.now()}_${this.selectedFile.name}`;
        const storageRef = ref(this.storage, filePath);
        const uploadResult = await uploadBytes(storageRef, this.selectedFile);
        const downloadURL = await getDownloadURL(uploadResult.ref);
        bookData.image = downloadURL;
      } else if (this.editIndex !== null && !this.selectedFile) {
        // Updating without new file - preserve existing image URL
        const existingBook = this.bookList[this.editIndex];
        if (existingBook.image && existingBook.image.startsWith('http')) {
          // Keep the existing Firebase Storage URL
          bookData.image = existingBook.image;
        }
        // If image is a data URL (base64), it means user selected but didn't upload yet
        // In that case, we should keep the existing image from the database
      }

      if (this.editIndex !== null) {
        const docId = this.bookList[this.editIndex].docId;
        if (!docId) {
          console.error('Missing docId for update');
          this.isLoading = false;
          return;
        }

        Swal.fire({
          title: 'Are you sure?',
          text: `Do you want to update "${bookData.bookTitle}"?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, update it!',
          cancelButtonText: 'Cancel',
        }).then((result) => {
          if (result.isConfirmed) {
            this.bookService.updateBook(docId, bookData).subscribe({
              next: () => {
                // Refresh the book list to get updated data
                this.bookService.getBooks().subscribe((books) => {
                  this.bookList = books;
                  Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: `"${bookData.bookTitle}" was updated successfully.`,
                    confirmButtonText: 'OK',
                  });
                  this.resetForm();
                  this.editIndex = null;
                  this.isLoading = false;
                });
              },
              error: (err) => {
                console.error('Error updating book:', err);
                this.isLoading = false;
              },
            });
          } else {
            this.isLoading = false;
          }
        });
      } else {
        const maxId = this.bookList.length
          ? Math.max(...this.bookList.map((b) => b.id || 0))
          : 0;
        bookData.id = maxId + 1;

        this.bookService.addBook(bookData).subscribe({
          next: () => {
            this.bookService.getBooks().subscribe((books) => {
              this.bookList = books;
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'The book was added successfully.',
                confirmButtonText: 'OK',
              });
              this.resetForm();
              this.isLoading = false;
            });
          },
          error: (err) => {
            console.error('Error submitting book:', err);
            this.isLoading = false;
          },
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      this.isLoading = false;
    }
  }

  editBook(index: number) {
    this.editIndex = index;
    const bookToEdit = this.bookList[index];
    this.book = { ...bookToEdit };
    // Reset selected file when editing
    this.selectedFile = null;
    
    const category = this.categories.find(
      (cat) => cat.category === bookToEdit.mainCategory
    );
    if (category) {
      this.selectedCategoryId = category.id;
      this.subCategories = category.subCategories;
    } else {
      this.selectedCategoryId = null;
      this.subCategories = [];
    }

    const author = this.authors.find(
      (auth) => auth.bookWriter === bookToEdit.bookWriter
    );
    if (author) {
      this.selectedAuthorId = author.id;
    } else {
      this.selectedAuthorId = null;
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      this.selectedFile = file; // Store the file for upload
      const reader = new FileReader();
      reader.onload = () => {
        this.book.image = reader.result as string; // Preview the image
      };
      reader.readAsDataURL(file);
    }
  }

  deleteBook(index: number) {
    const bookToDelete = this.bookList[index];

    if (!bookToDelete.docId) {
      console.error('No Firestore document ID found for this book.');
      return;
    }

    Swal.fire({
      title: `Are you sure you want to delete "${bookToDelete.bookTitle}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookService.deleteBook(bookToDelete.docId).subscribe({
          next: () => {
            this.bookList.splice(index, 1);
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: `Book "${bookToDelete.bookTitle}" was deleted successfully.`,
              timer: 1000,
              showConfirmButton: false,
            });
          },
          error: (err) => {
            console.error('Error deleting Book:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'There was a problem deleting the book. Please try again later.',
            });
          },
        });
      }
    });
  }

  resetForm() {
    this.book = {
      id: 0,
      bookTitle: '',
      bookWriter: '',
      bookContent: '',
      image: '',
      language: '',
      aboutBook: '',
      docSharedLink: '',
      mainCategory: '',
      categories: [],
      isPopular: false,
      isFeatured: false,
      isLatest: false,
      isPoetry: false,
    };
    this.selectedFile = null;
    this.selectedCategoryId = null;
    this.selectedAuthorId = null;
    this.selectedSubCategory = null;
    this.subCategories = [];
    this.editIndex = null;
    // Reset file input
    if (this.imageInputRef) {
      this.imageInputRef.nativeElement.value = '';
    }
  }
}
