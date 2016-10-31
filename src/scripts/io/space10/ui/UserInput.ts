/// <reference path="BasicElement.ts"/>
/// <reference path="control-elements/Button.ts"/>
/// <reference path="control-elements/RadioButton.ts"/>
/// <reference path="control-elements/CheckboxButton.ts"/>
/// <reference path="../logic/FlowManager.ts"/>

// namespace
namespace io.space10 {
	// interface
	// export interface IUserInputOptions extends IBasicElementOptions{

	// }
	
	export interface ControlElementsDTO{
		height: number;
	}

	export const UserInputEvents = {
		SUBMIT: "cui-input-user-input-submit",
		//	detail: string

		KEY_CHANGE: "cui-input-key-change",
		//	detail: string

		CONTROL_ELEMENTS_ADDED: "cui-input-control-elements added",
		//	detail: string
	}

	// class
	export class UserInput extends BasicElement {
		public el: HTMLElement;

		private inputElement: HTMLInputElement;
		private flowUpdateCallback: () => void;
		private inputInvalidCallback: () => void;
		private onControlElementSubmitCallback: () => void;
		private onSubmitButtonClickCallback: () => void;
		private errorTimer: number = 0;
		private controlElements: Array<ControlElement>;
		private controlElementsElement: HTMLElement;

		private currentTag: ITag | ITagGroup;

		constructor(options: IBasicElementOptions){
			super(options);

			this.el.setAttribute("placeholder", Dictionary.get("input-placeholder"));
			this.el.addEventListener("keyup", this.onKeyUp.bind(this), false);

			this.inputElement = this.el.getElementsByTagName("input")[0];

			//<s10cui-input-control-elements> is defined in the ChatList.ts
			this.controlElementsElement = <HTMLElement> this.el.getElementsByTagName("s10cui-input-control-elements")[0];
			// console.log("======", document.getElementById("s10-cui"))

			// flow update
			this.flowUpdateCallback = this.onFlowUpdate.bind(this);
			document.addEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);

			this.inputInvalidCallback = this.inputInvalid.bind(this);
			document.addEventListener(FlowEvents.USER_INPUT_INVALID, this.inputInvalidCallback, false);

			this.onControlElementSubmitCallback = this.onControlElementSubmit.bind(this);
			document.addEventListener(ControlElementEvents.SUBMIT_VALUE, this.onControlElementSubmitCallback, false);

			const submitButton: HTMLButtonElement = <HTMLButtonElement> this.el.getElementsByClassName("s10cui-input-button")[0];
			this.onSubmitButtonClickCallback = this.onSubmitButtonClick.bind(this);
			submitButton.addEventListener("click", this.onSubmitButtonClickCallback, false);
		}

		public getInputValue():string{
			let value: string | Array<string> = this.inputElement.value;
			if(this.controlElements && this.controlElements.length > 0 && this.controlElements[0].type == "CheckboxButton"){
				value = [];
				for (var i = 0; i < this.controlElements.length; i++) {
					var element: CheckboxButton = <CheckboxButton> this.controlElements[i];
					if(element.checked)
						value.push(element.value);
				}

				value = value.join(", ");
			}
			return value;
		}

		private onSubmitButtonClick(event: MouseEvent){
			this.doSubmit();
		}

		private inputInvalid(event: CustomEvent){
			Space10CUI.illustrateFlow(this, "receive", event.type, event.detail);

			this.inputElement.setAttribute("error", "");
			this.inputElement.setAttribute("disabled", "disabled");
			this.inputElement.setAttribute("placeholder", Dictionary.get("input-placeholder-error"));
			clearTimeout(this.errorTimer);

			this.errorTimer = setTimeout(() => {
				this.inputElement.removeAttribute("disabled");
				this.inputElement.removeAttribute("error");
				this.inputElement.setAttribute("placeholder", Dictionary.get("input-placeholder"));
				this.inputElement.focus();
			}, 2000);
		}

		private onFlowUpdate(event: CustomEvent){
			Space10CUI.illustrateFlow(this, "receive", event.type, event.detail);

			clearTimeout(this.errorTimer);
			this.inputElement.removeAttribute("error");
			this.inputElement.removeAttribute("disabled");
			this.inputElement.setAttribute("placeholder", Dictionary.get("input-placeholder"));
			this.resetValue();
			this.inputElement.focus();

			this.currentTag = <ITag | ITagGroup> event.detail;
			if(this.currentTag.type == "group"){
				console.log('UserInput > currentTag is a group of types:', (<ITagGroup> this.currentTag).elements[0].type);
				this.buildControlElements((<ITagGroup> this.currentTag).elements);
			}else{
				console.log('UserInput > currentTag type:', this.currentTag.type);
				this.buildControlElements([this.currentTag]);
			}
		}

		private buildControlElements(tags: Array<ITag>){
			// remove old elements
			if(this.controlElements){
				while(this.controlElements.length > 0)
					this.controlElementsElement.removeChild(this.controlElements.pop().el);
			}

			this.controlElements = [];

			for (var i = 0; i < tags.length; i++) {
				var tag: ITag = tags[i];
				
				// console.log(this, 'UserInput > tag.type:', tag.type);
				switch(tag.type){
					case "radio" :
						this.controlElements.push(new RadioButton({
							referenceTag: tag
						}));
						break;
					case "checkbox" :
						// TODO: add checkbox tag..
						this.controlElements.push(new CheckboxButton({
							referenceTag: tag
						}));
						console.log("UserInput buildControlElements:", "checkbox");
						break;
					case "select" :
						// TODO: add select sub tag..
						console.log("UserInput buildControlElements:", "select list");
						break;
					default :
						// nothing to add.
						console.log("UserInput buildControlElements:", "none Control UI type, only input field is needed.");
						break;
				}

				const element: IBasicElement = this.controlElements[this.controlElements.length - 1];
				if(element)
					this.controlElementsElement.appendChild(element.el);
			}

			const controlElementsAddedDTO: ControlElementsDTO = {
				height: this.controlElementsElement.offsetHeight,
			};

			Space10CUI.illustrateFlow(this, "dispatch", UserInputEvents.CONTROL_ELEMENTS_ADDED, controlElementsAddedDTO);
			document.dispatchEvent(new CustomEvent(UserInputEvents.CONTROL_ELEMENTS_ADDED, {
				detail: controlElementsAddedDTO
			}));
		}

		private onControlElementSubmit(event: CustomEvent){
			Space10CUI.illustrateFlow(this, "receive", event.type, event.detail);

			// when ex a RadioButton is clicked..
			const tag: ITag = event.detail;

			Space10CUI.illustrateFlow(this, "dispatch", UserInputEvents.SUBMIT, tag);
			document.dispatchEvent(new CustomEvent(UserInputEvents.SUBMIT, {
				detail: tag
			}));
		}

		private onKeyUp(event: KeyboardEvent){
			const value: string = this.getInputValue();

			if(event.keyCode == 13){
				// ENTER key

				if(this.currentTag.type != "group"){
					// for NONE groups
					this.doSubmit();
				}else{
					// TODO: When a group and enter is pressed?
					// check if value has been choose? Can submit without any values..
				}
			}else{
				Space10CUI.illustrateFlow(this, "dispatch", UserInputEvents.KEY_CHANGE, value);
				document.dispatchEvent(new CustomEvent(UserInputEvents.KEY_CHANGE, {
					detail: value
				}));

				if(this.currentTag.type == "group" && this.controlElements.length > 0){
					// filter this.controlElements.........
					console.log('filter control elements:', this.controlElements);
					console.log('with value:',value);
				}
			}
		}

		private doSubmit(){
			const value: string = this.getInputValue();

			this.inputElement.setAttribute("disabled", "disabled");

			Space10CUI.illustrateFlow(this, "dispatch", UserInputEvents.SUBMIT, value);
			document.dispatchEvent(new CustomEvent(UserInputEvents.SUBMIT, {
				detail: value
			}));
		}

		private resetValue(){
			this.inputElement.value = "";
		}

		public remove(){
			document.removeEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);
			this.flowUpdateCallback = null;

			document.removeEventListener(FlowEvents.USER_INPUT_INVALID, this.inputInvalidCallback, false);
			this.inputInvalidCallback = null;

			document.removeEventListener(ControlElementEvents.SUBMIT_VALUE, this.onControlElementSubmitCallback, false);
			this.onControlElementSubmitCallback = null;

			const submitButton: HTMLButtonElement = <HTMLButtonElement> this.el.getElementsByClassName("s10cui-input-button")[0];
			submitButton.removeEventListener("click", this.onSubmitButtonClickCallback, false);
			this.onSubmitButtonClickCallback = null;

			super.remove();
		}

		// override
		public getTemplate () : string {
			return `<s10cui-input>
				<s10cui-input-control-elements></s10cui-input-control-elements>
				<button class="s10cui-input-button"><svg viewBox="0 0 24 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g fill="#B9BCBE"><polygon transform="translate(12.257339, 11.185170) rotate(90.000000) translate(-12.257339, -11.185170) " points="10.2587994 9.89879989 14.2722074 5.85954869 12.4181046 3.92783101 5.07216899 11.1851701 12.4181046 18.4425091 14.2722074 16.5601737 10.2587994 12.5405503 19.4425091 12.5405503 19.4425091 9.89879989"></polygon></g></g></svg></button>
				<input type='input'>
			</s10cui-input>
			`;
		}
	}
}