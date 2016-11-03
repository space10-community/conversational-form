/// <reference path="Tag.ts"/>

// namespace
namespace cf {
	// interface

	// class
	export class SelectTag extends Tag {

		public get type (): string{
			return "select";
		}

		public get multipleChoice(): boolean{
			return this.domElement.hasAttribute("multiple");
		}

		constructor(options: ITagOptions){
			super(options);

			var optionTags = this.domElement.getElementsByTagName("option");
			// this.setTagValue(optionTags[Math.floor(Math.random() * optionTags.length)].value);
		}

		public setTagValueAndIsValid(value: FlowDTO):boolean{
			let isValid: boolean = value.controlElements[0] != null;

			// select tag values are set via selected attribute on option tag
			if(isValid){
				let selectTagValue: string = "";
				// value.controlElements.length == 1
				// for (let i = 0; i < value.controlElements.length; i++) {
				// 	let element: OptionButton = <OptionButton>value.controlElements[i];
				// 	selectTagValue += element.referenceTag.value + (i < value.controlElements.length - 1 ? "," : "");
				// }

				// this.domElement.value = selectTagValue;
			}

			return isValid;
		}
	}
}

