import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../shared/services/category.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'; // Import SweetAlert2

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
    const newId = this.newCategory.subCategories.length; // Assign a numeric ID
    const newSubCategory: SubCategory = { id: newId, key: '', title: '' };
    this.newCategory.subCategories.push(newSubCategory);
  }

  removeSubCategory(index: number) {
    this.newCategory.subCategories.splice(index, 1);
  }

  submitForm() {
    const categoryData: Category = { ...this.newCategory };

    if (this.editIndex !== null) {
      const docId = this.categoryList[this.editIndex].docId;
      if (!docId) {
        console.error('Missing docId for update');
        return;
      }
      Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to update "${categoryData.category}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, update it!',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          this.categoryService.updateCategory(docId, categoryData).subscribe({
            next: () => {
              this.categoryList[this.editIndex!] = { ...categoryData, docId };
              Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: `"${categoryData.category}" was updated successfully.`,
                confirmButtonText: 'OK',
              });
              this.resetForm();
              this.editIndex = null;
            },
            error: (err) => console.error('Error updating category', err),
          });
        }
      });
    } else {
      this.categoryService.addCategory(categoryData).subscribe({
        next: () => {
          this.categoryList.push(categoryData); // Optionally update the UI after successful submission
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'The category was added successfully.',
            confirmButtonText: 'OK',
          });
          this.resetForm();
        },
        error: (err) => console.error('Error submitting category:', err),
      });
    }
  }

  editCategory(index: number) {
    this.editIndex = index;
    const selected = this.categoryList[index];

    this.newCategory = {
      id: selected.id,
      category: selected.category,
      subCategories: selected.subCategories.map((sub, i) => ({
        id: i,
        key: sub.key,
        title: sub.title,
      })),
    };
  }

  deleteCategory(index: number) {
    const categoryToDelete = this.categoryList[index];

    if (!categoryToDelete.docId) {
      console.error('No Firestore document ID found for this category.');
      return;
    }

    Swal.fire({
      title: `Are you sure you want to delete "${categoryToDelete.category}"?`,
      // text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {

    this.categoryService.deleteCategory(categoryToDelete.docId!).subscribe({
      next: () => {
        this.categoryList.splice(index, 1);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: `Category "${categoryToDelete.category}" was deleted successfully.`,
          timer: 1000,
          showConfirmButton: false
        });
        console.log(
          `Category "${categoryToDelete.category}" deleted successfully.`
        );
      },
      error: (err) => {
        console.error('Error deleting category:', err),
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'There was a problem deleting the category. Please try again later.',
        });
      }
    });
  }
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

  resetForm() {
    this.newCategory = {
      id: 0,
      category: '',
      subCategories: [{ id: 0, key: '', title: '' }],
    }; // Reset form
  }
}
