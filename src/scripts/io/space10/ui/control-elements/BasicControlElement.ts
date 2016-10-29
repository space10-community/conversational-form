/// <reference path="../BasicElement.ts"/>
/// <reference path="../../form-tags/Tag.ts"/>

// namespace
namespace io.space10 {
	// interface
	export interface IBasicControlElementOptions extends IBasicElementOptions{
		referenceTag: io.space10.ITag;
	}

	export interface IBasicControlElement extends IBasicElement{
		referenceTag: io.space10.ITag;
	}

	export const BasicControlElementEvents = {
		SUBMIT_VALUE: "cui-basic-element-submit"
	}

	// class
	export class BasicControlElement extends BasicElement implements IBasicControlElement{
		public el: Element;
		public referenceTag: ITag;

		protected setData(options: IBasicControlElementOptions){
			this.referenceTag = options.referenceTag;
			super.setData(options);
		}

		public onChoose(){
			document.dispatchEvent(new CustomEvent(io.space10.BasicControlElementEvents.SUBMIT_VALUE, {
				detail: this.referenceTag
			}));
		}

		public remove(){

		}
	}
}