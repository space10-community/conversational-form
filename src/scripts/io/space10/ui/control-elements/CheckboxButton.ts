/// <reference path="Button.ts"/>

// namespace
namespace io.space10 {
	// interface

	// class
	export class CheckboxButton extends Button {

		protected onClick(event: MouseEvent){
			const checked: boolean = this.el.hasAttribute("checked");
			console.log((<any>this.constructor).name, 'onClick:', this.el.hasAttribute("checked"));
			if(checked)
				this.el.removeAttribute("checked");
			else
				this.el.setAttribute("checked", "");
			
			
			// super.onClick(event);
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

