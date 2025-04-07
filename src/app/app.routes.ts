import { Routes } from '@angular/router';
import { BookAdminComponent } from './front-end/book-admin/book-admin.component';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './front-end/dashboard/dashboard.component';
import { CategoriesComponent } from './front-end/categories/categories.component';
import { LanguagesComponent } from './front-end/languages/languages.component';
import { AuthorsComponent } from './front-end/authors/authors.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },

    { path: '', component: DashboardComponent,
        children: [
            { path: '', redirectTo: 'books', pathMatch: 'full' }, // Redirect to books by default
            { path: 'books', component: BookAdminComponent },
            { path: 'categories', component: CategoriesComponent },
            { path: 'languages', component: LanguagesComponent },
            { path: 'authors', component: AuthorsComponent },
        ] 
     },

    //  { path: '**', redirectTo: '' },

];
