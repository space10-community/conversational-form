/// <reference path="Tag.ts"/>

// namespace
namespace cf {
	// interface

	// class
	export class SelectTag extends Tag {

		public optionTags: Array<OptionTag>;

		public get type (): string{
			return "select";
		}

		public get multipleChoice(): boolean{
			return this.domElement.hasAttribute("multiple");
		}

		constructor(options: ITagOptions){
			super(options);

			// build the option tags
			this.optionTags = [];
			var domOptionTags: NodeListOf<HTMLOptionElement> = this.domElement.getElementsByTagName("option");
			for (let i = 0; i < domOptionTags.length; i++) {
				let element: HTMLOptionElement = <HTMLOptionElement>domOptionTags[i];
				let tag: OptionTag = <OptionTag> cf.Tag.createTag({
					domElement: element
				});

				if(tag){
					this.optionTags.push(tag);
				}else{
					// console.warn((<any>this.constructor).name, 'option tag invalid:', tag);
				}
			}
		}

		public setTagValueAndIsValid(value: FlowDTO):boolean{
			let isValid: boolean = false;

			// select tag values are set via selected attribute on option tag
			for (let i = 0; i < this.optionTags.length; i++) {
				let tag: OptionTag = <OptionTag>this.optionTags[i];

				for (let j = 0; j < value.controlElements.length; j++) {
					let controllerElement: OptionButton = <OptionButton>value.controlElements[j];
					if(controllerElement.referenceTag == tag){
						// tag match found, so set value
						tag.selected = controllerElement.selected;

						// check for minimum one selected
						if(!isValid && tag.selected)
							isValid = true;

						// if(controllerElement.visible)
						// if(controllerElement.visible)
						//TODO: use same logic as in TagGroup Radio buttons.. check for one element only etc.
					}
				}
			}

			return isValid;
		}
	}
}

