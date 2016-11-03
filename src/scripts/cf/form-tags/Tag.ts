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
		title: string,
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
		private _title: string;

		private validationCallback?: (value: string) => boolean; // can also be set through cf-validation attribute.
		private questions: Array<string>; // can also be set through cf-questions attribute.

		public get type (): string{
			return this.domElement.getAttribute("type");
		}

		public get name (): string{
			return this.domElement.getAttribute("name");
		}

		public get title (): string{
			if(!this._title){
				this._title = this.domElement.getAttribute("title");
			}

			return this._title;
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
			if(!Tag.isTagValid(options.domElement)){
				return;
			}

			this.domElement = options.domElement;

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
			// TODO: Handle deallocation of element
		}

		public static isTagValid(element: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement):boolean{
			if(element.getAttribute("type") === "hidden")
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
			else
				return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
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


			if(this.domElement.getAttribute("cf-questions")){
				this.questions = this.domElement.getAttribute("cf-questions").split("|");
			}else{
				// questions not set, so find it in the DOM
				const parentDomNode: Node = this.domElement.parentNode;
				if(parentDomNode){
					const elId: string = this.domElement.getAttribute("id");
					// step backwards and check for label tag.
					let labelTags: NodeListOf<HTMLLabelElement> | Array<HTMLLabelElement> = (<HTMLElement> parentDomNode).getElementsByTagName("label");

					if(labelTags.length == 0){
						// check for innerText
						const innerText: string = Helpers.getInnerTextOfElement((<any>parentDomNode));
						if(innerText && innerText.length > 0)
							labelTags = [(<HTMLLabelElement>parentDomNode)];
					}

					if(labelTags.length > 0){
						// if <label> are found then add them to the questions array
						this.questions = [];
						for (var i = 0; i < labelTags.length; i++) {
							var label: HTMLLabelElement = labelTags[i];
							if(elId && (elId && label.getAttribute("for") == elId)){
								this.questions.push(Helpers.getInnerTextOfElement(label));
							}
						}
					}else{
						// no labelTags found, so set default
						this.questions = [Dictionary.getAIResponse(this.type)];
					}

					// if title is not set from the title attribute then set it to the label...
					if(!this._title){
						// checl first for optional label set on the Tag
						if(this.domElement.getAttribute("cf-label"))
							this._title = this.domElement.getAttribute("cf-label");
						else
							this._title = this.questions && this.questions.length > 0 ? this.questions[0] : Helpers.getInnerTextOfElement(labelTags[0]);
					}
				}
			}

			if(!this.questions || this.questions.length == 0){
				this.questions = [Dictionary.getAIResponse(this.type)];
			}
		}
	}
}

