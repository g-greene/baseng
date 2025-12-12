import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { BaseComponent } from '@baseng/base';
import { BaseFormPage } from './base-form-page';


@Component({
  selector: 'baseng-base-form',
  imports: [],
  template: ``,
  styles: ``,
  standalone: true
})
export class BaseForm extends BaseComponent {
  private _formPageSequence: BaseFormPage;

  public constructor() {
    super();

    this._formPageSequence = new BaseFormPage('root', 'Root');
  }

  public get FormPageSequence(): BaseFormPage {
    return this._formPageSequence;
  }

  public override ngOnInit(): void {
    super.ngOnInit();

      // this._formPageSequence = new BaseFormPage(
      // "form-page-id", "Form Page Title", this.formGroupObject, [
      //   new BaseFormPage("sub-form-page-id", "Sub Form Page Title", this.formGroupSubPObject),
      //   // ... add more sub pages as needed
      // ]);
  }

}
