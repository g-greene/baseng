  import { FormGroup } from '@angular/forms';
import { TestBed } from '@angular/core/testing';

    // A page in a form flow; methods provide navigation among connected pages and subpages.

  export class BaseFormPage {
    _id: string = '';
    _displayName: string = '';
    _flowType: string = 'normal'; // normal, island, repeatable, end
    _iconName: string = '';
    _slug: string = '';
    _fRef: Function = () => {}; 
    _pages: BaseFormPage[];
    _keyValues: Map<string, any> = new Map<string, any>();
    _parentPage: BaseFormPage | undefined;
    _formGroup: FormGroup;

    constructor(id: string, displayName: string = '', formGroup: FormGroup = new FormGroup({}), formPages: BaseFormPage[] = [], slug: string = '') {
        this._pages = formPages;
        this._id = id;
        this._displayName = displayName == '' ? id : displayName;
        this._slug = slug == '' ? id : slug;
        this._formGroup = formGroup;
        this._pages.forEach(page => {
            page._parentPage = this;
        });
    }

    public get Id(): string {
        return this._id;
    }

    public set Id(value: string) {
        this._id = value;
    }

    public get DisplayName(): string {
        return this._displayName;
    }

    public set DisplayName(value: string) {
        this._displayName = value;
    }

    public get IconName(): string {
        return this._iconName;
    }

    public set IconName(value: string) {
        this._iconName = value;
    }

    public get Slug(): string {
        return this._slug;
    }

    public set Slug(value: string) {
        this._slug = value;
    }

    public get FRef(): Function | undefined {
        return this._fRef;
    }

    public set FRef(value: Function) {
        this._fRef = value;
    }

    public get ParentPage(): BaseFormPage | undefined {
        return this._parentPage;
    }

    public get FormPages(): BaseFormPage[] {
        return this._pages;
    }

    public set FormPages(value: BaseFormPage[]) {
        this._pages = value;
    }

    public get KeyValues(): Map<string, any> {
        return this._keyValues;
    }

    public set KeyValues(value: Map<string, any>) {
        this._keyValues = value;
    }

    public get FormGroup(): FormGroup | undefined {
        return this._formGroup;
    }

    public findPage(pageId: string, includeSubpages: boolean = false): BaseFormPage | undefined {
        var page = this._pages.find(
            page => page.Id === pageId || (includeSubpages && page.FormPages.find(subpage => subpage.Id === pageId)
        ));

        return page;
    }

    public findSubpage(pageId: string, includeSubpages: boolean = false, flowType: string, page: BaseFormPage | undefined = undefined, level: number = 0): BaseFormPage | undefined {
        for(let i = 0; i < this._pages.length; i++) {

            // DEBUG
            // console.debug('findSubpage()');
            // console.debug('Level: ' + level + ', Checking Page: ' + this._pages[i].Id + ' for ' + pageId);

            if (this._pages[i].Id === pageId && this._pages[i]._flowType === flowType) {
                return this._pages[i];
            }
            else if (includeSubpages) {
                let subpageIndex = this._pages[i].findSubpage(pageId, true, flowType, this._pages[i], level + 1);
                if (subpageIndex !== undefined) {
                    return this._pages[i]; // Return the index of the parent page
                }
            }
        }
        return undefined;
    }

    public findSubpageIndex(pageId: string, includeSubpages: boolean = false, flowType: string, page: BaseFormPage | undefined = undefined, level: number = 0): number {
        for(let i = 0; i < this._pages.length; i++) {
            // DEBUG
            // console.debug('findSubpageIndex()');
            // console.debug('Level: ' + level + ', Checking Page: ' + this._pages[i].Id + ' for ' + pageId);

            if (this._pages[i].Id === pageId && this._pages[i]._flowType === flowType) {
                return i;
            }
            else if (includeSubpages) {
                let subpageIndex = this._pages[i].findSubpageIndex(pageId, true, flowType, this._pages[i], level + 1);
                if (subpageIndex !== -1) {
                    return i; // Return the index of the parent page
                }
            }
        }
        return -1;
    }

    public previousSubpage(currentSubpageId: string, flowType: string = 'normal', followParent: boolean = true): BaseFormPage | undefined {

        let index = this.findSubpageIndex(currentSubpageId, true, flowType),
            currentSubpage = this.findSubpage(currentSubpageId, true, flowType),
            parentPage = currentSubpage ? currentSubpage.ParentPage : undefined;

        // DEBUG
        // console.debug('previousSubpage(): currentSubpageId: ' + currentSubpageId + ', index: ' + index + ', parentPage: ' + (parentPage ? parentPage.Id : 'none'));


        if (parentPage) {
            if (index < parentPage.FormPages.length && index > 0) {
                // console.debug('Previous subpage found: ' + parentPage.FormPages[index - 1].Id);
                return parentPage.FormPages[index - 1];
            }
            else {
                if (followParent && parentPage.ParentPage) {
                    // console.debug('Found previous subpage in parent: ' + parentPage.ParentPage.Id);
                    return parentPage.ParentPage;
                    //return parentPage.ParentPage.previousSubpage(parentPage.Id, flowType, true);
                }
            }
        }
        else {
            if (index < this._pages.length - 1 && index > 0) {
                return this._pages[index - 1];
            }
        }

        // if(index == -1) {
        //     if (followParent && this._parentPage) {
        //         return this._parentPage.previousSubpage(this._id, true);
        //     }
        //     return undefined;
        // }
        // else if (index < this._pages.length && index > 0) {
        //     return this._pages[index - 1];
        // }

        return undefined;
    }

    public nextSubpage(currentSubpageId: string, flowType: string = 'normal', followParent: boolean = true): BaseFormPage | undefined {

        let index = this.findSubpageIndex(currentSubpageId, true, flowType),
            currentSubpage = this.findSubpage(currentSubpageId, true, flowType),
            parentPage = currentSubpage ? currentSubpage.ParentPage : undefined;

        if (parentPage) {
            if (index < parentPage.FormPages.length - 1 && index >= 0) {
                // DEBUG
                // console.debug('Next subpage found: ' + parentPage.FormPages[index + 1].Id);
                return parentPage.FormPages[index + 1];
            }
            else {
                if (followParent && parentPage.ParentPage) {
                    // DEBUG
                    // console.debug('Found next subpage in parent: ' + parentPage.ParentPage.Id);
                    return parentPage.ParentPage.nextSubpage(parentPage.Id, flowType, true);
                }
            }
        }
        else {
            if (index < this._pages.length - 1 && index >= 0) {
                return this._pages[index + 1];
            }
        }

        return undefined;
    }
}
