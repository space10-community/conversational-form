/// <reference path="Tag.ts"/>

// namespace
namespace io.space10 {
	// interface

	// class
	export class InputTag extends Tag {
		constructor(options: ITagOptions){
			super(options);

			// console.log(this, 'input:', this.el.getAttribute("type"), this.el);
			if(this.el.getAttribute("type") == "text"){
				this.setValue("Uhwe");
			}else if(this.el.getAttribute("type") == "email"){
				this.setValue("Uhwe@uhwe.dk");
			}else if(this.el.getAttribute("type") == "tel"){
				this.setValue("+49"+(Math.random() * 9999999));
			}else if(this.el.getAttribute("type") == "checkbox"){
				(<HTMLInputElement> this.el).checked = Math.random() > 0.5;
			}else if(this.el.getAttribute("type") == "radio"){
				(<HTMLInputElement> this.el).checked = Math.random() > 0.5;
			}else if(this.el.getAttribute("type") == "password"){
				this.setValue("xxx");
			}

			// auto values..
			// ....


		}
	}
}

