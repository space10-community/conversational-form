/// <reference path="BasicElement.ts"/>
/// <reference path="control-elements/ControlElements.ts"/>
/// <reference path="../logic/FlowManager.ts"/>

// namespace
namespace cf {
	// interface
	// export interface IUserInputOptions extends IBasicElementOptions{

	// }
	
	export interface ControlElementsDTO{
		height: number;
	}

	export const UserInputEvents = {
		SUBMIT: "cf-input-user-input-submit",
		//	detail: string

		KEY_CHANGE: "cf-input-key-change",
		//	detail: string

		CONTROL_ELEMENTS_ADDED: "cf-input-control-elements added",
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

		private controlElements: ControlElements;

		private currentTag: ITag | ITagGroup;

		constructor(options: IBasicElementOptions){
			super(options);

			this.el.setAttribute("placeholder", Dictionary.get("input-placeholder"));
			this.el.addEventListener("keyup", this.onKeyUp.bind(this), false);

			this.inputElement = this.el.getElementsByTagName("input")[0];

			//<cf-input-control-elements> is defined in the ChatList.ts
			this.controlElements = new ControlElements({
				el: <HTMLElement> this.el.getElementsByTagName("cf-input-control-elements")[0]
			})

			// flow update
			this.flowUpdateCallback = this.onFlowUpdate.bind(this);
			document.addEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);

			this.inputInvalidCallback = this.inputInvalid.bind(this);
			document.addEventListener(FlowEvents.USER_INPUT_INVALID, this.inputInvalidCallback, false);

			this.onControlElementSubmitCallback = this.onControlElementSubmit.bind(this);
			document.addEventListener(ControlElementEvents.SUBMIT_VALUE, this.onControlElementSubmitCallback, false);

			const submitButton: HTMLButtonElement = <HTMLButtonElement> this.el.getElementsByClassName("cf-input-button")[0];
			this.onSubmitButtonClickCallback = this.onSubmitButtonClick.bind(this);
			submitButton.addEventListener("click", this.onSubmitButtonClickCallback, false);
		}

		public getInputValue():string | ITag{
			let value: string | ITag = this.inputElement.value;

			// check for values on control elements as they should overwrite the input value.
			if(this.controlElements && this.controlElements.active){
				value = this.controlElements.getValue();
			}

			return value;
		}

		private onSubmitButtonClick(event: MouseEvent){
			this.doSubmit();
		}

		private inputInvalid(event: CustomEvent){
			ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);

			this.el.setAttribute("error", "");
			this.el.setAttribute("disabled", "disabled");
			this.inputElement.setAttribute("placeholder", Dictionary.get("input-placeholder-error"));
			clearTimeout(this.errorTimer);

			this.errorTimer = setTimeout(() => {
				this.el.removeAttribute("disabled");
				this.el.removeAttribute("error");
				this.inputElement.setAttribute("placeholder", Dictionary.get("input-placeholder"));
				this.inputElement.focus();
			}, 2000);
		}

		private onFlowUpdate(event: CustomEvent){
			ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);

			clearTimeout(this.errorTimer);
			this.el.removeAttribute("error");
			this.inputElement.setAttribute("placeholder", Dictionary.get("input-placeholder"));
			this.resetValue();
			this.inputElement.focus();
			this.controlElements.reset();

			this.currentTag = <ITag | ITagGroup> event.detail;
			if(this.currentTag.type == "group"){
				//TODO: The buildControlElements should be chained together with AI Reponse.
				console.log('UserInput > currentTag is a group of types:', (<ITagGroup> this.currentTag).elements[0].type);
				this.buildControlElements((<ITagGroup> this.currentTag).elements);
			}else{
				//TODO: The buildControlElements should be chained together with AI Reponse.
				console.log('UserInput > currentTag type:', this.currentTag.type);
				this.buildControlElements([this.currentTag]);
			}

			setTimeout(() => {
				this.el.removeAttribute("disabled");
			}, 1000)
		}

		private buildControlElements(tags: Array<ITag>){
			this.controlElements.buildTags(tags);
		}

		private onControlElementSubmit(event: CustomEvent){
			ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);

			// when ex a RadioButton is clicked..
			const controlElement: IControlElement = <IControlElement> event.detail;

			this.controlElements.updateStateOnElements(controlElement);

			this.doSubmit();
		}

		private onKeyUp(event: KeyboardEvent){
			const value: string | ITag = this.getInputValue();

			if(event.keyCode == 13){
				// ENTER key

				if(this.currentTag.type != "group"){
					// for NONE groups
					this.doSubmit();
				}else{
					// for groups, we expect that there is always a default value set
					this.doSubmit();
				}
			}else{
				ConversationalForm.illustrateFlow(this, "dispatch", UserInputEvents.KEY_CHANGE, value);
				document.dispatchEvent(new CustomEvent(UserInputEvents.KEY_CHANGE, {
					detail: value
				}));

				// if(this.currentTag.type == "group" && this.controlElements.length > 0){
				// 	// filter this.controlElements.........
				// 	console.log('filter control elements:', this.controlElements);
				// 	console.log('with value:',value);
				// }
			}
		}

		private doSubmit(){
			const value: string | ITag = this.getInputValue();

			this.el.setAttribute("disabled", "disabled");
			this.el.removeAttribute("error");

			ConversationalForm.illustrateFlow(this, "dispatch", UserInputEvents.SUBMIT, value);
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

			const submitButton: HTMLButtonElement = <HTMLButtonElement> this.el.getElementsByClassName("cf-input-button")[0];
			submitButton.removeEventListener("click", this.onSubmitButtonClickCallback, false);
			this.onSubmitButtonClickCallback = null;

			super.remove();
		}

		// override
		public getTemplate () : string {
			return `<cf-input>
				<cf-input-control-elements>
					<cf-list-button>
					</cf-list-button>
					<cf-list-button>
					</cf-list-button>
					<cf-list>
					</cf-list>
				</cf-input-control-elements>
				<button class="cf-input-button"><svg viewBox="0 0 24 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g fill="#B9BCBE"><polygon transform="translate(12.257339, 11.185170) rotate(90.000000) translate(-12.257339, -11.185170) " points="10.2587994 9.89879989 14.2722074 5.85954869 12.4181046 3.92783101 5.07216899 11.1851701 12.4181046 18.4425091 14.2722074 16.5601737 10.2587994 12.5405503 19.4425091 12.5405503 19.4425091 9.89879989"></polygon></g></g></svg></button>
				<input type='input'>
			</cf-input>
			`;
		}
	}
}