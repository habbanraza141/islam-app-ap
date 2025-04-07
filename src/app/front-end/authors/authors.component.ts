import { Component, OnInit } from '@angular/core';
import { AuthorService } from '../../shared/services/author.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


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
        console.log('Books fetched:', this.authors);
      },
      error: (err) => console.error('Error fetching books:', err),
    });
  }

  submitForm() {
    const authorData = { ...this.author };
    console.log(authorData);
    this.authorService.addAuthor(authorData).subscribe({
      next: () => {
        this.authors.push(authorData); // Optionally update the UI after successful submission
        this.resetForm();
      },
      error: (err) => console.error('Error submitting category:', err),
    });
  }
  editAuthor(index: number) {}

  deleteAuthor(index: number) {}

  resetForm() {
    this.author = {
      id: 0,
      bookWriter: ''
    };
  }
}
