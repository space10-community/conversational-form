/// <reference path="ControlElement.ts"/>

// namespace
namespace cf {
	// interface

	// class
	export class Button extends ControlElement {
		private clickCallback: () => void;

		constructor(options: IControlElementOptions){
			super(options);

			this.clickCallback = this.onClick.bind(this);
			this.el.addEventListener("click", this.clickCallback, false);
		}

		protected onClick(event: MouseEvent){
			this.onChoose();
		}

		public dealloc(){
			this.el.removeEventListener("click", this.clickCallback, false);
			this.clickCallback = null;

			super.dealloc();
		}

		// override
		public getTemplate () : string {
			return `<cf-button class="cf-button">
				` + this.referenceTag.title + `
			</cf-button>
			`;
		}
	}
}

