/// <reference path="../BasicElement.ts"/>

// namespace
namespace io.space10 {
	// interface

	// class
	export class Button extends io.space10.BasicElement {
		constructor(options: IBasicElementOptions){
			super(options);


		}

		// override
		public getTemplate () : string {
			return `<s10cui-button>
				button...
			</s10cui-button>
			`;
		}
	}
}

