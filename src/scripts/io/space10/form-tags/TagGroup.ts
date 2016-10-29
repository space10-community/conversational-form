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
		elements: Array <InputTag | SelectTag | ButtonTag>;
		getGroupTagType: () => string;
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
			for (var i = 0; i < this.elements.length; i++) {
				// force question render..
				this.elements[i].question
			}

			// expect the first tag of the group to have the question, else fallback to AIReponse

			const firstTag: ITag = this.elements[0];
			const firstTagQuestion: string = firstTag.question;

			if(firstTagQuestion){
				return firstTagQuestion;
			}else{
				// fallback to AI response from dictionary
				const aiReponse: string = Dictionary.getAIResponse(firstTag.type);
				return aiReponse;
			}
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

		public getGroupTagType():string{
			return this.elements[0].type;
		}

		public setTagValueAndIsValid(value: string | ITag):boolean{
			let isValid: boolean = true;

			if(value == ""){
				isValid = false;
			}

			// TODO: Set value on fields
			const groupType: string = this.elements[0].type;
			for (var i = 0; i < this.elements.length; i++) {
				var tag: ITag = this.elements[i];
				if(tag == value){
					// console.log("TAG", tag)
					if(groupType == "radio")
						(<HTMLInputElement> tag.domElement).checked = true;
				}else{
					if(groupType == "radio")
						(<HTMLInputElement> tag.domElement).checked = false;
				}
			}

			return isValid;
		}
	}
}