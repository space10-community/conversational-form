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

		public setTagValueAndIsValid(value: string | ITag):boolean{
			let isValid: boolean = true;
			// this sets the value of the tag in the DOM
			(<HTMLOptionElement> this.domElement).selected = value == "1";

			return isValid;
		}
	}
}

