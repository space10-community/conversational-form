/// <reference path="ButtonTag.ts"/>
/// <reference path="InputTag.ts"/>
/// <reference path="SelectTag.ts"/>
/// <reference path="../ui/inputs/UserTextInput.ts"/>

// group tags together, this is done automatically by looking through InputTags with type radio or checkbox and same name attribute.
// single choice logic for Radio Button, <input type="radio", where name is the same
// multi choice logic for Checkboxes, <input type="checkbox", where name is the same


// namespace
namespace cf {
	// interface
	export interface ITagGroupOptions{
		elements: Array <ITag>;
		fieldset?: HTMLFieldSetElement;
	}

	export interface ITagGroup extends ITag{
		elements: Array <ITag>;
		activeElements: Array <ITag>;
		getGroupTagType: () => string;
		refresh():void;
		dealloc():void;
		required: boolean;
		disabled: boolean;
		skipUserInput: boolean;
		flowManager: FlowManager;
		inputPlaceholder?: string;
	}

	// class
	export class TagGroup implements ITagGroup {

		private onInputKeyChangeCallback: () => void;
		private _values: Array<string>;
		private questions: Array<string>; // can also be set through `fieldset` cf-questions="..."` attribute.
		
		/**
		* Array checked/choosen ITag's
		*/
		private _activeElements: Array<ITag>;
		private _eventTarget: EventDispatcher;
		private _fieldset: HTMLFieldSetElement;
		protected _inputPlaceholder: string;

		public skipUserInput: boolean;

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

		public set flowManager(value: FlowManager){
			for (let i = 0; i < this.elements.length; i++) {
				let tag: ITag = <ITag>this.elements[i];
				tag.flowManager = value;
			}
		}

		public get type (): string{
			return "group";
		}

		public get label (): string{
			return "";
		}

		public get name (): string{
			return this._fieldset && this._fieldset.hasAttribute("name") ? this._fieldset.getAttribute("name") : this.elements[0].name;
		}

		public get id (): string{
			return this._fieldset && this._fieldset.id ? this._fieldset.id : this.elements[0].id;
		}

		public get question():string{
			// check if elements have the questions, else fallback
			if(this.questions && this.questions.length > 0){
				return this.questions[Math.floor(Math.random() * this.questions.length)];
			}else if(this.elements[0] && this.elements[0].question){
				let tagQuestion: string = this.elements[0].question;
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
			return this._values ? this._values : [""];
		}

		public get disabled (): boolean{
			let disabled: boolean = false;
			let allShouldBedisabled: number = 0;
			for (let i = 0; i < this.elements.length; i++) {
				let element: ITag = <ITag>this.elements[i];
				if(element.disabled)
					allShouldBedisabled++;
			}

			return allShouldBedisabled === this.elements.length;
		}
		
		public get errorMessage():string{
			var errorMessage = Dictionary.get("input-placeholder-error");

			for (let i = 0; i < this.elements.length; i++) {
				let element: ITag = <ITag>this.elements[i];
				errorMessage = element.errorMessage;
			}

			return errorMessage;
		}

		public get inputPlaceholder (): string{
			return this._inputPlaceholder;
		}

		constructor(options: ITagGroupOptions){
			this.elements = options.elements;
			// set wrapping element
			this._fieldset = options.fieldset;
			if(this._fieldset && this._fieldset.getAttribute("cf-questions")){
				this.questions = Helpers.getValuesOfBars(this._fieldset.getAttribute("cf-questions"));
			}
			if (this._fieldset && this._fieldset.getAttribute("cf-input-placeholder")) {
				this._inputPlaceholder = this._fieldset.getAttribute("cf-input-placeholder");
			}

			if(ConversationalForm.illustrateAppFlow)
				if(!ConversationalForm.suppressLog) console.log('Conversational Form > TagGroup registered:', this.elements[0].type, this);

			this.skipUserInput = false;
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

		public reset(){
			this._values = [];
			for (let i = 0; i < this.elements.length; i++) {
				let element: ITag = <ITag>this.elements[i];
				element.reset();
			}
		}

		public getGroupTagType():string{
			return this.elements[0].type;
		}

		public hasConditionsFor(tagName: string):boolean{
			for (let i = 0; i < this.elements.length; i++) {
				let element: ITag = <ITag>this.elements[i];
				if(element.hasConditionsFor(tagName)){
					return true;
				}
			}

			return false;
		}

		public hasConditions():boolean{
			for (let i = 0; i < this.elements.length; i++) {
				let element: ITag = <ITag>this.elements[i];
				if(element.hasConditions()){
					return true;
				}
			}

			return false;
		}

		/**
		* @name checkConditionalAndIsValid
		* checks for conditional logic, see documentaiton (wiki)
		* here we check after cf-conditional{-name} on group tags
		*/
		public checkConditionalAndIsValid(): boolean {
			// can we tap into disabled
			// if contains attribute, cf-conditional{-name} then check for conditional value across tags
			for (let i = 0; i < this.elements.length; i++) {
				let element: ITag = <ITag>this.elements[i];
				element.checkConditionalAndIsValid();
			}

			// else return true, as no conditional means happy tag
			return true;
		}

		public setTagValueAndIsValid(dto: FlowDTO):boolean{
			let isValid: boolean = false;

			const groupType: string = this.elements[0].type;
			this._values = [];
			this._activeElements = [];

			switch(groupType){
				case "radio" :
					let wasRadioButtonChecked: boolean = false;
					let numberRadioButtonsVisible: Array <RadioButton> = [];
					if(dto.controlElements){
						// TODO: Refactor this so it is less dependant on controlElements
						for (let i = 0; i < dto.controlElements.length; i++) {
							let element: RadioButton = <RadioButton> dto.controlElements[i];
							let tag: ITag = this.elements[this.elements.indexOf(element.referenceTag)];
							numberRadioButtonsVisible.push(element);

							if(tag == element.referenceTag){
								if(element.checked){
									this._values.push(<string> tag.value);
									this._activeElements.push(tag);
								}
								// a radio button was checked
								if(!wasRadioButtonChecked && element.checked)
									wasRadioButtonChecked = true;
							}
						}

					}else{
						// for when we don't have any control elements, then we just try and map values
						for (let i = 0; i < this.elements.length; i++) {
							let tag: ITag = <ITag>this.elements[i];
							const v1: string = tag.value.toString().toLowerCase();
							const v2: string = dto.text.toString().toLowerCase();
							//brute force checking...
							if(v1.indexOf(v2) !== -1 || v2.indexOf(v1) !== -1){
								this._activeElements.push(tag);
								// check the original tag
								this._values.push(<string> tag.value);
								(<HTMLInputElement> tag.domElement).checked = true;
								wasRadioButtonChecked = true;
							}
						}
					}

					isValid = wasRadioButtonChecked;
					break;

				case "checkbox" :
					// checkbox is always valid
					isValid = true;

					if(dto.controlElements){
						for (let i = 0; i < dto.controlElements.length; i++) {
							let element: CheckboxButton = <CheckboxButton> dto.controlElements[i];
							let tag: ITag = this.elements[this.elements.indexOf(element.referenceTag)];
							(<HTMLInputElement> tag.domElement).checked = element.checked;

							if(element.checked){
								this._values.push(<string> tag.value);
								this._activeElements.push(tag);
							}
						}
					}

					if(this.required && this._activeElements.length == 0){
						// checkbox can be required
						isValid = false;
					}

					break;
			}

			return isValid;
		}
	}
}