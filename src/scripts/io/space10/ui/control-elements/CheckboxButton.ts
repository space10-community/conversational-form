/// <reference path="Button.ts"/>

// namespace
namespace io.space10 {
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
			return `<s10cui-checkbox-button class="s10cui-button" `+((<HTMLInputElement> this.referenceTag.domElement).checked ? "checked" : "")+`>
				<s10cui-checkbox></s10cui-checkbox>
				` + this.referenceTag.title + `
			</s10cui-checkbox-button>
			`;
		}
	}
}

