import { CategoryEvent } from './../../../../models/enums/categories/categoryEvent';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DeleteCategoryAction } from 'src/app/models/interfaces/categories/deleteCategoryAction';
import { EditCategoryAction } from 'src/app/models/interfaces/categories/editCategoryAction';
import { GetAllCategories } from 'src/app/models/interfaces/categories/getAllCategories';

@Component({
  selector: 'app-categories-table',
  templateUrl: './categories-table.component.html',
  styleUrls: []
})
export class CategoriesTableComponent {
  @Input() public categories: Array<GetAllCategories> = []
  @Output() public categoryEvent = new EventEmitter<EditCategoryAction>()
  @Output() public deleteCategoryEvent = new EventEmitter<DeleteCategoryAction>()
  public categorySelected!: GetAllCategories;
  public addCategoryAction = CategoryEvent.ADD_CATEGORY_ACTION
  public editCategoryAction = CategoryEvent.EDIT_CATEGORY_ACTION

  handleDeleteCategoryEvent(category_id: string, categoryName: string): void {
    if (category_id !== '' && categoryName !== '') {
      this.deleteCategoryEvent.emit({ category_id, categoryName });
    }
  }

  handleCategoryEvent(action: string, id?: string, category_name?: string): void {
    if(action && action !== ''){
      this.categoryEvent.emit({action, id, category_name})
    }
  }

}
