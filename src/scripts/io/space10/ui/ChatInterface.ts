/// <reference path="Button.ts"/>
/// <reference path="../Space10CUI.ts"/>


// namespace
namespace io.space10 {
	// interface

	// class
	export class ChatInterface extends io.space10.BasicElement {
		constructor(options: IBasicElementOptions){
			super(options);

			console.log(this, 'el:', this.el);
		}

		public getTemplate () : string {
			return `<div class='s10cui-chat' type='pluto'>
						Chat!!!
					</div>`;
		}
	}
}

