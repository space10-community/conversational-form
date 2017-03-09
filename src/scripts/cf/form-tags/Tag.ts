/// <reference path="../data/Dictionary.ts"/>
/// <reference path="InputTag.ts"/>
/// <reference path="ButtonTag.ts"/>
/// <reference path="SelectTag.ts"/>
/// <reference path="OptionTag.ts"/>
/// <reference path="../ConversationalForm.ts"/>

// basic tag from form logic
// types:
// radio
// text
// email
// tel
// password
// checkbox
// radio
// select
// button


// namespace
namespace cf {
	// interface
	export interface ITag{
		domElement?: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement,
		type: string,
		name: string,
		label: string,
		question: string,
		errorMessage: string,
		setTagValueAndIsValid(dto: FlowDTO): boolean;
		dealloc(): void;
		refresh(): void;
		value:string | Array <string>;
		inputPlaceholder?: string;
		required: boolean;
		defaultValue: string | number;
		disabled: boolean;

		validationCallback?(dto: FlowDTO, success: () => void, error: (optionalErrorMessage?: string) => void): void;
	}

	export interface ITagOptions{
		domElement?: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement,
		questions?: Array<string>,
		label?: string,
		validationCallback?: (dto: FlowDTO, success: () => void, error: () => void) => void,// can be set through cf-validation attribute
	}

	// class
	export class Tag implements ITag {
		public domElement: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement;
		
		private errorMessages: Array<string>;
		private pattern: RegExp;

		// input placeholder text, this is for the UserInput and not the tag it self.
		protected _inputPlaceholder: string;

		public defaultValue: string | number;
		protected _label: string;
		protected questions: Array<string>; // can also be set through cf-questions attribute.

		public validationCallback?: (dto: FlowDTO, success: () => void, error: (optionalErrorMessage?: string) => void) => void; // can be set through cf-validation attribute, get's called from FlowManager

		public get type (): string{
			return this.domElement.getAttribute("type") || this.domElement.tagName.toLowerCase();
		}

		public get name (): string{
			return this.domElement.getAttribute("name");
		}

		public get inputPlaceholder (): string{
			return this._inputPlaceholder;
		}

		public get label (): string{
			if(!this._label)
				this.findAndSetLabel();

			if(this._label)
				return this._label;
			
			return Dictionary.getRobotResponse(this.type);
		}

		public get value (): string | Array<string> {
			return this.domElement.value;
		}

		public get hasImage (): boolean{
			return this.domElement.hasAttribute("cf-image");
		}

		public get disabled (): boolean{
			return this.domElement.getAttribute("disabled") != undefined && this.domElement.getAttribute("disabled") != null;
		}

		public get required(): boolean{
			return !!this.domElement.getAttribute("required") || this.domElement.getAttribute("required") == "";
		}

		public get question():string{
			// if questions are empty, then fall back to dictionary, every time
			if(!this.questions || this.questions.length == 0)
				return Dictionary.getRobotResponse(this.type);
			else
				return this.questions[Math.floor(Math.random() * this.questions.length)];
		}

		public get errorMessage():string{
			if(!this.errorMessages){
				// custom tag error messages
				if(this.domElement.getAttribute("cf-error")){
					this.errorMessages = this.domElement.getAttribute("cf-error").split("|");
				}else if(this.domElement.parentNode && (<HTMLElement> this.domElement.parentNode).getAttribute("cf-error")){
					this.errorMessages = (<HTMLElement> this.domElement.parentNode).getAttribute("cf-error").split("|");
				}else if(this.required){
					this.errorMessages = [Dictionary.get("input-placeholder-required")]
				}else{
					if(this.type == "file")
						this.errorMessages = [Dictionary.get("input-placeholder-file-error")];
					else{
						this.errorMessages = [Dictionary.get("input-placeholder-error")];
					}
				}
			}

			return this.errorMessages[Math.floor(Math.random() * this.errorMessages.length)];
		}

		constructor(options: ITagOptions){
			this.domElement = options.domElement;
			
			// remove tabIndex from the dom element.. danger zone... should we or should we not...
			this.domElement.tabIndex = -1;

			// questions array
			if(options.questions)
				this.questions = options.questions;

			
			// custom tag validation
			if(this.domElement.getAttribute("cf-validation")){
				// set it through an attribute, danger land with eval
				this.validationCallback = eval(this.domElement.getAttribute("cf-validation"));
			}

			// reg ex pattern is set on the Tag, so use it in our validation
			if(this.domElement.getAttribute("pattern"))
				this.pattern = new RegExp(this.domElement.getAttribute("pattern"));
			
			// if(this.type == "email" && !this.pattern){
			// 	// set a standard e-mail pattern for email type input
			// 	this.pattern = new RegExp("^[^@]+@[^@]+\.[^@]+$");
			// }

			if(this.type != "group"){
				console.log('Conversational Form > Tag registered:', this.type);
			}

			this.refresh();
		}

		public dealloc(){
			this.domElement = null;
			this.defaultValue = null;
			this.errorMessages = null;
			this.pattern = null;
			this._label = null;
			this.validationCallback = null;
			this.questions = null;
		}

		public static isTagValid(element: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement):boolean{
			if(element.getAttribute("type") === "hidden")
				return false;
			
			if(element.getAttribute("type") === "submit")
				return false;
			
			// ignore buttons, we submit the form automatially
			if(element.getAttribute("type") == "button")
				return false;

			if(element.style.display === "none")
				return false;
			
			if(element.style.visibility === "hidden")
				return false;

			const innerText: string = Helpers.getInnerTextOfElement(element);
			if(element.tagName.toLowerCase() == "option" && (innerText == "" || innerText == " ")){
				return false;
			}
		
			if(element.tagName.toLowerCase() == "select" || element.tagName.toLowerCase() == "option")
				return true
			else{
				return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
			}
		}

		public static createTag(element: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement): ITag{
			if(Tag.isTagValid(element)){
				// ignore hidden tags
				let tag: ITag;
				if(element.tagName.toLowerCase() == "input"){
					tag = new InputTag({
						domElement: element
					});
				}else if(element.tagName.toLowerCase() == "textarea"){
					tag = new InputTag({
						domElement: element
					});
				}else if(element.tagName.toLowerCase() == "select"){
					tag = new SelectTag({
						domElement: element
					});
				}else if(element.tagName.toLowerCase() == "button"){
					tag = new ButtonTag({
						domElement: element
					});
				}else if(element.tagName.toLowerCase() == "option"){
					tag = new OptionTag({
						domElement: element
					});
				}

				return tag;
			}else{
				// console.warn("Tag is not valid!: "+ element);
				return null;
			}
		}

		public refresh(){
			// default value of Tag, check every refresh
			this.defaultValue = this.domElement.value;

			this.questions = null;
			this.findAndSetQuestions();
		}

		public setTagValueAndIsValid(dto: FlowDTO):boolean{
			// this sets the value of the tag in the DOM
			// validation
			let isValid: boolean = true;
			let valueText: string = dto.text;

			if(this.pattern){
				isValid = this.pattern.test(valueText);
			}

			if(valueText == "" && this.required){
				isValid = false;
			}

			const min: number = parseInt(this.domElement.getAttribute("min"), 10) || -1;
			const max: number = parseInt(this.domElement.getAttribute("max"), 10) || -1;

			if(min != -1 && valueText.length < min){
				isValid = false;
			}

			if(max != -1 && valueText.length > max){
				isValid = false;
			}

			if(isValid){
				// we cannot set the dom element value when type is file
				if(this.type != "file")
					this.domElement.value = valueText;
			}else{
				// throw new Error("cf-: value:string is not valid. Value: "+value);
			}

			return isValid;
		}

		protected findAndSetQuestions(){
			if(this.questions)
				return;

			// <label tag with label:for attribute to el:id
			// check for label tag, we only go 2 steps backwards..

			// from standardize markup: http://www.w3schools.com/tags/tag_label.asp


			if(this.domElement.getAttribute("cf-questions")){
				this.questions = this.domElement.getAttribute("cf-questions").split("|");
				if(this.domElement.getAttribute("cf-input-placeholder"))
					this._inputPlaceholder = this.domElement.getAttribute("cf-input-placeholder");
			}else if(this.domElement.parentNode && (<HTMLElement> this.domElement.parentNode).getAttribute("cf-questions")){
				// for groups the parentNode can have the cf-questions..
				const parent: HTMLElement = (<HTMLElement> this.domElement.parentNode);
				this.questions = parent.getAttribute("cf-questions").split("|");
				if(parent.getAttribute("cf-input-placeholder"))
					this._inputPlaceholder = parent.getAttribute("cf-input-placeholder");
			}else{
				// questions not set, so find it in the DOM
				// try a broader search using for and id attributes
				const elId: string = this.domElement.getAttribute("id");
				const forLabel: HTMLElement = <HTMLElement> document.querySelector("label[for='"+elId+"']");

				if(forLabel){
					this.questions = [Helpers.getInnerTextOfElement(forLabel)];
				}
			}

			if(!this.questions && this.domElement.getAttribute("placeholder")){
				// check for placeholder attr if questions are still undefined
				this.questions = [this.domElement.getAttribute("placeholder")];
			}
		}

		protected findAndSetLabel(){
			// find label..
			if(this.domElement.getAttribute("cf-label")){
				this._label = this.domElement.getAttribute("cf-label");
			}else{
				const parentDomNode: Node = this.domElement.parentNode;
				if(parentDomNode){
					// step backwards and check for label tag.
					let labelTags: NodeListOf<Element> | Array<Element> = (<HTMLElement> parentDomNode).getElementsByTagName("label");

					if(labelTags.length == 0){
						// check for innerText
						const innerText: string = Helpers.getInnerTextOfElement((<any>parentDomNode));
						if(innerText && innerText.length > 0)
							labelTags = [(<HTMLLabelElement>parentDomNode)];
					}

					if(labelTags.length > 0 && labelTags[0])
						this._label = Helpers.getInnerTextOfElement(labelTags[0]);
				}
			}
		}
	}
}

