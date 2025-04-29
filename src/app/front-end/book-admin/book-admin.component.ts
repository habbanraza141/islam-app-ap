import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BookService } from '../../shared/services/book.service';
import { CategoryService } from '../../shared/services/category.service';
import { AuthorService } from '../../shared/services/author.service';
import Swal from 'sweetalert2'; // Import SweetAlert2
import * as mammoth from 'mammoth';

interface Book {
  id: number;
  bookTitle: string;
  bookWriter: string;
  aboutBook: string;
  bookContent: string;
  categories: string[];
  mainCategory: string;
  language: string;
  image: string;
  docId?: string; 
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

  constructor(
    private bookService: BookService,
    private categoryService: CategoryService,
    private authorService: AuthorService
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
    mainCategory: '',
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
          this.book.bookContent = result.value; // HTML content
          console.log("Converted HTML:", result.value);
        } catch (error) {
          console.error("Error converting docx:", error);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Only .docx files are supported.");
    }
  }

  ngOnInit() {
    this.authorService.getAuthors().subscribe({
      next: (data) => {
        this.authors = data;
        console.log('Authors fetched:', this.authors);
      },
      error: (err) => console.error('Error fetching Authors:', err),
    });
    this.categoryService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });
    this.bookService.getBooks().subscribe({
      next: (data) => {
        this.bookList = data;
        console.log('Books fetched:', this.bookList);
      },
      error: (err) => console.error('Error fetching books:', err),
    });
    // this.bookService.testFirestore();
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

  submitForm() {
    const bookData = { ...this.book };
    console.log(bookData);
    if (this.editIndex !== null) {
      // 🔁 EDIT MODE
      const docId = this.bookList[this.editIndex].docId;
      if (!docId) {
        console.error('Missing docId for update');
        return;
      }
  
      // this.bookService.updateBook(docId, bookData).subscribe({
      //   next: () => {
      //     this.bookList[this.editIndex!] = { ...bookData, docId };
      //     this.resetForm();
      //     this.editIndex = null;
      //   },
      //   error: (err) => console.error('Error updating book:', err),
      // });

      Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to update "${bookData.bookTitle}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, update it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.bookService.updateBook(docId, bookData).subscribe({
            next: () => {
              this.bookList[this.editIndex!] = { ...bookData, docId };
              Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: `"${bookData.bookTitle}" was updated successfully.`,
                confirmButtonText: 'OK',
              });
              this.resetForm();
              this.editIndex = null;
            },
            error: (err) => console.error('Error updating book:', err),
          });
        }
      });
    } else {

       const maxId = this.bookList.length
       ? Math.max(...this.bookList.map((b) => b.id || 0))
       : 0;
     bookData.id = maxId + 1;
 
     this.bookService.addBook(bookData).subscribe({
       next: () => {
         // Fetch books again OR simulate it manually with push + docId
         this.bookService.getBooks().subscribe((books) => {
           this.bookList = books;
           Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'The book was added successfully.',
            confirmButtonText: 'OK',
          });
           this.resetForm();
         });
       },
       error: (err) => console.error('Error submitting book:', err),
     });
   }
  //   this.bookService.addBook(bookData).subscribe({
  //     next: () => {
  //       this.bookList.push(bookData); // Optionally update the UI after successful submission
  //       this.resetForm();
  //     },
  //     error: (err) => console.error('Error submitting category:', err),
  //   });
  // }
  }

  editBook(index: number) {
    this.editIndex = index;
    const bookToEdit = this.bookList[index];
    this.book = { ...bookToEdit };
  
    // Populate selectedCategoryId and selectedAuthorId if needed
    const category = this.categories.find(cat => cat.category === bookToEdit.mainCategory);
    if (category) {
      this.selectedCategoryId = category.id;
      this.subCategories = category.subCategories;
    }
  
    const author = this.authors.find(auth => auth.bookWriter === bookToEdit.bookWriter);
    if (author) {
      this.selectedAuthorId = author.id;
    }
  }
  
  // deleteBook(index: number) {
  //   const bookToDelete = this.bookList[index];
  
  //   if (!bookToDelete.docId) {
  //     console.error('No Firestore document ID found for this book.');
  //     return;
  //   }
  
  //   if (
  //     !confirm(`Are you sure you want to delete "${bookToDelete.book}"?`)
  //   ) {
  //     return;
  //   }
  
  //   this.bookService.deleteBook(bookToDelete.docId).subscribe({
  //     next: () => {
  //       this.bookList.splice(index, 1);
  //       console.log(
  //         `Book "${bookToDelete.book}" deleted successfully.`
  //       );
  //     },
  //     error: (err) => console.error('Error deleting Book:', err),
  //   });
  // }


deleteBook(index: number) {
  const bookToDelete = this.bookList[index];

  if (!bookToDelete.docId) {
    console.error('No Firestore document ID found for this book.');
    return;
  }

  Swal.fire({
    title: `Are you sure you want to delete "${bookToDelete.bookTitle}"?`,
    // text: 'This action cannot be undone!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
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
            showConfirmButton: false
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
      mainCategory: '',
      categories: [],
    };
  }
}
