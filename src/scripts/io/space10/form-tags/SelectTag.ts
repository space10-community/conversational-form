/// <reference path="Tag.ts"/>

// namespace
namespace io.space10 {
	// interface

	// class
	export class SelectTag extends Tag {

		public get type (): string{
			return "select";
		}

		constructor(options: ITagOptions){
			super(options);

			var optionTags = this.el.getElementsByTagName("option");
			// console.log(this, 'select:', this.el.value);
			// console.log(this, 'select:', optionTags);
			// console.log(this, 'input:', this.el.getAttribute("type"), this.el);
			this.setValue(optionTags[Math.floor(Math.random() * optionTags.length)].value);

			// auto values..
			// ....
		}
	}
}

