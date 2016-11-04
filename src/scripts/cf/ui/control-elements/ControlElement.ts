/// <reference path="../../ConversationalForm.ts"/>
/// <reference path="../BasicElement.ts"/>
/// <reference path="../../form-tags/Tag.ts"/>

// namespace
namespace cf {
	// interface
	export interface ControlElementVector{
		width: number,
		left: number,
	}

	export interface IControlElementOptions extends IBasicElementOptions{
		referenceTag: ITag;
	}

	export interface IControlElement extends IBasicElement{
		el: HTMLElement;
		referenceTag: ITag;
		type: string;
		value: string;
		rect: ControlElementVector;
		dealloc(): void;
	}

	export const ControlElementEvents = {
		SUBMIT_VALUE: "cf-basic-element-submit",
		PROGRESS_CHANGE: "cf-basic-element-progress", // busy, ready
	}

	export const ControlElementProgressStates = {
		BUSY: "cf-control-element-progress-BUSY",
		READY: "cf-control-element-progress-READY",
	}

	// class
	export class ControlElement extends BasicElement implements IControlElement{
		private _visible: boolean = true;

		public el: HTMLElement;
		public referenceTag: ITag;
		private animateInTimer: number = 0;

		public get type():string{
			return (<any>this.constructor).name;
		}

		public get value():string{
			return Helpers.getInnerTextOfElement(this.el);
		}

		public get rect():ControlElementVector{
			if(!this.visible)
				return {width: 0, left: 0};
			
			const mr: number = parseInt(window.getComputedStyle(this.el).getPropertyValue("margin-right"), 10);
			// try not to do this to often, re-paint whammy!
			return <ControlElementVector> {
				width: this.el.offsetWidth + mr,
				left: this.el.offsetLeft,
			}
		}

		public set tabIndex(value: number){
			this.el.tabIndex = value;
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
			clearTimeout(this.animateInTimer);
			if(this.el.classList.contains("animate-in")){
				this.el.classList.remove("animate-in");
				this.animateInTimer = setTimeout(() => this.el.classList.add("animate-in"), 0);
			}else{
				this.el.classList.add("animate-in");
			}
		}

		public animateOut(){
			this.el.classList.add("animate-out");
		}

		public onChoose(){
			ConversationalForm.illustrateFlow(this, "dispatch", ControlElementEvents.SUBMIT_VALUE, this.referenceTag);
			document.dispatchEvent(new CustomEvent(ControlElementEvents.SUBMIT_VALUE, {
				detail: this
			}));
		}

		public dealloc(){
			super.dealloc();
		}
	}
}