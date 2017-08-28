/// <reference path="Button.ts"/>

// namespace
namespace cf {
	// interface

	// class
	export class RadioButton extends Button {

		public get type():string{
			return "RadioButton";
		}

		public get checked():boolean{
			const _checked: boolean = this.el.hasAttribute("checked") && this.el.getAttribute("checked") == "checked";
			return _checked;
		}

		public set checked(value: boolean){
			if(!value){
				this.el.removeAttribute("checked");
				this.referenceTag.domElement.removeAttribute("checked");
				(<HTMLInputElement> this.referenceTag.domElement).checked = false;
			}else{
				this.el.setAttribute("checked", "checked");
				this.referenceTag.domElement.setAttribute("checked", "checked");
				(<HTMLInputElement> this.referenceTag.domElement).checked = true;
			}
		}

		protected onClick(event: MouseEvent){
			this.checked = true;// checked always true like native radio buttons
			super.onClick(event);
		}

		// override
		public getTemplate () : string {
			const isChecked: boolean = (<HTMLInputElement> this.referenceTag.domElement).checked || this.referenceTag.domElement.hasAttribute("checked");
			return `<cf-radio-button class="cf-button" `+(isChecked ? "checked=checked" : "")+`>
				<div>
					<cf-radio></cf-radio>
					<span>` + this.referenceTag.label + `</span>
				</div>
			</cf-radio-button>
			`;
		}
	}
}

