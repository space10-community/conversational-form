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
		elements: Array <ITag>;
	}

	export interface ITagGroup extends ITag{
		elements: Array <ITag>;
		activeElements: Array <ITag>;
		getGroupTagType: () => string;
		refresh():void;
		dealloc():void;
		required: boolean;
		disabled: boolean;
	}

	// class
	export class TagGroup implements ITagGroup {

		private onInputKeyChangeCallback: () => void;
		private _values: Array<string>;
		
		/**
		* Array checked/choosen ITag's
		*/
		private _activeElements: Array<ITag>;
		private _eventTarget: EventDispatcher;

		// event target..
		public defaultValue: string; // not getting set... as taggroup differs from tag
		public elements: Array <ITag>;
		
		public get required(): boolean{
			for (let i = 0; i < this.elements.length; i++) {
				let element: ITag = <ITag>this.elements[i];
				if(this.elements[i].required){
					return true;
				}
			}

			return false;
		}

		public set eventTarget(value: EventDispatcher){
			this._eventTarget = value;
			for (let i = 0; i < this.elements.length; i++) {
				let tag: ITag = <ITag>this.elements[i];
				tag.eventTarget = value;
			}
		}

		public get type (): string{
			return "group";
		}

		public get name (): string{
			return this.elements[0].name;
		}

		public get label (): string{
			return this.elements[0].label;
		}

		public get question():string{
			// check if elements have the questions, else fallback
			let tagQuestion: string = this.elements[0].question;

			if(tagQuestion){
				return tagQuestion;
			}else{
				// fallback to robot response from dictionary
				const robotReponse: string = Dictionary.getRobotResponse(this.getGroupTagType());
				return robotReponse;
			}
		}

		public get activeElements (): Array<ITag>{
			return this._activeElements;
		}

		public get value (): Array<string>{
			// TODO: fix value???
			return this._values;
		}

		public get disabled (): boolean{
			let disabled: boolean = false;
			for (let i = 0; i < this.elements.length; i++) {
				let element: ITag = <ITag>this.elements[i];
				if(element.disabled)
					disabled = true;
			}

			return disabled;
		}
		
		public get errorMessage():string{
			var errorMessage = Dictionary.get("input-placeholder-error");

			for (let i = 0; i < this.elements.length; i++) {
				let element: ITag = <ITag>this.elements[i];
				errorMessage = element.errorMessage;
			}

			return errorMessage;
		}

		constructor(options: ITagGroupOptions){
			this.elements = options.elements;
			if(ConversationalForm.illustrateAppFlow)
				console.log('Conversational Form > TagGroup registered:', this.elements[0].type, this);
		}

		public dealloc(){
			for (let i = 0; i < this.elements.length; i++) {
				let element: ITag = <ITag>this.elements[i];
				element.dealloc();
			}

			this.elements = null;
		}

		public refresh(){
			for (let i = 0; i < this.elements.length; i++) {
				let element: ITag = <ITag>this.elements[i];
				element.refresh();
			}
		}

		public getGroupTagType():string{
			return this.elements[0].type;
		}

		public setTagValueAndIsValid(value: FlowDTO):boolean{
			let isValid: boolean = false;

			const groupType: string = this.elements[0].type;
			this._values = [];
			this._activeElements = [];

			switch(groupType){
				case "radio" :
					let numberRadioButtonsVisible: Array <RadioButton> = [];
					let wasRadioButtonChecked: boolean = false;
					for (let i = 0; i < value.controlElements.length; i++) {
						let element: RadioButton = <RadioButton> value.controlElements[i];
						let tag: ITag = this.elements[this.elements.indexOf(element.referenceTag)];
						if(element.visible){
							numberRadioButtonsVisible.push(element);

							if(tag == element.referenceTag){
								(<HTMLInputElement> tag.domElement).checked = element.checked;
								
								if(element.checked){
									this._values.push(<string> tag.value);
									this._activeElements.push(tag);
								}
								// a radio button was checked
								if(!wasRadioButtonChecked && element.checked)
									wasRadioButtonChecked = true;
							}else{
								(<HTMLInputElement> tag.domElement).checked = false;
							}
						}
					}

					// special case 1, only one radio button visible from a filter
					if(!isValid && numberRadioButtonsVisible.length == 1){
						let element: RadioButton = numberRadioButtonsVisible[0];
						let tag: ITag = this.elements[this.elements.indexOf(element.referenceTag)];
						element.checked = true;
						(<HTMLInputElement> tag.domElement).checked = true;
						isValid = true;

						if(element.checked){
							this._values.push(<string> tag.value);
							this._activeElements.push(tag);
						}
					}else if(!isValid && wasRadioButtonChecked){
						// a radio button needs to be checked of
						isValid = wasRadioButtonChecked;
					}

					break;

				case "checkbox" :
					// checkbox is always valid
					isValid = true;

					for (let i = 0; i < value.controlElements.length; i++) {
						let element: CheckboxButton = <CheckboxButton> value.controlElements[i];
						let tag: ITag = this.elements[this.elements.indexOf(element.referenceTag)];
						(<HTMLInputElement> tag.domElement).checked = element.checked;

						if(element.checked){
							this._values.push(<string> tag.value);
							this._activeElements.push(tag);
						}
					}

					break;
			}

			return isValid;
		}
	}
}