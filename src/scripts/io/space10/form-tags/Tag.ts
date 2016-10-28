/// <reference path="../data/Dictionary.ts"/>
/// <reference path="InputTag.ts"/>
/// <reference path="ButtonTag.ts"/>
/// <reference path="SelectTag.ts"/>

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
namespace io.space10 {
	// interface
	export interface ITag{
		domElement?: HTMLInputElement | HTMLSelectElement | HTMLButtonElement,
		type: string,
		name: string,
		title: string,
		question: string,
		setTagValueAndIsValid(value: string | ITag):boolean;

		value:string;
	}

	export interface ITagOptions{
		domElement?: HTMLInputElement | HTMLSelectElement | HTMLButtonElement,
		questions?: Array<string>,
		label?: string,
		validationCallback?: (value: string) => boolean,// can also be set through cui-validation attribute
	}

	// class
	export class Tag implements ITag {
		public domElement: HTMLInputElement | HTMLSelectElement | HTMLButtonElement;
		
		protected defaultValue: string | number;
		
		private pattern: RegExp;
		private _title: string;

		private validationCallback?: (value: string) => boolean; // can also be set through cui-validation attribute.
		private questions: Array<string>; // can also be set through cui-questions attribute.

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

		constructor(options: ITagOptions){
			if(!Tag.isTagValid(options.domElement)){
				return;
			}

			this.domElement = options.domElement;

			// questions array
			if(options.questions)
				this.questions = options.questions;

			
			// custom validation
			if(this.validationCallback){
				this.validationCallback = options.validationCallback;
			}else if(this.domElement.getAttribute("cui-validation")){
				// set it through an attribute, danger land with eval
				this.validationCallback = eval(this.domElement.getAttribute("cui-validation"));
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

		public static isTagValid(element: HTMLInputElement | HTMLSelectElement | HTMLButtonElement):boolean{
			if(element.getAttribute("type") === "hidden")
				return false;

			if(element.style.display === "none")
				return false;
			
			if(element.style.visibility === "hidden")
				return false;

			
			if(element.tagName.toLowerCase() == "select")
				return true
			else
				return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
		}

		public static createTag(options: ITagOptions): ITag{
			const element: HTMLInputElement | HTMLSelectElement | HTMLButtonElement = options.domElement;
			if(Tag.isTagValid(element)){
				// ignore hidden tags
				let tag: ITag;
				if(element.tagName.toLowerCase() == "input"){
					tag = new InputTag({
						domElement: element
						// validationCallback
						// questions: Array<String>
					});
				}else if(element.tagName.toLowerCase() == "select"){
					tag = new SelectTag({
						domElement: element
						// validationCallback
						// questions: Array<String>
					});
				}else if(element.tagName.toLowerCase() == "button"){
					tag = new ButtonTag({
						domElement: element
						// validationCallback
						// questions: Array<String>
					});
				}

				return tag;
			}else{
				// console.warn("Tag is not valid!: "+ element);
				return null;
			}

		}

		public setTagValueAndIsValid(value: string | ITag):boolean{
			// this sets the value of the tag in the DOM
			// validation
			let isValid: boolean = true;
			if(this.pattern){
				isValid = this.pattern.test(value.toString());
			}

			if(isValid && this.validationCallback){
				isValid = this.validationCallback(value.toString());
			}

			if(value == ""){
				isValid = false;
			}

			// console.log(this, 'set value -> value:', value);
			// console.log(this, 'set value -> isValid:', isValid);

			if(isValid){
				this.domElement.value = value.toString();
			}else{
				// throw new Error("s10-cui: value:string is not valid. Value: "+value);
			}

			return isValid;
		}

		private findLabelAndSetQuestions(){
			if(this.questions)
				return;

			// <label tag with label:for attribute to el:id
			// check for label tag, we only go 2 steps backwards..

			// from standardize markup: http://www.w3schools.com/tags/tag_label.asp


			if(this.domElement.getAttribute("cui-questions")){
				this.questions = this.domElement.getAttribute("cui-questions").split("|");
			}else{
				// questions not set, so find

				// TODO: clean up the logic
				const elId: string = this.domElement.getAttribute("id");
				if(this.domElement.parentNode){
					// step backwards and check for label tag.
					let labels: NodeListOf<HTMLLabelElement> | Array<HTMLLabelElement> = (<HTMLElement> this.domElement.parentNode).getElementsByTagName("label");

					if(labels.length == 0){
						// check if innerText..
						let innerText: string = (<any>this.domElement.parentNode).innerText;
						
						// step backwards and check for label tag.
						if(innerText && innerText.length > 0)
							labels = [(<HTMLLabelElement>this.domElement.parentNode)];
					}

					if(labels.length > 0){
						this.questions = [];
						for (var i = 0; i < labels.length; i++) {
							var label: HTMLLabelElement = labels[i];
							if(elId && (elId && label.getAttribute("for") == elId)){
								this.questions.push(label.innerText);
							}
						}
					}else{
						// we don't set a default value for questions as this will result in a fallback response from Dictionary
						this.questions = [Dictionary.getAIResponse(this.type)];
					}

					// if title is not set from the title attribute then set it to the label...
					if(!this._title){
						this._title = this.questions && this.questions.length > 0 ? this.questions[0] : labels[0].innerText;
					}
				}
			}

			if(!this.questions || this.questions.length == 0){
				this.questions = [Dictionary.getAIResponse(this.type)];
			}
		}
	}
}

