/// <reference path="../Space10CUI.ts"/>

// namespace
namespace io.space10 {
	// interface
	export interface IButtonOptions extends IBasicElementOptions{

	}

	// class
	export class Button extends io.space10.BasicElement {

		constructor(options: IButtonOptions){
			super(options);
		}

		// template, can be overwritten ...
		public getTemplate () : string {
			return `<button>
				yessss
				mere multiline...
			</button>`;
		}
	}
}