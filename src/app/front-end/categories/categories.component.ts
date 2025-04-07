import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../shared/services/category.service';
import { FormsModule } from '@angular/forms';

interface SubCategory {
  id: number;
  key: string;
  title: string;
}
interface Category {
  id: number;
  docId?: string;
  category: string;
  subCategories: SubCategory[];
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesComponent {
  editIndex: number | null = null;
  categoryList: Category[] = [];
  newCategory: Category = {
    id: 0,
    category: '',
    subCategories: [{ id: 0, key: '', title: '' }],
  };
  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categoryList = data;
        console.log('Category List fetched:', this.categoryList);
      },
      error: (err) => console.error('Error fetching categories:', err),
    });
  }

  addSubCategory() {
    const newId = this.newCategory.subCategories.length ; // Assign a numeric ID
    const newSubCategory: SubCategory = { id: newId, key: '', title: '' };
    this.newCategory.subCategories.push(newSubCategory);
  }

  removeSubCategory(index: number) {
    this.newCategory.subCategories.splice(index, 1);
  }

  submitForm() {
    const categoryData: Category = { ...this.newCategory };
    this.categoryService.addCategory(categoryData).subscribe({
      next: () => {
        this.categoryList.push(categoryData); // Optionally update the UI after successful submission
        this.newCategory = {
          id: 0,
          category: '',
          subCategories: [{ id: 0, key: '', title: '' }],
        }; // Reset form
      },
      error: (err) => console.error('Error submitting category:', err),
    });
  }

  editCategory(index: number) {}

  deleteCategory(index: number) {
    const categoryToDelete = this.categoryList[index];
  
    if (!categoryToDelete.docId) {
      console.error('No Firestore document ID found for this category.');
      return;
    }
  
    if (
      !confirm(`Are you sure you want to delete "${categoryToDelete.category}"?`)
    ) {
      return;
    }
  
    this.categoryService.deleteCategory(categoryToDelete.docId).subscribe({
      next: () => {
        this.categoryList.splice(index, 1);
        console.log(
          `Category "${categoryToDelete.category}" deleted successfully.`
        );
      },
      error: (err) => console.error('Error deleting category:', err),
    });
  }
  

  getSubCategoryTitles(subCategories: SubCategory[]): string {
    if (subCategories.length === 0) return ''; // Return empty if no subcategories
    return subCategories
      .slice(0, -1) // Exclude the last subcategory
      .map((subcategory) => subcategory.title)
      .join(', '); // Join with commas
  }

  updateTitle(index: number) {
    const subCategory = this.newCategory.subCategories[index];
    if (subCategory.key.toLowerCase().startsWith('all')) {
      subCategory.title = 'All';
    } else {
      subCategory.title =
        subCategory.key.charAt(0).toUpperCase() + subCategory.key.slice(1);
    }
  }
}
