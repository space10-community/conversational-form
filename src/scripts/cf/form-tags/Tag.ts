/// <reference path="../data/Dictionary.ts"/>
/// <reference path="InputTag.ts"/>
/// <reference path="ButtonTag.ts"/>
/// <reference path="SelectTag.ts"/>
/// <reference path="OptionTag.ts"/>
/// <reference path="CfRobotMessageTag.ts"/>
/// <reference path="../ConversationalForm.ts"/>
/// <reference path="../logic/EventDispatcher.ts"/>
/// <reference path="../parsing/TagsParser.ts"/>

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
		id: string,
		label: string,
		question: string,
		errorMessage: string,
		setTagValueAndIsValid(dto: FlowDTO): boolean;
		dealloc(): void;
		refresh(): void;
		reset(): void;
		value:string | Array <string>;
		inputPlaceholder?: string;
		required: boolean;
		defaultValue: string | number;
		disabled: boolean;
		skipUserInput: boolean;
		eventTarget: EventDispatcher;
		flowManager: FlowManager;
		hasConditions():boolean;
		hasConditionsFor(tagName: string):boolean;
		checkConditionalAndIsValid():boolean;

		validationCallback?(dto: FlowDTO, success: () => void, error: (optionalErrorMessage?: string) => void): void;
	}

	export const TagEvents = {
		ORIGINAL_ELEMENT_CHANGED: "cf-tag-dom-element-changed"
	}

	export interface TagChangeDTO{
		tag: ITag,
		value: string
	}

	export interface ConditionalValue{
		key: string,
		conditionals: Array<string | RegExp>
	}

	export interface ITagOptions{
		domElement?: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement,
		questions?: Array<string>,
		label?: string,
		validationCallback?: (dto: FlowDTO, success: () => void, error: () => void) => void,// can be set through cf-validation attribute
	}

	// class
	export class Tag implements ITag {
		private errorMessages: Array<string>;
		private pattern: RegExp;
		private changeCallback: () => void;
		private conditionalTags: Array<ConditionalValue>;

		// input placeholder text, this is for the UserTextInput and not the tag it self.
		protected _inputPlaceholder: string;
		protected _eventTarget: EventDispatcher;
		protected _label: string;
		protected questions: Array<string>; // can also be set through cf-questions attribute.

		public flowManager: FlowManager
		public domElement: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement;
		public defaultValue: string | number;
		public initialDefaultValue: string | number;
		public validationCallback?: (dto: FlowDTO, success: () => void, error: (optionalErrorMessage?: string) => void) => void; // can be set through cf-validation attribute, get's called from FlowManager

		public skipUserInput: boolean; // Used by cf-robot-message which has no input and is just a robot message

		public get type (): string{
			return this.domElement.getAttribute("type") || this.domElement.tagName.toLowerCase();
		}

		public get name (): string{
			return this.domElement.getAttribute("name");
		}

		public get id (): string{
			return this.domElement.getAttribute("id");
		}

		public get inputPlaceholder (): string{
			return this._inputPlaceholder;
		}

		public get formless (): boolean{
			return TagsParser.isElementFormless(this.domElement)
		}

		public get label (): string{
			return this.getLabel();
		}

		public get value (): string | Array<string> {
			return this.domElement.value || <string> this.initialDefaultValue;
		}

		public get hasImage (): boolean{
			return this.domElement.hasAttribute("cf-image");
		}

		public get rows (): number {
			return this.domElement.hasAttribute("rows") ? parseInt(this.domElement.getAttribute("rows")) : 0;
		}

		public get disabled (): boolean{
			// a tag is disabled if its conditions are not meet, also if it contains the disabled attribute
			return !this.checkConditionalAndIsValid() || (this.domElement.getAttribute("disabled") != undefined && this.domElement.getAttribute("disabled") != null);
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

		public set eventTarget(value: EventDispatcher){
			this._eventTarget = value;
		}

		public get errorMessage():string{
			if(!this.errorMessages){
				// custom tag error messages
				if(this.domElement.getAttribute("cf-error")){
					this.errorMessages = Helpers.getValuesOfBars(this.domElement.getAttribute("cf-error"));

				}else if(this.domElement.parentNode && (<HTMLElement> this.domElement.parentNode).getAttribute("cf-error")){
					this.errorMessages = Helpers.getValuesOfBars((<HTMLElement> this.domElement.parentNode).getAttribute("cf-error"));
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
			this.initialDefaultValue = this.domElement.value || this.domElement.getAttribute("value") || "";

			this.changeCallback = this.onDomElementChange.bind(this);
			this.domElement.addEventListener("change", this.changeCallback, false);
			
			// remove tabIndex from the dom element.. danger zone... should we or should we not...
			this.domElement.tabIndex = -1;

			this.skipUserInput = false;

			// questions array
			if(options.questions)
				this.questions = options.questions;

			// custom tag validation - must be a method on window to avoid unsafe eval() calls
			if(this.domElement.getAttribute("cf-validation")){
				const fn = (window as any)[this.domElement.getAttribute("cf-validation")];
				this.validationCallback = fn;
			}

			// reg ex pattern is set on the Tag, so use it in our validation
			if(this.domElement.getAttribute("pattern"))
				this.pattern = new RegExp(this.domElement.getAttribute("pattern"));

			if(this.type != "group" && ConversationalForm.illustrateAppFlow){
				if(!ConversationalForm.suppressLog) console.log('Conversational Form > Tag registered:', this.type, this);
			}

			this.refresh();
		}

		public dealloc(){
			this.domElement.removeEventListener("change", this.changeCallback, false);
			this.changeCallback = null
			this.domElement = null;
			this.defaultValue = null;
			this.errorMessages = null;
			this.pattern = null;
			this._label = null;
			this.validationCallback = null;
			this.questions = null;
		}

		public static testConditions(tagValue: string | string[], condition: ConditionalValue):boolean{
			const testValue = (value: string, conditional: string | RegExp) : boolean => {
				if(typeof conditional === "object"){
					// regex
					return (<RegExp> conditional).test(value);
				}

				// string comparisson
				return <string>tagValue === conditional;
			}

			if(typeof tagValue === "string"){
				// tag value is a string
				const value: string = <string> tagValue;
				let isValid: boolean = false;
				for (var i = 0; i < condition.conditionals.length; i++) {
					var conditional: string | RegExp = condition.conditionals[i];
					isValid = testValue(value, conditional);

					if(isValid) break;
				}
				return isValid;
			}else{
				if(!tagValue){
					return false;
				}else{
					// tag value is an array
					let isValid: boolean = false;
					for (var i = 0; i < condition.conditionals.length; i++) {
						var conditional: string | RegExp = condition.conditionals[i];
						if(typeof tagValue !== "string"){
							for (var j = 0; j < tagValue.length; j++) {
								isValid = testValue(<string>tagValue[j], conditional);
								if(isValid) break;
							}
						}else{
							// string comparisson
							isValid = testValue((<string[]>tagValue).toString(), conditional);
						}

						if(isValid) break;
					}

					return isValid;
				}
				// arrays need to be the same
			}
		}

		public static isTagValid(element: HTMLElement):boolean{
			if(element.getAttribute("type") === "hidden")
				return false;

			if(element.getAttribute("type") === "submit")
				return false;

			// ignore buttons, we submit the form automatially
			if(element.getAttribute("type") == "button")
				return false;

			if(element.style){
				// element style can be null if markup is created from DOMParser
				if(element.style.display === "none")
					return false;

				if(element.style.visibility === "hidden")
					return false;
			}

			const isTagFormless: boolean = TagsParser.isElementFormless(element);

			const innerText: string = Helpers.getInnerTextOfElement(element);
			if(element.tagName.toLowerCase() == "option" && (!isTagFormless && innerText == "" || innerText == " ")){
				return false;
			}
		
			if(element.tagName.toLowerCase() == "select" || element.tagName.toLowerCase() == "option")
				return true
			else if(isTagFormless){
				return true;
			}else{
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
				}else if(element.tagName.toLowerCase() == "cf-robot-message"){
					tag = new CfRobotMessageTag({
						domElement: element
					});
				}

				return tag;
			}else{
				// console.warn("Tag is not valid!: "+ element);
				return null;
			}
		}

		public reset(){
			this.refresh();

			// this.disabled = false;
			
			// reset to initial value.
			this.defaultValue = this.domElement.value = this.initialDefaultValue.toString();
		}

		public refresh(){
			// default value of Tag, check every refresh
			this.defaultValue = this.domElement.value || this.domElement.getAttribute("value") || "";

			this.questions = null;
			this.findAndSetQuestions();
			this.findConditionalAttributes();
		}

		public hasConditionsFor(tagName: string):boolean{
			if(!this.hasConditions()){
				return false;
			}

			for (var i = 0; i < this.conditionalTags.length; i++) {
				var condition: ConditionalValue = this.conditionalTags[i];
				if("cf-conditional-"+tagName.toLowerCase() === condition.key.toLowerCase()){
					return true;
				}
				
			}

			return false;
		}

		public hasConditions():boolean{
			return this.conditionalTags && this.conditionalTags.length > 0;
		}

		/**
		* @name checkConditionalAndIsValid
		* checks for conditional logic, see documentaiton (wiki)
		* here we check after cf-conditional{-name}, if we find an attribute we look through tags for value, and ignore the tag if
		*/
		public checkConditionalAndIsValid(): boolean {
			// can we tap into disabled
			// if contains attribute, cf-conditional{-name} then check for conditional value across tags
			if(this.hasConditions()){
				return this.flowManager.areConditionsInFlowFullfilled(this, this.conditionalTags);
			}

			// else return true, as no conditional means uncomplicated and happy tag
			return true;
		}

		public setTagValueAndIsValid(dto: FlowDTO):boolean{
			// this sets the value of the tag in the DOM
			// validation
			let isValid: boolean = true;
			let valueText: string = dto.text;

			if (
				this.domElement.hasAttribute('type')
				&& this.domElement.getAttribute('type') === 'email'
				&& !this.pattern
				&& valueText.length > 0
			) {
				this.pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			} else if (
				// When NOT required: Reset in the event user already typed something, and now they clear their input and want to submit nothing ==> remove pattern previously applied
				this.domElement.hasAttribute('type')
				&& this.domElement.getAttribute('type') === 'email'
				&& this.pattern
				&& valueText.length === 0
				&& !this.required
			) {
				this.pattern = null;
			}

			if(this.pattern){
				isValid = this.pattern.test(valueText);
			}

			if(valueText == "" && this.required){
				isValid = false;
			}

			// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-minlength
			const min: number = parseInt(this.domElement.getAttribute("minlength"), 10) || -1;

			// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-maxlength
			const max: number = parseInt(this.domElement.getAttribute("maxlength"), 10) || -1;

			if(min != -1 && valueText.length < min){
				isValid = false;
			}

			if(max != -1 && valueText.length > max){
				isValid = false;
			}

			const isMaxMinValueValid = this.validateMaxMinValue(valueText);
			if (!isMaxMinValueValid) isValid = false;

			if(isValid){
				// we cannot set the dom element value when type is file
				if(this.type != "file")
					this.domElement.value = valueText;
			}

			return isValid;
		}

		/**
		 * Validates value against tag max and min attributes
		 *
		 * @private
		 * @param {string} value
		 * @returns {boolean}
		 * @memberof Tag
		 */
		private validateMaxMinValue(value:string):boolean {
			if (!value) return true;

			const parsedValue:Number = parseInt(value, 10);
			const minValue: number = parseInt(this.domElement.getAttribute("min"), 10) || -1;
			const maxValue: number = parseInt(this.domElement.getAttribute("max"), 10) || -1;
			if (minValue !== -1 && parsedValue < minValue) return false;
			if (maxValue !== -1 && parsedValue > maxValue) return false;

			return true;
		}

		protected getLabel(): string{
			if(!this._label)
				this.findAndSetLabel();

			if(this._label)
				return this._label;

			return Dictionary.getRobotResponse(this.type);
		}

		/**
		* @name findConditionalAttributes
		* look for conditional attributes and map them
		*/
		protected findConditionalAttributes(){
			const keys: any = this.domElement.attributes;
			if(keys.length > 0){
				this.conditionalTags = [];
				
				for (var key in keys) {
					if (keys.hasOwnProperty(key)) {	
						let attr: any = keys[key];
						if(attr && attr.name && attr.name.indexOf("cf-conditional") !== -1){
							// conditional found
							let _conditionals: Array<string | RegExp> = [];
							
							// TODO: when && use to combine multiple values to complete condition.
							let conditionalsFromAttribute: Array<string> = attr.value.indexOf("||") !== -1 ? attr.value.split("||") : attr.value.split("&&");

							for (var i = 0; i < conditionalsFromAttribute.length; i++) {
								var _conditional: string = conditionalsFromAttribute[i];
								try {
									_conditionals.push(new RegExp(_conditional));
								} catch(e) {
								}

								_conditionals.push(_conditional);
							}

							this.conditionalTags.push(<ConditionalValue>{
								key: attr.name,
								conditionals: _conditionals
							});
						}
					}
				}
			}
		}

		protected findAndSetQuestions(){
			if(this.questions)
				return;

			// <label tag with label:for attribute to el:id
			// check for label tag, we only go 2 steps backwards..

			// from standardize markup: http://www.w3schools.com/tags/tag_label.asp

			if(this.domElement.getAttribute("cf-questions")){
				this.questions = Helpers.getValuesOfBars(this.domElement.getAttribute("cf-questions"));
				
				if(this.domElement.getAttribute("cf-input-placeholder"))
					this._inputPlaceholder = this.domElement.getAttribute("cf-input-placeholder");
			}else if(this.domElement.parentNode && (<HTMLElement> this.domElement.parentNode).getAttribute("cf-questions")){
				// for groups the parentNode can have the cf-questions..
				const parent: HTMLElement = (<HTMLElement> this.domElement.parentNode);
				this.questions = Helpers.getValuesOfBars(parent.getAttribute("cf-questions"));
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
					let labelTags: NodeListOf<Element> | Array<Element> = (<HTMLElement> parentDomNode).tagName.toLowerCase() == "label" ? [(<HTMLElement> parentDomNode)] : (<HTMLElement> parentDomNode).getElementsByTagName("label");

					if(labelTags.length == 0){
						// check for innerText
						const innerText: string = Helpers.getInnerTextOfElement((<any>parentDomNode));
						if(innerText && innerText.length > 0)
							labelTags = [(<HTMLLabelElement>parentDomNode)];
						
					}else if(labelTags.length > 0){
						// check for "for" attribute
						for (let i = 0; i < labelTags.length; i++) {
							let label = labelTags[i];
							if(label.getAttribute("for") == this.id){
								this._label = Helpers.getInnerTextOfElement(label);
							}
						}
					}

					if(!this._label && labelTags[0]){
						this._label = Helpers.getInnerTextOfElement(labelTags[0]);
					}
				}
			}
		}

		/**
		* @name onDomElementChange
		* on dom element value change event, ex. w. browser autocomplete mode
		*/
		private onDomElementChange(): void {
			this._eventTarget.dispatchEvent(new CustomEvent(TagEvents.ORIGINAL_ELEMENT_CHANGED, {
				detail: <TagChangeDTO> {
					value: this.value,
					tag: this
				}
			}));
		}
	}
}

