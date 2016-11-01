/// <reference path="Button.ts"/>

// namespace
namespace cf {
	// interface

	// class
	export class CheckboxButton extends Button {

		public get checked():boolean{
			return this.el.getAttribute("checked") == "checked";
		}

		public set checked(value: boolean){
			if(!value)
				this.el.removeAttribute("checked");
			else
				this.el.setAttribute("checked", "checked");
		}

		protected onClick(event: MouseEvent){
			this.checked = !this.checked;
			this.referenceTag.setTagValueAndIsValid(this.checked ? "1" : "0");
		}

		// override
		public getTemplate () : string {
			const isChecked: boolean = this.referenceTag.value == "1" || this.referenceTag.domElement.hasAttribute("checked");
			return `<cf-checkbox-button class="cf-button" checked=`+(isChecked ? "checked" : "")+`>
				<cf-checkbox></cf-checkbox>
				` + this.referenceTag.title + `
			</cf-checkbox-button>
			`;
		}
	}
}

