/// <reference path="BasicControlElement.ts"/>

// namespace
namespace io.space10 {
	// interface

	// class
	export class Button extends BasicControlElement {
		private clickCallback: () => void;

		constructor(options: IBasicControlElementOptions){
			super(options);

			this.clickCallback = this.onClick.bind(this);
			this.el.addEventListener("click", this.clickCallback, false);
		}

		protected onClick(event: MouseEvent){
			this.onChoose();
		}

		public remove(){
			this.el.removeEventListener("click", this.clickCallback, false);
			this.clickCallback = null;

			super.remove();
		}

		// override
		public getTemplate () : string {
			return `<s10cui-button class="s10cui-button">
				` + this.referenceTag.title + `
			</s10cui-button>
			`;
		}
	}
}

