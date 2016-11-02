/// <reference path="Button.ts"/>
/// <reference path="ControlElement.ts"/>
/// <reference path="RadioButton.ts"/>
/// <reference path="CheckboxButton.ts"/>
/// <reference path="OptionsList.ts"/>
/// <reference path="../chat/ChatResponse.ts"/>
/// <reference path="../../../typings/es6-promise/es6-promise.d.ts"/>

// namespace
namespace cf {
	export interface IControlElementsOptions{
		el: HTMLElement;
	}
	export class ControlElements {
		private elements: Array<IControlElement | OptionsList>;
		private el: HTMLElement;
		private list: HTMLElement;
		private listNavButtons: NodeListOf<Element>;
		private onScrubListClickCallback: () => void;
		private onChatAIReponseCallback: () => void;
		private onUserInputKeyChangeCallback: () => void;
		private onElementScrollCallback: () => void;

		public get active():boolean{
			return this.elements.length > 0;
		}

		constructor(options: IControlElementsOptions){
			this.el = options.el;
			this.list = <HTMLElement> this.el.getElementsByTagName("cf-list")[0];

			this.listNavButtons = this.el.getElementsByTagName("cf-list-button");
			
			this.onScrubListClickCallback = this.onScrubListClick.bind(this);
			this.listNavButtons[0].addEventListener("click", this.onScrubListClickCallback, false);
			this.listNavButtons[1].addEventListener("click", this.onScrubListClickCallback, false);

			this.onChatAIReponseCallback = this.onChatAIReponse.bind(this);
			document.addEventListener(ChatResponseEvents.AI_QUESTION_ASKED, this.onChatAIReponseCallback, false);

			this.onUserInputKeyChangeCallback = this.onUserInputKeyChange.bind(this);
			document.addEventListener(UserInputEvents.KEY_CHANGE, this.onUserInputKeyChangeCallback, false);

			this.onElementScrollCallback = this.onElementScroll.bind(this);
			this.el.addEventListener("scroll", this.onElementScrollCallback, false);
		}

		private onChatAIReponse(event:CustomEvent){
			for (let i = 0; i < this.elements.length; i++) {
				let element: ControlElement = <ControlElement>this.elements[i];
				element.animateIn();
			}
		}

		private onUserInputKeyChange(event: CustomEvent){
			if(this.active){
				const inputValue: string = (<FlowDTO> event.detail).inputValue;
				this.filterElementsFrom(inputValue);
			}
		}

		private onScrubListClick(event: MouseEvent){
			const centerChild: HTMLElement = <HTMLElement>this.el.children[this.el.children.length - 1];
			const curScrollLeft: number = this.el.scrollLeft;
			const listWidth: number = centerChild.offsetWidth;
			const dirClick: string = (<HTMLElement> event.currentTarget).getAttribute("direction");

			console.log("onScrubListClick", curScrollLeft);
			console.log("onScrubListClick", listWidth);
			console.log("onScrubListClick", dirClick);

			this.el.scrollLeft += 100 * (dirClick == "next" ? 1 : -1);
		}

		/**
		* @name onElementScroll
		* when cf-control-elements is scrolling vertically
		*/
		private onElementScroll(event: Event): void {
			const curScrollLeft: number = this.el.scrollLeft;
			console.log((<any>this.constructor).name, 'onElementScroll:', curScrollLeft);

		}

		private filterElementsFrom(value:string){
			const inputValuesLowerCase: Array<string> = value.toLowerCase().split(" ");
			if(inputValuesLowerCase.indexOf("") != -1)
				inputValuesLowerCase.splice(inputValuesLowerCase.indexOf(""), 1);
			
			console.log((<any>this.constructor).name, 'inputValuesLowerCase:', inputValuesLowerCase);

			const isElementsOptionsList: boolean = (<any>this.elements[0].constructor).name == "OptionsList";
			const elements: Array <any> = (isElementsOptionsList ? (<OptionsList> this.elements[0]).elements : this.elements);
			// the type is not strong with this one..

			let numItemsVisible: number = 0;
			for (let i = 0; i < elements.length; i++) {
				let element: ControlElement = <ControlElement>elements[i];
				let elementVisibility: boolean = true;
				
				// check for all words of input
				for (let i = 0; i < inputValuesLowerCase.length; i++) {
					let inputWord: string = <string>inputValuesLowerCase[i];
					if(elementVisibility){
						elementVisibility = element.value.toLowerCase().indexOf(inputWord) != -1;
					}
				}

				// set element visibility.
				element.visible = elementVisibility;
				if(elementVisibility) 
					numItemsVisible += element.visible ? 1 : 0;
			}

			// set feedback text for filter..
			const infoElement: HTMLElement = <HTMLElement> this.el.getElementsByTagName("cf-info")[0];
			infoElement.innerHTML = numItemsVisible == 0 ? Dictionary.get("input-no-filter").split("{input-value}").join(value) : "";

			this.resize();
		}

		updateStateOnElements(controlElement: IControlElement){
			this.list.classList.add("disabled");
			if(controlElement.type == "RadioButton"){
				// uncheck other buttons...
				for (let i = 0; i < this.elements.length; i++) {
					let element: RadioButton = <RadioButton>this.elements[0];
					if(element != controlElement)
						element.checked = false;
				}
			}
		}

		public reset(){
			this.el.classList.remove("one-row");
			this.el.classList.remove("two-row");
		}

		public getDTO(): FlowDTO{
			let dto: FlowDTO = {
				text: undefined,
				controlElements: [],
			}

			// generate text value for ChatReponse
			if(this.elements && this.elements.length > 0){
				switch(this.elements[0].type){
					case "CheckboxButton" :
						var values: Array<string> = [];
						for (var i = 0; i < this.elements.length; i++) {
							let element: CheckboxButton = <CheckboxButton> this.elements[i];
							if(element.checked){
								values.push(element.value);
								dto.controlElements.push(element);
							}
						}
						
						dto.text = Dictionary.parseAndGetMultiValueString(values);
						
						break;

					case "RadioButton" :
						for (var i = 0; i < this.elements.length; i++) {
							let element: RadioButton = <RadioButton> this.elements[i];

							if(element.checked){
								dto.text = element.value;
								dto.controlElements.push(element);
							}
						}
						break;
					case "OptionsList":
						let element: OptionsList = <OptionsList> this.elements[0];
						dto.controlElements = element.getValue();

						var values: Array<string> = [];
						if(dto.controlElements && dto.controlElements[0]){
							for (let i = 0; i < dto.controlElements.length; i++) {
								let element: IControlElement = <IControlElement>dto.controlElements[i];
								values.push(dto.controlElements[i].value);
							}
						}

						dto.text = Dictionary.parseAndGetMultiValueString(values);

						break;
				}
			}

			return dto;
		}

		public buildTags(tags: Array<ITag>){
			this.list.classList.remove("disabled");
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
							context: this.list,
						}));
						break;
					default :
						// nothing to add.
						console.log("UserInput buildControlElements:", "none Control UI type, only input field is needed.");
						break;
				}

				if(tag.type != "select" && this.elements.length > 0){
					const element: IControlElement = <IControlElement> this.elements[this.elements.length - 1];
					this.list.appendChild(element.el);
				}
			}

			new Promise((resolve: any, reject: any) => this.resize(resolve, reject)).then(() => {
				const h: number = this.el.classList.contains("one-row") ? 65 : this.el.classList.contains("two-row") ? 125 : 0;

				const controlElementsAddedDTO: ControlElementsDTO = {
					height: h,
				};

				ConversationalForm.illustrateFlow(this, "dispatch", UserInputEvents.CONTROL_ELEMENTS_ADDED, controlElementsAddedDTO);
				document.dispatchEvent(new CustomEvent(UserInputEvents.CONTROL_ELEMENTS_ADDED, {
					detail: controlElementsAddedDTO
				}));
			});
		}

		public resize(resolve?: any, reject?: any){
			// scrollbar things
			// Element.offsetWidth - Element.clientWidth
			this.list.style.width = "100%";
			this.el.classList.remove("one-row");
			this.el.classList.remove("two-row");

			setTimeout(() => {
				let w: number = 0;
				if(this.elements.length > 0){
					for (let i = 0; i < this.elements.length; i++) {
						let element: any = <any>this.elements[i];
						w += element.width;
					}

					const elOffsetWidth: number = this.el.offsetWidth;
					let isListWidthOverElementWidth: boolean = w > elOffsetWidth;
					if(isListWidthOverElementWidth){
						this.el.classList.add("two-row");
						w = Math.round((w / 2) + 50);
						this.list.style.width = w + "px";
					}else{
						this.el.classList.add("one-row");
					}

					// check again after classes are set.
					isListWidthOverElementWidth = w > elOffsetWidth;
					
					// toggle nav button visiblity
					if(isListWidthOverElementWidth)
						this.el.classList.remove("hide-nav-buttons");
					else
						this.el.classList.add("hide-nav-buttons");
				}

				if(resolve)
					resolve();
			}, 0);
		}

		public remove(){
			this.listNavButtons[0].removeEventListener("click", this.onScrubListClickCallback, false);
			this.listNavButtons[1].removeEventListener("click", this.onScrubListClickCallback, false);
			this.onScrubListClickCallback = null;

			document.removeEventListener(ChatResponseEvents.AI_QUESTION_ASKED, this.onChatAIReponseCallback, false);
			this.onChatAIReponseCallback = null;

			document.removeEventListener(UserInputEvents.KEY_CHANGE, this.onUserInputKeyChangeCallback, false);
			this.onUserInputKeyChangeCallback = null;

			this.el.removeEventListener("scroll", this.onElementScrollCallback, false);
			this.onElementScrollCallback = null;
		}
	}
}