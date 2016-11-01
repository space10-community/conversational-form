/// <reference path="Tag.ts"/>

// namespace
namespace cf {
	// interface

	// class
	export class OptionTag extends Tag {

		public get type (): string{
			return "option";
		}

		public get title (): string{
			return this.domElement.innerText;
		}
		
		public get selected (): boolean{
			return (<HTMLOptionElement> this.domElement).selected;
		}

		public setTagValueAndIsValid(value: FlowDTO):boolean{
			let isValid: boolean = true;
			// OBS: No need to set any validation og value for this tag type ..
			// .. it is atm. only used to create pseudo elements in the OptionsList

			return isValid;
		}
	}
}

