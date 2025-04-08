import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BookService } from '../../shared/services/book.service';
import { CategoryService } from '../../shared/services/category.service';
import { AuthorService } from '../../shared/services/author.service';

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
  
      this.bookService.updateBook(docId, bookData).subscribe({
        next: () => {
          this.bookList[this.editIndex!] = { ...bookData, docId };
          this.resetForm();
          this.editIndex = null;
        },
        error: (err) => console.error('Error updating book:', err),
      });
    } else {
    this.bookService.addBook(bookData).subscribe({
      next: () => {
        this.bookList.push(bookData); // Optionally update the UI after successful submission
        this.resetForm();
      },
      error: (err) => console.error('Error submitting category:', err),
    });
  }
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
