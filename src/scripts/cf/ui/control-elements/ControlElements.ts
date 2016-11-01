/// <reference path="Button.ts"/>
/// <reference path="RadioButton.ts"/>
/// <reference path="CheckboxButton.ts"/>
/// <reference path="OptionsList.ts"/>

// namespace
namespace cf {
	export interface IControlElementsOptions{
		el: HTMLElement;
	}
	export class ControlElements {
		private elements: Array<IControlElement | OptionsList>;
		private el: HTMLElement;
		private listScrubButton: HTMLElement;
		private onScrubListClickCallback: () => void;

		public get active():boolean{
			return this.elements.length > 0;
		}

		constructor(options: IControlElementsOptions){
			this.el = options.el;

			this.listScrubButton = <HTMLElement> this.el.getElementsByTagName("cf-list-button")[0];
			this.onScrubListClickCallback = this.onScrubListClick.bind(this);
			this.listScrubButton.addEventListener("click", this.onScrubListClickCallback, false);
		}

		private onScrubListClick(event: MouseEvent){
			const centerChild: HTMLElement = <HTMLElement>this.el.children[this.el.children.length - 1];
			console.log("onScrubListClick", centerChild.getBoundingClientRect());
			console.log("onScrubListClick", centerChild.offsetLeft, centerChild.offsetWidth);
		}

		updateStateOnElements(controlElement: IControlElement){
			if(controlElement.type == "RadioButton"){
				// uncheck other buttons...
				for (let i = 0; i < this.elements.length; i++) {
					let element: RadioButton = <RadioButton>this.elements[0];
					if(element != controlElement)
						element.checked = false;
				}
			}
		}

		public getValue(): string{
			let value: string | Array <string> = "";
			if(this.elements && this.elements.length > 0){
				console.log((<any>this.constructor).name, 'get value...:', this.elements[0].type);
				switch(this.elements[0].type){
					case "CheckboxButton" :
						value = [];
						for (var i = 0; i < this.elements.length; i++) {
							let element: CheckboxButton = <CheckboxButton> this.elements[i];
							if(element.checked)
								value.push(element.value);
						}

						value = value.join(", ");
						break;

					case "RadioButton" :
						value = "";
						for (var i = 0; i < this.elements.length; i++) {
							let element: RadioButton = <RadioButton> this.elements[i];

							if(element.checked)
								value = <string> element.value;
							// else
							// 	element
						}
						break;
				}
			}

			return value;
		}

		public buildTags(tags: Array<ITag>){
			const topList: HTMLUListElement = (<HTMLUListElement > this.el.parentNode).getElementsByTagName("ul")[0];
			const bottomList: HTMLUListElement = (<HTMLUListElement> this.el.parentNode).getElementsByTagName("ul")[1];

			// remove old elements
			if(this.elements ){
				while(this.elements.length > 0){
					this.elements.pop().remove();
				}
			}

			this.elements = [];


			for (var i = 0; i < tags.length; i++) {
				var tag: ITag = tags[i];
				
				switch(tag.type){
					case "radio" :
						this.elements.push(new RadioButton({
							referenceTag: tag
						}));
						break;
					case "checkbox" :
						this.elements.push(new CheckboxButton({
							referenceTag: tag
						}));
					
						break;
					case "select" :
						this.elements.push(new OptionsList({
							referenceTag: tag,
							topList: topList,
							bottomList: bottomList,
						}));
						break;
					default :
						// nothing to add.
						console.log("UserInput buildControlElements:", "none Control UI type, only input field is needed.");
						break;
				}

				if(tag.type != "select" && this.elements.length > 0){
					const element: IControlElement = <IControlElement> this.elements[this.elements.length - 1];
					if(i % 2 == 0){
						topList.appendChild(element.el);
					}else{
						bottomList.appendChild(element.el);
					}
				}

			}

			const controlElementsAddedDTO: ControlElementsDTO = {
				height: this.el.offsetHeight,
			};

			ConversationalForm.illustrateFlow(this, "dispatch", UserInputEvents.CONTROL_ELEMENTS_ADDED, controlElementsAddedDTO);
			document.dispatchEvent(new CustomEvent(UserInputEvents.CONTROL_ELEMENTS_ADDED, {
				detail: controlElementsAddedDTO
			}));
		}

		public remove(){
			this.listScrubButton.removeEventListener("click", this.onScrubListClickCallback, false);
			this.onScrubListClickCallback = null;
		}
	}
}