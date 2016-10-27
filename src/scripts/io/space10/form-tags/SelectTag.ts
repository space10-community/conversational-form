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
			// this.setTagValue(optionTags[Math.floor(Math.random() * optionTags.length)].value);
		}
	}
}

