/// <reference path="ButtonTag.ts"/>
/// <reference path="InputTag.ts"/>
/// <reference path="SelectTag.ts"/>
/// <reference path="../ui/UserInput.ts"/>

// group tags together, this is done automatically by looking through InputTags with type radio or checkbox and same name attribute.
// single choice logic for Radio Button, <input type="radio", where name is the same
// multi choice logic for Checkboxes, <input type="checkbox", where name is the same


// namespace
namespace cf {
	// interface
	export interface ITagGroupOptions{
		elements: Array <InputTag | SelectTag | ButtonTag>;
	}

	export interface ITagGroup extends ITag{
		elements: Array <InputTag | SelectTag | ButtonTag>;
		getGroupTagType: () => string;
		dealloc():void;
	}

	// class
	export class TagGroup implements ITagGroup {

		private errorMessages: Array<string>;
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
		
		public get errorMessage():string{
			if(!this.errorMessages){
				this.errorMessages = [Dictionary.get("input-placeholder-error")];
				for (let i = 0; i < this.elements.length; i++) {
					let element: ITag = <ITag>this.elements[i];
					if(this.elements[i].domElement.getAttribute("cf-error")){
						this.errorMessages = this.elements[i].domElement.getAttribute("cf-error").split("|");
					}
				}
			}

			return this.errorMessages[Math.floor(Math.random() * this.errorMessages.length)];
		}

		private onInputKeyChangeCallback: () => void;

		constructor(options: ITagGroupOptions){
			this.elements = options.elements;
			console.log('TagGroup registered:', this.elements[0].type, this);
		}

		public dealloc(){
			// TODO: Handle deallocation of group
		}

		public getGroupTagType():string{
			return this.elements[0].type;
		}

		public setTagValueAndIsValid(value: FlowDTO):boolean{
			let isValid: boolean = false;

			const groupType: string = this.elements[0].type;

			for (var i = 0; i < this.elements.length; i++) {
				var tag: ITag = this.elements[i];
				switch(groupType){
					case "radio" :
						let wasRadioButtonChecked: boolean = false;
						for (let i = 0; i < value.controlElements.length; i++) {
							let element: CheckboxButton | RadioButton = <CheckboxButton | RadioButton> value.controlElements[i];
							if(tag.domElement == element.referenceTag.domElement){
								(<HTMLInputElement> tag.domElement).checked = element.checked;
								// a radio button was checked
								if(!wasRadioButtonChecked && element.checked)
									wasRadioButtonChecked = true;
							}
						}

						// a radio button needs to be checked of
						if(!isValid && wasRadioButtonChecked)
							isValid = wasRadioButtonChecked;
						break;

					case "checkbox" :
						// checkbox is always valid
						isValid = true;

						for (let i = 0; i < value.controlElements.length; i++) {
							let element: CheckboxButton | RadioButton = <CheckboxButton | RadioButton> value.controlElements[i];
							if(tag.domElement == element.referenceTag.domElement)
								(<HTMLInputElement> tag.domElement).checked = element.checked;
						}
						break;
					
				}
			}

			return isValid;
		}
	}
}