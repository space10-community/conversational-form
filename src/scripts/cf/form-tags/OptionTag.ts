/// <reference path="Tag.ts"/>
/// <reference path="../parsing/TagsParser.ts"/>

// namespace
namespace cf {
	// interface

	// class
	export class OptionTag extends Tag {

		public get type (): string{
			return "option";
		}

		public get label (): string{
			if(this.formless){
				return super.getLabel();
			}else{
				return Helpers.getInnerTextOfElement(this.domElement);
			}
		}
		
		public get selected (): boolean{
			return (<HTMLOptionElement> this.domElement).selected;
		}

		public set selected (value: boolean){
			if(value)
				this.domElement.setAttribute("selected", "selected");
			else
				this.domElement.removeAttribute("selected");
		}

		public setTagValueAndIsValid(value: FlowDTO):boolean{
			let isValid: boolean = true;
			// OBS: No need to set any validation og value for this tag type ..
			// .. it is atm. only used to create pseudo elements in the OptionsList

			return isValid;
		}
	}
}

