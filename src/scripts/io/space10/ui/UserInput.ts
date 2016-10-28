/// <reference path="BasicElement.ts"/>
/// <reference path="control-elements/Button.ts"/>
/// <reference path="control-elements/RadioButton.ts"/>
/// <reference path="../logic/FlowManager.ts"/>

// namespace
namespace io.space10 {
	// interface
	// export interface IUserInputOptions extends IBasicElementOptions{

	// }

	export const UserInputEvents = {
		SUBMIT: "cui-input-user-input-submit",
		KEY_CHANGE: "cui-input-key-change",
	}

	// class
	export class UserInput extends io.space10.BasicElement {
		public el: Element;

		private inputElement: HTMLInputElement;
		private flowUpdateCallback: () => void;
		private inputInvalidCallback: () => void;
		private onControlElementSubmitCallback: () => void;
		private errorTimer: number = 0;
		private controlElements: Array<IBasicElement>;
		private controlElementsElement: Element;

		private currentTag: io.space10.ITag | io.space10.ITagGroup;

		constructor(options: IBasicElementOptions){
			super(options);

			this.el.setAttribute("placeholder", Dictionary.get("input-placeholder"));
			this.el.addEventListener("keyup", this.onKeyUp.bind(this), false);

			this.inputElement = this.el.getElementsByTagName("input")[0];

			//<s10cui-input-control-elements> is defined in the ChatList.ts
			this.controlElementsElement = document.getElementById("s10-cui-element").getElementsByTagName("s10cui-input-control-elements")[0];
			// console.log("======", document.getElementById("s10-cui"))

			// flow update
			this.flowUpdateCallback = this.onFlowUpdate.bind(this);
			document.addEventListener(io.space10.FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);

			this.inputInvalidCallback = this.inputInvalid.bind(this);
			document.addEventListener(io.space10.FlowEvents.USER_INPUT_INVALID, this.inputInvalidCallback, false);

			this.onControlElementSubmitCallback = this.onControlElementSubmit.bind(this);
			document.addEventListener(io.space10.BasicControlElementEvents.SUBMIT_VALUE, this.onControlElementSubmitCallback, false);
		}

		public getInputValue():string{
			return this.inputElement.value;
		}

		private inputInvalid(event: CustomEvent){
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
			clearTimeout(this.errorTimer);
			this.inputElement.removeAttribute("error");
			this.inputElement.removeAttribute("disabled");
			this.inputElement.setAttribute("placeholder", Dictionary.get("input-placeholder"));
			this.resetValue();
			this.inputElement.focus();

			this.currentTag = <io.space10.ITag | io.space10.ITagGroup> event.detail;
			// TODO: Show UI according to what kind of tag it is..
			if(this.currentTag.type == "group"){
				console.log('UserInput > currentTag is a group of types:', (<io.space10.ITagGroup> this.currentTag).elements[0].type);
				this.buildControlElements((<io.space10.ITagGroup> this.currentTag).elements);
			}else{
				console.log('UserInput > currentTag type:', this.currentTag.type);
				this.buildControlElements([this.currentTag]);
			}
		}

		private buildControlElements(tags: Array<io.space10.ITag>){
			// remove old elements
			if(this.controlElements){
				while(this.controlElements.length > 0)
					this.controlElementsElement.removeChild(this.controlElements.pop().el);
			}

			this.controlElements = [];

			for (var i = 0; i < tags.length; i++) {
				var tag: io.space10.ITag = tags[i];
				
				// console.log(this, 'UserInput > tag.type:', tag.type);
				switch(tag.type){
					case "radio" :
						this.controlElements.push(new RadioButton({
							referenceTag: tag
						}));
						break;
					case "checkbox" :
						// TODO: add checkbox tag..
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

				const element: io.space10.IBasicElement = this.controlElements[this.controlElements.length - 1];
				if(element)
					this.controlElementsElement.appendChild(element.el);
			}
		}

		private onControlElementSubmit(event: CustomEvent){
			// when ex a RadioButton is clicked..
			var tag: io.space10.ITag = event.detail;
			console.log('UserInput onControlElementSubmit:', tag);

			document.dispatchEvent(new CustomEvent(io.space10.UserInputEvents.SUBMIT, {
				detail: tag
			}));
		}

		private onKeyUp(event: KeyboardEvent){
			if(event.keyCode == 13){
				// ENTER key

				if(this.currentTag.type != "group"){
					// for NONE groups
					this.inputElement.setAttribute("disabled", "disabled");

					document.dispatchEvent(new CustomEvent(io.space10.UserInputEvents.SUBMIT, {
						detail: this.getInputValue()
					}));
				}else{
					// TODO: When a group and enter is pressed?
					// check if value has been choose? Can submit without any values..
				}
			}else{
				document.dispatchEvent(new CustomEvent(io.space10.UserInputEvents.KEY_CHANGE, {
					detail: this.getInputValue()
				}));

				if(this.currentTag.type == "group" && this.controlElements.length > 0){
					// filter this.controlElements.........
					console.log('filter control elements:', this.controlElements);
					console.log('with value:', this.getInputValue());
				}
			}
		}

		private resetValue(){
			this.inputElement.value = "";
		}

		// override
		public getTemplate () : string {
			return `<s10cui-input>
				<input type='input'>
			</s10cui-input>
			`;
		}
	}
}