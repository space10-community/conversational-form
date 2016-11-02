/// <reference path="Button.ts"/>

// namespace
namespace cf {
	// interface

	// class
	export class RadioButton extends Button {
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
			if(this.checked)
				this.el.removeAttribute("checked");
			else
				this.el.setAttribute("checked", "checked");

			super.onClick(event);
		}

		// override
		public getTemplate () : string {
			const isChecked: boolean = this.referenceTag.value == "1" || this.referenceTag.domElement.hasAttribute("checked");
			return `<cf-radio-button class="cf-button" checked=`+(isChecked ? "checked" : "")+`>
				<cf-radio></cf-radio>
				` + this.referenceTag.title + `
			</cf-radio-button>
			`;
		}
	}
}

