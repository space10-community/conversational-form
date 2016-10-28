/// <reference path="Button.ts"/>

// namespace
namespace io.space10 {
	// interface

	// class
	export class RadioButton extends io.space10.Button {
		constructor(options: IBasicElementOptions){
			super(options);


		}

		// override
		public getTemplate () : string {
			return `<s10cui-radio-button>
				radio button...
			</s10cui-radio-button>
			`;
		}
	}
}

