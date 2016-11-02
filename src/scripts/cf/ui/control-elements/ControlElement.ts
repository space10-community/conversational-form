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
		private _visible: boolean = true;

		public el: HTMLElement;
		public referenceTag: ITag;

		public get type():string{
			return (<any>this.constructor).name;
		}

		public get value():string{
			return Helpers.getInnerTextOfElement(this.el);
		}

		public get width():number{
			if(!this.visible)
				return 0;

			const mr: number = parseInt(window.getComputedStyle(this.el).getPropertyValue("margin-right"), 10);
			return this.el.offsetWidth + mr;
		}
	
		public get visible(): boolean{
			return !this.el.classList.contains("hide");
		}

		public set visible(value: boolean){
			if(value)
				this.el.classList.remove("hide");
			else
				this.el.classList.add("hide");
		}

		protected setData(options: IControlElementOptions){
			this.referenceTag = options.referenceTag;
			super.setData(options);
		}

		public animateIn(){
			this.el.classList.add("animate-in");
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