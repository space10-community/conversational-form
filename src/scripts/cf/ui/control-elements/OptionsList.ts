/// <reference path="ControlElement.ts"/>
/// <reference path="../../form-tags/OptionTag.ts"/>
/// <reference path="OptionButton.ts"/>

// namespace
namespace cf {
	// interface

	export interface IOptionsListOptions{
		context: HTMLElement;
		referenceTag: ITag;
	}

	// class
	// builds x OptionsButton from the registered SelectTag
	export class OptionsList {

		private context: HTMLElement;
		private multiChoice: boolean;
		private referenceTag: ITag;
		private elements: Array<OptionButton>;
		private onOptionButtonClickCallback: () => void;

		constructor(options: IOptionsListOptions){
			this.context = options.context;
			this.referenceTag = options.referenceTag;

			// check for multi choice select tag
			this.multiChoice = this.referenceTag.domElement.hasAttribute("multiple");
			
			this.onOptionButtonClickCallback = this.onOptionButtonClick.bind(this);
			document.addEventListener(OptionButtonEvents.CLICK, this.onOptionButtonClickCallback, false);

			this.createElements();
		}

		public get type():string{
			return "OptionsList";
		}

		public get width():number{
			let w: number = 0;
			for (let i = 0; i < this.elements.length; i++) {
				let element: OptionButton = <OptionButton>this.elements[i];
				w += element.width;
			}

			return w;
		}

		public getValue(): ITag {
			for (let i = 0; i < this.elements.length; i++) {
				let element: OptionButton = <OptionButton>this.elements[i];
				if(element.selected)
					return element.referenceTag;
			}
			return null;
		}

		private onOptionButtonClick(event: CustomEvent){
			// if mutiple... then don remove selection on other buttons
			const isMutiple: boolean = false;
			if(!this.multiChoice){
				// only one is selectable at the time.
				for (let i = 0; i < this.elements.length; i++) {
					let element: OptionButton = <OptionButton>this.elements[i];
					if(element != event.detail){
						element.selected = false;
					}else{
						// TODO: Should we inject vallue to input field??
						element.selected = true;
					}
				}
			}else{
				(<OptionButton> event.detail).selected = !(<OptionButton> event.detail).selected;
			}
		}

		private createElements(){
			this.elements = [];
			var optionTags: NodeListOf<HTMLOptionElement> = this.referenceTag.domElement.getElementsByTagName("option");
			for (let i = 0; i < optionTags.length; i++) {
				let element: HTMLOptionElement = <HTMLOptionElement>optionTags[i];
				let tag: ITag = cf.Tag.createTag({
					domElement: element
				});

				if(tag){
					const btn: OptionButton = new OptionButton({
						referenceTag: tag
					});

					this.elements.push(btn);

					this.context.appendChild(btn.el);
				}
			}
		}

		public show(){
			for (let i = 0; i < this.elements.length; i++) {
				let element: OptionButton = <OptionButton>this.elements[i];
				element.show();
			}
		}

		public remove(){
			document.removeEventListener(OptionButtonEvents.CLICK, this.onOptionButtonClickCallback, false);
			this.onOptionButtonClickCallback = null;

			while(this.elements.length > 0)
				this.elements.pop().remove();
			this.elements = null;
		}
	}
}

