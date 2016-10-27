/// <reference path="ButtonTag.ts"/>
/// <reference path="InputTag.ts"/>
/// <reference path="SelectTag.ts"/>

// group tags together, this is done automatically by looking through InputTags with type radio or checkbox and same name attribute.
// single choice logic for Radio Button, <input type="radio", where name is the same
// multi choice logic for Checkboxes, <input type="checkbox", where name is the same


// namespace
namespace io.space10 {
	// interface
	export interface ITagGroupOptions{
		elements: Array <InputTag | SelectTag | ButtonTag>;
	}

	export interface ITagGroup extends ITag{
		elements: Array <InputTag | SelectTag | ButtonTag>
	}

	// class
	export class TagGroup implements ITagGroup {
		public elements: Array <InputTag | SelectTag | ButtonTag>;

		public get type (): string{
			return "group";
		}

		public get name (): string{
			return this.elements[0].name;
		}

		public get title (): string{
			return this.elements[0].title;
		}

		public get question():string{
			return this.elements[0].question;
		}

		constructor(options: ITagGroupOptions){
			this.elements = options.elements;
			// console.log(this, 'TagGroup:', this.elements);
		}

		public setTagValueAndIsValid(value: string | number):boolean{
			let isValid: boolean = true;

			if(value == ""){
				isValid = false;
			}

			return isValid;
		}
	}
}