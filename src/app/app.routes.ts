import { Routes } from '@angular/router';
import { BookAdminComponent } from './front-end/book-admin/book-admin.component';
import { DashboardComponent } from './front-end/dashboard/dashboard.component';
import { CategoriesComponent } from './front-end/categories/categories.component';
import { LanguagesComponent } from './front-end/languages/languages.component';
import { AuthorsComponent } from './front-end/authors/authors.component';
import { CarouselImagesComponent } from './front-end/carousel-images/carousel-images.component';
import { AdvertisementComponent } from './front-end/advertisement/advertisement.component';

export const routes: Routes = [
    { path: '', component: DashboardComponent,
        children: [
            { path: '', redirectTo: 'books', pathMatch: 'full' }, 
            { path: 'books', component: BookAdminComponent },
            { path: 'categories', component: CategoriesComponent },
            { path: 'languages', component: LanguagesComponent },
            { path: 'authors', component: AuthorsComponent },
            { path: 'carousel', component: CarouselImagesComponent },
            { path: 'ad', component: AdvertisementComponent },
        ] 
     },

    //  { path: '**', redirectTo: '' },

];
