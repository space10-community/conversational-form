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

		public setTagValueAndIsValid(value: FlowDTO):boolean{
			let isValid: boolean = value.controlElements[0] != null;

			if(isValid)
				this.domElement.value = (<OptionButton> value.controlElements[0]).referenceTag.value;

			return isValid;
		}
	}
}

