/// <reference path="Button.ts"/>

// namespace
namespace cf {
	// interface

	export interface IOptionButtonOptions extends IControlElementOptions{
		isMultiChoice: boolean;
	}

	export const OptionButtonEvents = {
		CLICK: "cf-option-button-click"
	}

	// class
	export class OptionButton extends Button {
		private isMultiChoice: boolean = false;

		public get type():string{
			return "OptionButton";
		}

		public get selected():boolean{
			return this.el.hasAttribute("selected");
		}

		public set selected(value: boolean){
			if(value){
				this.el.setAttribute("selected", "selected");
			}else{
				this.el.removeAttribute("selected");
			}
		}

		protected setData(options: IOptionButtonOptions){
			this.isMultiChoice = options.isMultiChoice;
			super.setData(options);
		}

		protected onClick(event: MouseEvent){
			ConversationalForm.illustrateFlow(this, "dispatch", OptionButtonEvents.CLICK, this);
			this.eventTarget.dispatchEvent(new CustomEvent(OptionButtonEvents.CLICK, {
				detail: this
			}));
		}

		// override
		public getTemplate () : string {
			// be aware that first option element on none multiple select tags will be selected by default
			let tmpl: string = '<cf-button class="cf-button ' + (this.isMultiChoice ? "cf-checkbox-button" : "") + '" ' + ((<HTMLOptionElement> this.referenceTag.domElement).selected ? "selected='selected'" : "") + '>';

			tmpl += "<div>";
			if(this.isMultiChoice)
				tmpl += "<cf-checkbox></cf-checkbox>";

			tmpl += this.referenceTag.label;
			tmpl += "</div>";

			tmpl += "</cf-button>";

			return tmpl;
		}
	} 
}