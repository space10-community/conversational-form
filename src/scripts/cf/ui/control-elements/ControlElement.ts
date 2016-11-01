/// <reference path="../../ConversationalForm.ts"/>
/// <reference path="../BasicElement.ts"/>
/// <reference path="../../form-tags/Tag.ts"/>

// namespace
namespace cf {
	// interface
	export interface IControlElementOptions extends IBasicElementOptions{
		referenceTag: ITag;
	}

	export interface IControlElement extends IBasicElement{
		el: HTMLElement;
		referenceTag: ITag;
		type: string;
		value: string;
		remove(): void;
	}

	export const ControlElementEvents = {
		SUBMIT_VALUE: "cf-basic-element-submit"
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

		public get width():number{
			const mr: number = parseInt(window.getComputedStyle(this.el).getPropertyValue("margin-right"), 10);
			return this.el.offsetWidth + mr;
		}

		protected setData(options: IControlElementOptions){
			this.referenceTag = options.referenceTag;
			super.setData(options);
		}

		public show(){
			this.el.classList.add("show");
		}

		public onChoose(){
			ConversationalForm.illustrateFlow(this, "dispatch", ControlElementEvents.SUBMIT_VALUE, this.referenceTag);
			document.dispatchEvent(new CustomEvent(ControlElementEvents.SUBMIT_VALUE, {
				detail: this
			}));
		}

		public remove(){
			super.remove();
		}
	}
}