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
		errorMessage:string,
		setTagValueAndIsValid(value: FlowDTO):boolean;
		dealloc():void;
		value:string;
	}

	export interface ITagOptions{
		domElement?: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement,
		questions?: Array<string>,
		label?: string,
		validationCallback?: (value: string) => boolean,// can also be set through cf-validation attribute
	}

	// class
	export class Tag implements ITag {
		public domElement: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement;
		
		protected defaultValue: string | number;

		private errorMessages: Array<string>;
		private pattern: RegExp;
		private _label: string;

		private validationCallback?: (value: string) => boolean; // can also be set through cf-validation attribute.
		private questions: Array<string>; // can also be set through cf-questions attribute.

		public get type (): string{
			return this.domElement.getAttribute("type");
		}

		public get name (): string{
			return this.domElement.getAttribute("name");
		}

		public get label (): string{
			if(!this._label){
				this.setLabel();
			}

			return this._label;
		}

		public get value (): string{
			return this.domElement.value;
		}

		public get question():string{
			if(!this.questions){
				this.findLabelAndSetQuestions();
			}

			return this.questions[Math.floor(Math.random() * this.questions.length)];
		}

		public get errorMessage():string{
			if(!this.errorMessages){
				// custom tag error messages
				
				if(this.domElement.getAttribute("cf-error")){
					this.errorMessages = this.domElement.getAttribute("cf-error").split("|");
				}else{
					if(this.type == "file")
						this.errorMessages = [Dictionary.get("input-placeholder-file-error")];
					else
						this.errorMessages = [Dictionary.get("input-placeholder-error")];
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
			if(this.validationCallback){
				this.validationCallback = options.validationCallback;
			}else if(this.domElement.getAttribute("cf-validation")){
				// set it through an attribute, danger land with eval
				this.validationCallback = eval(this.domElement.getAttribute("cf-validation"));
			}

			// reg ex pattern is set on the Tag, so use it in our validation
			if(this.domElement.getAttribute("pattern"))
				this.pattern = new RegExp(this.domElement.getAttribute("pattern"));

			// default value of Tag
			this.defaultValue = this.domElement.value;

			if(this.type != "group"){
				console.log('Tag registered:', this.type);
			}
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

		public static createTag(options: ITagOptions): ITag{
			const element: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement = options.domElement;
			if(Tag.isTagValid(element)){
				// ignore hidden tags
				let tag: ITag;
				if(element.tagName.toLowerCase() == "input"){
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

		public setTagValueAndIsValid(value: FlowDTO):boolean{
			// this sets the value of the tag in the DOM
			// validation
			let isValid: boolean = true;
			let valueText: string = value.text;

			if(this.pattern){
				isValid = this.pattern.test(valueText);
			}

			if(isValid && this.validationCallback){
				isValid = this.validationCallback(valueText);
			}

			if(valueText == ""){
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

		private findLabelAndSetQuestions(){
			if(this.questions)
				return;

			// <label tag with label:for attribute to el:id
			// check for label tag, we only go 2 steps backwards..

			// from standardize markup: http://www.w3schools.com/tags/tag_label.asp

			const elId: string = this.domElement.getAttribute("id");

			if(this.domElement.getAttribute("cf-label")){
				this.questions = [this.domElement.getAttribute("cf-label")];
			}else if(this.domElement.getAttribute("cf-questions")){
				this.questions = this.domElement.getAttribute("cf-questions").split("|");
			}else{
				// questions not set, so find it in the DOM
				// try a broader search using for and id attributes
				const forLabel: HTMLElement = <HTMLElement> document.querySelector("label[for='"+elId+"']");

				if(forLabel){
					this.questions = [Helpers.getInnerTextOfElement(forLabel)];
				}else
					this.questions = [Dictionary.getAIResponse(this.type)];
			}

			// if questions are empty, then fall back to dictionary
			if(!this.questions || this.questions.length == 0){
				this.questions = [Dictionary.getAIResponse(this.type)];
			}
		}

		private setLabel(){
			// find label..
			if(this.domElement.getAttribute("cf-label")){
				this._label = this.domElement.getAttribute("cf-label");
			}else{
				const parentDomNode: Node = this.domElement.parentNode;
				if(parentDomNode){
					// step backwards and check for label tag.
					let labelTags: NodeListOf<HTMLLabelElement> | Array<HTMLLabelElement> = (<HTMLElement> parentDomNode).getElementsByTagName("label");

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

			if(!this._label)
				this._label = Dictionary.getAIResponse(this.type);
		}
	}
}

