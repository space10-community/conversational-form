/// <reference path="ControlElement.ts"/>

// namespace
namespace cf {
	// interface

	// class
	export class Button extends ControlElement {
		private clickCallback: () => void;
		private mouseDownCallback: () => void;

		public get type():string{
			return "Button";
		}

		constructor(options: IControlElementOptions){
			super(options);

			this.clickCallback = this.onClick.bind(this);
			this.el.addEventListener("click", this.clickCallback, false);

			this.mouseDownCallback = this.onMouseDown.bind(this);
			this.el.addEventListener("mousedown", this.mouseDownCallback, false);
		}

		private onMouseDown(event:MouseEvent){
			event.preventDefault();
		}

		protected onClick(event: MouseEvent){
			this.onChoose();
		}

		public dealloc(){
			this.el.removeEventListener("click", this.clickCallback, false);
			this.clickCallback = null;

			this.el.removeEventListener("mousedown", this.mouseDownCallback, false);
			this.mouseDownCallback = null;

			super.dealloc();
		}

		// override
		public getTemplate () : string {
			return `<cf-button class="cf-button">
				` + this.referenceTag.label + `
			</cf-button>
			`;
		}
	}
}

