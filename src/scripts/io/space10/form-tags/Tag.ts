/// <reference path="../data/Dictionary.ts"/>

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
		el?: HTMLInputElement | HTMLSelectElement | HTMLButtonElement,
		type: string,
		name: string,
		title: string,
		question: string,
	}

	export interface ITagOptions{
		el?: HTMLInputElement | HTMLSelectElement | HTMLButtonElement,
		questions?: Array<string>,
		validationCallback?: (value: string) => boolean,// can also be set through cui-validation attribute
	}

	// class
	export class Tag implements ITag {
		public el: HTMLInputElement | HTMLSelectElement | HTMLButtonElement;
		
		protected defaultValue: string | number;
		
		private pattern: RegExp;

		private validationCallback?: (value: string) => boolean; // can also be set through cui-validation attribute.
		private questions: Array<string>; // can also be set through cui-questions attribute.

		public get type (): string{
			return this.el.getAttribute("type");
		}

		public get name (): string{
			return this.el.getAttribute("name");
		}
		
		public get title (): string{
			return this.el.getAttribute("title");
		}

		public get question():string{
			if(this.questions){
				return this.questions[Math.floor(Math.random() * this.questions.length)];
			}else{
				// fallback to ai response from dictionary
				const aiReponse: string = Dictionary.getAIResponse(this.type);
				return aiReponse;
			}
		}

		constructor(options: ITagOptions){
			this.el = options.el;

			// map questions to Tag
			if(this.el.getAttribute("cui-questions")){
				this.questions = this.el.getAttribute("cui-questions").split("|");
			}else if(options.questions){
				this.questions = options.questions;
			}else{
				// TODO: look for label..
				// if no cui-questions then a look for:
				// <label tag with label:for attribute to input:id
				// check: label > for : id
			}
			
			// custom validation
			if(this.validationCallback){
				this.validationCallback = options.validationCallback;
			}else if(this.el.getAttribute("cui-validation")){
				// set it through an attribute, danger land with eval
				this.validationCallback = eval(this.el.getAttribute("cui-validation"));
			}

			// reg ex pattern is set on the Tag
			if(this.el.getAttribute("pattern"))
				this.pattern = new RegExp(this.el.getAttribute("pattern"));

			// default value of Tag
			this.defaultValue = this.el.value;
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

		protected setValue(value: string | number){
			// validation?
			let isValid: boolean = true;
			if(this.pattern){
				isValid = this.pattern.test(value.toString());
			}
			if(isValid && this.validationCallback){
				isValid = this.validationCallback(value.toString());
			}
			console.log(this, 'set value -> value:', value);
			console.log(this, 'set value -> isValid:', isValid);

			if(isValid){
				this.el.value = value.toString();
			}else{
				throw new Error("s10-cui: value:string is not valid. Value: "+value);
			}
		}
	}
}

