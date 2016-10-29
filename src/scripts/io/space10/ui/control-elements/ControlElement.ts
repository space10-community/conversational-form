/// <reference path="../../Space10CUI.ts"/>
/// <reference path="../BasicElement.ts"/>
/// <reference path="../../form-tags/Tag.ts"/>

// namespace
namespace io.space10 {
	// interface
	export interface IControlElementOptions extends IBasicElementOptions{
		referenceTag: ITag;
	}

	export interface IControlElement extends IBasicElement{
		referenceTag: ITag;
	}

	export const ControlElementEvents = {
		SUBMIT_VALUE: "cui-basic-element-submit"
	}

	// class
	export class ControlElement extends BasicElement implements IControlElement{
		public el: Element;
		public referenceTag: ITag;

		protected setData(options: IControlElementOptions){
			this.referenceTag = options.referenceTag;
			super.setData(options);
		}

		public onChoose(){
			Space10CUI.illustrateFlow(this, "dispatch", ControlElementEvents.SUBMIT_VALUE, this.referenceTag);
			document.dispatchEvent(new CustomEvent(ControlElementEvents.SUBMIT_VALUE, {
				detail: this.referenceTag
			}));
		}

		public remove(){

		}
	}
}