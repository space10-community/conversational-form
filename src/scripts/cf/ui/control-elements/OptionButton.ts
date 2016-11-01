/// <reference path="Button.ts"/>
/// <reference path="../../form-tags/OptionTag.ts"/>

// namespace
namespace cf {
	// interface

	// class
	export class OptionButton extends Button {

		protected onClick(event: MouseEvent){
			//toggle
			const selected: boolean = (<OptionTag>this.referenceTag).selected;
			if(!selected)
				this.el.setAttribute("selected", "selected");
			else
				this.el.removeAttribute("selected");

			super.onClick(event);
		}

		// override
		public getTemplate () : string {
			return `<cf-button class="cf-button" `+((<HTMLOptionElement> this.referenceTag.domElement).selected ? "selected='selected'" : "")+`>
				` + this.referenceTag.title + `
			</cf-button>
			`;
		}
	}
}