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
		type: string;
		value: string;
	}

	export const ControlElementEvents = {
		SUBMIT_VALUE: "cui-basic-element-submit"
	}

	// class
	export class ControlElement extends BasicElement implements IControlElement{
		public el: HTMLElement;
		public referenceTag: ITag;

		public get type():string{
			return (<any>this.constructor).name;
		}

		public get value():string{
			return this.el.innerText;
		}

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