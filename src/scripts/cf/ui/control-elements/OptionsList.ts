/// <reference path="ControlElement.ts"/>
/// <reference path="OptionButton.ts"/>

// namespace
namespace cf {
	// interface

	export interface IOptionsListOptions{
		context: HTMLElement;
		eventTarget: EventDispatcher;
		referenceTag: ITag;
	}

	// class
	// builds x OptionsButton from the registered SelectTag
	export class OptionsList {

		public elements: Array<OptionButton>;
		private eventTarget: EventDispatcher;
		private context: HTMLElement;
		private multiChoice: boolean;
		private referenceTag: ITag;
		private onOptionButtonClickCallback: () => void;

		public get type():string{
			return "OptionsList";
		}

		constructor(options: IOptionsListOptions){
			this.context = options.context;
			this.eventTarget = options.eventTarget;
			this.referenceTag = options.referenceTag;

			// check for multi choice select tag
			this.multiChoice = this.referenceTag.domElement.hasAttribute("multiple");
			
			this.onOptionButtonClickCallback = this.onOptionButtonClick.bind(this);
			this.eventTarget.addEventListener(OptionButtonEvents.CLICK, this.onOptionButtonClickCallback, false);

			this.createElements();
		}

		public getValue(): Array<OptionButton> {
			let arr: Array<OptionButton> = [];
			for (let i = 0; i < this.elements.length; i++) {
				let element: OptionButton = <OptionButton>this.elements[i];
				if(!this.multiChoice && element.selected){
					arr.push(element);
					return arr;
				}else if(this.multiChoice && element.selected){
					arr.push(element);
				}
			}
			return arr;
		}

		private onOptionButtonClick(event: CustomEvent){
			// if mutiple... then dont remove selection on other buttons
			if(!this.multiChoice){
				// only one is selectable at the time.

				for (let i = 0; i < this.elements.length; i++) {
					let element: OptionButton = <OptionButton>this.elements[i];
					if(element != event.detail){
						element.selected = false;
					}else{
						element.selected = true;
					}
				}

				ConversationalForm.illustrateFlow(this, "dispatch", ControlElementEvents.SUBMIT_VALUE, this.referenceTag);
				this.eventTarget.dispatchEvent(new CustomEvent(ControlElementEvents.SUBMIT_VALUE, {
					detail: <OptionButton> event.detail
				}));
			}else{
				(<OptionButton> event.detail).selected = !(<OptionButton> event.detail).selected;
			}
		}

		private createElements(){
			this.elements = [];
			var optionTags: Array<OptionTag> = (<SelectTag>this.referenceTag).optionTags;
			for (let i = 0; i < optionTags.length; i++) {
				let tag: OptionTag = optionTags[i];

				const btn: OptionButton = new OptionButton(<IOptionButtonOptions> {
					referenceTag: tag,
					isMultiChoice: (<SelectTag>this.referenceTag).multipleChoice,
					eventTarget: this.eventTarget
				});

				this.elements.push(btn);

				this.context.appendChild(btn.el);
			}
		}

		public dealloc(){
			this.eventTarget.removeEventListener(OptionButtonEvents.CLICK, this.onOptionButtonClickCallback, false);
			this.onOptionButtonClickCallback = null;

			while(this.elements.length > 0)
				this.elements.pop().dealloc();
			this.elements = null;
		}
	}
}

