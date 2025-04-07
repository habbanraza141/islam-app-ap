import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BookService } from '../../shared/services/book.service';
import { CategoryService } from '../../shared/services/category.service';

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
  selectedSubCategory: string | null = null;
  bookList: any[] = [];
  constructor(
    private bookService: BookService,
    private categoryService: CategoryService
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

  ngOnInit() {
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
    this.bookService.addBook(bookData).subscribe({
      next: () => {
        this.bookList.push(bookData); // Optionally update the UI after successful submission
        this.resetForm();
      },
      error: (err) => console.error('Error submitting category:', err),
    });
  }

  editBook(index: number) {}

  deleteBook(index: number) {
    const bookToDelete = this.bookList[index];
  
    if (!bookToDelete.docId) {
      console.error('No Firestore document ID found for this book.');
      return;
    }
  
    if (
      !confirm(`Are you sure you want to delete "${bookToDelete.book}"?`)
    ) {
      return;
    }
  
    this.bookService.deleteBook(bookToDelete.docId).subscribe({
      next: () => {
        this.bookList.splice(index, 1);
        console.log(
          `Book "${bookToDelete.book}" deleted successfully.`
        );
      },
      error: (err) => console.error('Error deleting Book:', err),
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
