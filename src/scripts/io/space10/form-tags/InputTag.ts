/// <reference path="Tag.ts"/>

// namespace
namespace io.space10 {
	// interface

	// class
	export class InputTag extends Tag {
		constructor(options: ITagOptions){
			super(options);

			// if(this.domElement.getAttribute("type") == "text"){
			// 	this.setTagValue("hello world");
			// }else if(this.domElement.getAttribute("type") == "email"){
			// 	this.setTagValue("Uhwe@uhwe.dk");
			// }else if(this.domElement.getAttribute("type") == "tel"){
			// 	this.setTagValue("+49"+(Math.random() * 9999999));
			// }else if(this.domElement.getAttribute("type") == "checkbox"){
			// 	(<HTMLInputElement> this.domElement).checked = Math.random() > 0.5;
			// }else if(this.domElement.getAttribute("type") == "radio"){
			// 	(<HTMLInputElement> this.domElement).checked = Math.random() > 0.5;
			// }else if(this.domElement.getAttribute("type") == "password"){
			// 	this.setTagValue("xxx");
			// }
		}
	}
}

