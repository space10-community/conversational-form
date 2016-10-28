/// <reference path="ButtonTag.ts"/>
/// <reference path="InputTag.ts"/>
/// <reference path="SelectTag.ts"/>
/// <reference path="../ui/UserInput.ts"/>

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
			var str: string = "";
			for (var i = 0; i < this.elements.length; i++) {
				var element: ITag = this.elements[i];
				str += element.question + (i < this.elements.length - 1 ? " + " : "");
			}
			return str;
		}

		public get value (): string{
			// TODO: fix value???
			return "";
		}

		private onInputKeyChangeCallback: () => void;

		constructor(options: ITagGroupOptions){
			this.elements = options.elements;

			console.log('TagGroup registered:', this.elements[0].type, this);
		}

		public setTagValueAndIsValid(value: string | number):boolean{
			let isValid: boolean = true;

			if(value == ""){
				isValid = false;
			}

			// TODO: Set value on fields!!!

			return isValid;
		}
	}
}