/// <reference path="Tag.ts"/>

// namespace
namespace cf {
	// interface

	// class
	export class SelectTag extends Tag {

		public get type (): string{
			return "select";
		}

		constructor(options: ITagOptions){
			super(options);

			var optionTags = this.domElement.getElementsByTagName("option");
			// this.setTagValue(optionTags[Math.floor(Math.random() * optionTags.length)].value);
		}

		public setTagValueAndIsValid(value: string | ITag):boolean{
			let isValid: boolean = true;

			const optionTag: OptionTag = <OptionTag> value;
			this.domElement.value = optionTag.value;

			return isValid;
		}
	}
}

