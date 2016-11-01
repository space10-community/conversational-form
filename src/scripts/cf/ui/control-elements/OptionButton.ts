/// <reference path="Button.ts"/>

// namespace
namespace cf {
	// interface

	export const OptionButtonEvents = {
		CLICK: "cf-option-button-click"
	}

	// class
	export class OptionButton extends Button {
		public get selected():boolean{
			return this.el.hasAttribute("selected");
		}

		public set selected(value: boolean){
			if(value)
				this.el.setAttribute("selected", "selected");
			else
				this.el.removeAttribute("selected");
		}

		protected onClick(event: MouseEvent){
			// super.onClick(event);
			ConversationalForm.illustrateFlow(this, "dispatch", OptionButtonEvents.CLICK, this);
			document.dispatchEvent(new CustomEvent(OptionButtonEvents.CLICK, {
				detail: this
			}));
		}

		// override
		public getTemplate () : string {
			return `<cf-button class="cf-button" ` + ((<HTMLOptionElement> this.referenceTag.domElement).selected ? "selected='selected'" : "") + `>
				` + this.referenceTag.title + `
			</cf-button>
			`;
		}
	}
}