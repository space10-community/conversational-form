/// <reference path="Button.ts"/>

// namespace
namespace io.space10 {
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
			return `<s10cui-radio-button class="s10cui-button" checked=`+(this.referenceTag.value == "0" ? "checked" : "")+`>
				` + this.referenceTag.title + `
			</s10cui-radio-button>
			`;
		}
	}
}

