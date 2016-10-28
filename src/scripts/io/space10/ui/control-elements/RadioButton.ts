/// <reference path="Button.ts"/>

// namespace
namespace io.space10 {
	// interface

	// class
	export class RadioButton extends io.space10.Button {
		// override
		public getTemplate () : string {
			return `<s10cui-radio-button class="s10cui-button">
				` + this.referenceTag.title + `
			</s10cui-radio-button>
			`;
		}
	}
}

