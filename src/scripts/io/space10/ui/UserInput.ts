/// <reference path="../Space10CUI.ts"/>
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
		private flowUpdateCallback: () => void;
		private inputInvalidCallback: () => void;
		private errorTimer: number = 0;

		constructor(options: IBasicElementOptions){
			super(options);

			this.el.setAttribute("placeholder", Dictionary.get("input-placeholder"));
			this.el.addEventListener("keyup", this.onKeyUp.bind(this), false);

			// flow update
			this.flowUpdateCallback = this.onFlowUpdate.bind(this);
			document.addEventListener(io.space10.FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);

			this.inputInvalidCallback = this.inputInvalid.bind(this);
			document.addEventListener(io.space10.FlowEvents.USER_INPUT_INVALID, this.inputInvalidCallback, false);
		}

		public getValue():string{
			return (<HTMLInputElement> this.el).value;
		}

		private inputInvalid(event: CustomEvent){
			this.el.setAttribute("error", "");
			this.el.setAttribute("disabled", "disabled");
			this.el.setAttribute("placeholder", Dictionary.get("input-placeholder-error"));
			clearTimeout(this.errorTimer);

			this.errorTimer = setTimeout(() => {
				this.el.removeAttribute("disabled");
				this.el.removeAttribute("error");
				this.el.setAttribute("placeholder", Dictionary.get("input-placeholder"));
				(<HTMLInputElement> this.el).focus();
			}, 2000);
		}

		private onFlowUpdate(event: CustomEvent){
			clearTimeout(this.errorTimer);
			this.el.removeAttribute("error");
			this.el.removeAttribute("disabled");
			this.el.setAttribute("placeholder", Dictionary.get("input-placeholder"));
			this.resetValue();
			(<HTMLInputElement> this.el).focus();

			const currentTag: io.space10.ITag | io.space10.ITagGroup = <io.space10.ITag | io.space10.ITagGroup> event.detail;
			// TODO: Show UI according to what kind of tag it is..
			if(currentTag.type == "group")
				console.log('UserInput > currentTag type:', (<io.space10.ITagGroup> currentTag).elements[0].type);
			else
				console.log('UserInput > currentTag type:', currentTag.type);
		}

		private onKeyUp(event: KeyboardEvent){
			if(event.keyCode == 13){
				// enter
				this.el.setAttribute("disabled", "disabled");

				// TODO: validate input ..
				document.dispatchEvent(new CustomEvent(io.space10.UserInputEvents.SUBMIT, {
					detail: this.getValue()
				}));
			}else{
				document.dispatchEvent(new CustomEvent(io.space10.UserInputEvents.KEY_CHANGE, {
					detail: this.getValue()
				}));
			}
		}

		private resetValue(){
			(<HTMLInputElement> this.el).value = "";
		}

		// override
		public getTemplate () : string {
			return `<input class='s10cui-input' type='input'>`;
		}
	}
}