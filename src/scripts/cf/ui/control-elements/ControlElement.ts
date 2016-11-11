/// <reference path="../../ConversationalForm.ts"/>
/// <reference path="../BasicElement.ts"/>
/// <reference path="../../form-tags/Tag.ts"/>

// namespace
namespace cf {
	// interface
	export interface ControlElementVector{
		height: number,
		width: number,
		x: number,
		y: number,
		centerX?: number,
		centerY?: number,
	}

	export interface IControlElementOptions extends IBasicElementOptions{
		referenceTag: ITag;
	}

	export interface IControlElement extends IBasicElement{
		el: HTMLElement;
		referenceTag: ITag;
		type: string;
		value: string;
		positionVector: ControlElementVector;
		tabIndex: number;
		visible: boolean;
		focus: boolean;
		calcPosition(): void;
		dealloc(): void;
	}

	export const ControlElementEvents = {
		SUBMIT_VALUE: "cf-basic-element-submit",
		PROGRESS_CHANGE: "cf-basic-element-progress", // busy, ready
		ON_FOCUS: "cf-basic-element-on-focus", // busy, ready
	}

	export const ControlElementProgressStates = {
		BUSY: "cf-control-element-progress-BUSY",
		READY: "cf-control-element-progress-READY",
	}

	// class
	export class ControlElement extends BasicElement implements IControlElement{
		public el: HTMLElement;
		public referenceTag: ITag;

		private animateInTimer: number = 0;
		private _positionVector: ControlElementVector;
		private _focus: boolean = false;
		private onFocusCallback: () => void;
		private onBlurCallback: () => void;

		public get type():string{
			return "ControlElement";
		}

		public get value():string{
			return Helpers.getInnerTextOfElement(this.el);
		}

		public get positionVector():ControlElementVector{
			return this._positionVector;
		}

		public set tabIndex(value: number){
			this.el.tabIndex = value;
		}
	
		public get focus(): boolean{
			return this._focus;
		}
	
		public get visible(): boolean{
			return !this.el.classList.contains("hide");
		}

		public set visible(value: boolean){
			if(value){
				this.el.classList.remove("hide");
			}else{
				this.el.classList.add("hide");
				this.tabIndex = -1;
			}
		}

		constructor(options: IBasicElementOptions){
			super(options);

			this.onFocusCallback = this.onFocus.bind(this);
			this.el.addEventListener('focus', this.onFocusCallback, false);
			this.onBlurCallback = this.onBlur.bind(this);
			this.el.addEventListener('blur', this.onBlurCallback, false);
		}

		private onBlur(event: Event){
			this._focus = false;
		}

		private onFocus(event: Event){
			this._focus = true;
			ConversationalForm.illustrateFlow(this, "dispatch", ControlElementEvents.ON_FOCUS, this.referenceTag);
			document.dispatchEvent(new CustomEvent(ControlElementEvents.ON_FOCUS, {
				detail: this.positionVector
			}));
		}

		public calcPosition(){
			const mr: number = parseInt(window.getComputedStyle(this.el).getPropertyValue("margin-right"), 10);
			// try not to do this to often, re-paint whammy!
			this._positionVector = <ControlElementVector> {
				height: this.el.offsetHeight,
				width: this.el.offsetWidth + mr,
				x: this.el.offsetLeft,
				y: this.el.offsetTop,
			};

			this._positionVector.centerX = this._positionVector.x + (this._positionVector.width * 0.5);
			this._positionVector.centerY = this._positionVector.y + (this._positionVector.height * 0.5);
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
			this.el.removeEventListener('blur', this.onBlurCallback, false);
			this.onBlurCallback = null;

			this.el.removeEventListener('focus', this.onFocusCallback, false);
			this.onFocusCallback = null;

			super.dealloc();
		}
	}
}