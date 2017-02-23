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
			}else{
				this.el.setAttribute("checked", "checked");
			}
		}

		protected onClick(event: MouseEvent){
			this.checked = !this.checked;
			super.onClick(event);
		}

		// override
		public getTemplate () : string {
			const isChecked: boolean = this.referenceTag.domElement.hasAttribute("checked");
			return `<cf-radio-button class="cf-button" checked=`+(isChecked ? "checked" : "")+`>
				<div>
					<cf-radio></cf-radio>
					` + this.referenceTag.label + `
				</div>
			</cf-radio-button>
			`;
		}
	}
}

