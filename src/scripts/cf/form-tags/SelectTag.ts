/// <reference path="Tag.ts"/>

// namespace
namespace cf {
	// interface

	// class
	export class SelectTag extends Tag {

		public optionTags: Array<OptionTag>;
		private _values: Array<string>;

		public get type (): string{
			return "select";
		}

		public get value (): string | Array<string> {
			return this._values;
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
				let tag: OptionTag = <OptionTag> cf.Tag.createTag(element);

				if(tag){
					this.optionTags.push(tag);
				}else{
					console.warn((<any>this.constructor).name, 'option tag invalid:', tag);
				}
			}
		}

		public setTagValueAndIsValid(dto: FlowDTO):boolean{
			let isValid: boolean = false;

			// select tag values are set via selected attribute on option tag
			let numberOptionButtonsVisible: Array <OptionButton> = [];
			this._values = [];

			for (let i = 0; i < this.optionTags.length; i++) {
				let tag: OptionTag = <OptionTag>this.optionTags[i];

				for (let j = 0; j < dto.controlElements.length; j++) {
					let controllerElement: OptionButton = <OptionButton>dto.controlElements[j];
					if(controllerElement.referenceTag == tag){
						// tag match found, so set value
						tag.selected = controllerElement.selected;

						// check for minimum one selected
						if(!isValid && tag.selected)
							isValid = true;

						if(tag.selected)
							this._values.push(<string> tag.value);

						if(controllerElement.visible)
							numberOptionButtonsVisible.push(controllerElement);
					}
				}
			}

			// special case 1, only one optiontag visible from a filter
			if(!isValid && numberOptionButtonsVisible.length == 1){
				let element: OptionButton = numberOptionButtonsVisible[0];
				let tag: OptionTag = this.optionTags[this.optionTags.indexOf(<OptionTag> element.referenceTag)];
				element.selected = true;
				tag.selected = true;
				isValid = true;

				if(tag.selected)
					this._values.push(<string> tag.value);
			}

			return isValid;
		}
	}
}

