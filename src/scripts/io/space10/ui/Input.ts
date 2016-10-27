/// <reference path="Button.ts"/>
/// <reference path="../Space10CUI.ts"/>
/// <reference path="../logic/FlowManager.ts"/>

// namespace
namespace io.space10 {
	// interface
	// export interface IInputOptions extends IBasicElementOptions{

	// }

	export const InputEvents = {
		UPDATE: "cui-input-user-input-update",
		KEY_CHANGE: "cui-input-key-change",
	}

	
	// class
	export class Input extends io.space10.BasicElement {
		public el: Element;
		private flowUpdateCallback: () => void;
		private inputInvalidCallback: () => void;

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
			this.el.removeAttribute("disabled");
			(<HTMLInputElement> this.el).focus();
		}

		private onFlowUpdate(event: CustomEvent){
			this.el.removeAttribute("disabled");
			(<HTMLInputElement> this.el).focus();
		}

		private onKeyUp(event: KeyboardEvent){
			if(event.keyCode == 13){
				// enter

				this.el.setAttribute("disabled", "disabled");

				// TODO: validate input ..
				document.dispatchEvent(new CustomEvent(io.space10.InputEvents.UPDATE, {
					detail: this.getValue()
				}));

				this.resetValue();
			}else{
				document.dispatchEvent(new CustomEvent(io.space10.InputEvents.KEY_CHANGE, {
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