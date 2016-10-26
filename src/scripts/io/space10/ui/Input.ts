/// <reference path="Button.ts"/>
/// <reference path="../Space10CUI.ts"/>
/// <reference path="../logic/FlowManager.ts"/>

// namespace
namespace io.space10 {
	// interface
	// export interface IInputOptions extends IBasicElementOptions{

	// }
	
	// class
	export class Input extends io.space10.BasicElement {

		public el: Element;

		constructor(options: IBasicElementOptions){
			super(options);

			this.el.setAttribute("placeholder", Dictionary.get("input-placeholder"));
			this.el.addEventListener("keyup", this.onKeyUp.bind(this), false);

			console.log("this.el", this, this.el);
		}

		private onKeyUp(event: KeyboardEvent){
			if(event.keyCode == 13){
				// enter pressed
				this.flowManager.nextStep();
			}
		}

		// override
		public getTemplate () : string {
			return `<input class='s10cui-input' type='input'>
					yessss
					mere multiline...
				</input>`;
		}
	}
}