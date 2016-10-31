/// <reference path="Button.ts"/>

// namespace
namespace cf {
	// interface

	// class
	export class CheckboxButton extends Button {

		public get checked():boolean{
			return this.el.hasAttribute("checked");
		}

		protected onClick(event: MouseEvent){
			const checked: boolean = this.referenceTag.value == "1";
			if(checked)
				this.el.removeAttribute("checked");
			else
				this.el.setAttribute("checked", "");
			
			this.referenceTag.setTagValueAndIsValid(!checked ? "1" : "0");
		}

		// override
		public getTemplate () : string {
			return `<cf-checkbox-button class="cf-button" `+((<HTMLInputElement> this.referenceTag.domElement).checked ? "checked" : "")+`>
				<cf-checkbox></cf-checkbox>
				` + this.referenceTag.title + `
			</cf-checkbox-button>
			`;
		}
	}
}

