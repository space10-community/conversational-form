/// <reference path="Button.ts"/>
/// <reference path="ControlElement.ts"/>
/// <reference path="RadioButton.ts"/>
/// <reference path="CheckboxButton.ts"/>
/// <reference path="OptionsList.ts"/>
/// <reference path="UploadFileUI.ts"/>
/// <reference path="../ScrollController.ts"/>
/// <reference path="../chat/ChatResponse.ts"/>
/// <reference path="../../../typings/es6-promise/es6-promise.d.ts"/>

// namespace
namespace cf {
	export interface ControlElementsDTO{
		height: number;
	}

	export interface IControlElementsOptions{
		el: HTMLElement;
	}

	export class ControlElements {
		private elements: Array<IControlElement | OptionsList>;
		private el: HTMLElement;
		private list: HTMLElement;

		private userInputUpdateCallback: () => void;
		private onChatAIReponseCallback: () => void;
		private onUserInputKeyChangeCallback: () => void;
		private onElementFocusCallback: () => void;
		private onScrollCallback: () => void;

		private elementWidth: number = 0;
		private filterListNumberOfVisible: number = 0;
		private listScrollController: ScrollController;

		private rAF: number;
		private listWidth: number = 0;

		public get active():boolean{
			return this.elements.length > 0;
		}

		constructor(options: IControlElementsOptions){
			this.el = options.el;
			this.list = <HTMLElement> this.el.getElementsByTagName("cf-list")[0];

			this.onScrollCallback = this.onScroll.bind(this);
			this.el.addEventListener('scroll', this.onScrollCallback, false);

			this.onElementFocusCallback = this.onElementFocus.bind(this);
			document.addEventListener(ControlElementEvents.ON_FOCUS, this.onElementFocusCallback, false);

			this.onChatAIReponseCallback = this.onChatAIReponse.bind(this);
			document.addEventListener(ChatResponseEvents.AI_QUESTION_ASKED, this.onChatAIReponseCallback, false);

			this.onUserInputKeyChangeCallback = this.onUserInputKeyChange.bind(this);
			document.addEventListener(UserInputEvents.KEY_CHANGE, this.onUserInputKeyChangeCallback, false);

			// user input update
			this.userInputUpdateCallback = this.onUserInputUpdate.bind(this);
			document.addEventListener(FlowEvents.USER_INPUT_UPDATE, this.userInputUpdateCallback, false);

			this.listScrollController = new ScrollController({
				interactionListener: this.el,
				listToScroll: this.list,
				listNavButtons: this.el.getElementsByTagName("cf-list-button"),
			});
		}

		private onScroll(event: Event){
			// some times the tabbing will result in el scroll, reset this.
			this.el.scrollLeft = 0;
		}

		private onElementFocus(event: CustomEvent){
			const vector: ControlElementVector = <ControlElementVector> event.detail;
			const x: number = (vector.left != 0 ? vector.left - vector.width : 0) * -1;
			this.listScrollController.setScroll(x, 0);
		}

		private onChatAIReponse(event:CustomEvent){
			this.animateElementsIn();
		}

		private onUserInputKeyChange(event: CustomEvent){
			const dto: InputKeyChangeDTO = event.detail;
			if(this.active){
				let shouldFilter: boolean = dto.inputFieldActive;
				if(shouldFilter){
					// input field is active, so we should filter..
					const dto: FlowDTO = (<InputKeyChangeDTO> event.detail).dto;
					const inputValue: string = dto.input.getInputValue();
					this.filterElementsFrom(inputValue);
				}
			}
		}

		private onUserInputUpdate(event: CustomEvent){
			if(this.elements){
				for (var i = 0; i < this.elements.length; i++) {
					let element: ControlElement = <ControlElement>this.elements[i];
					element.animateOut();
				}
			}
		}

		private filterElementsFrom(value:string){
			const inputValuesLowerCase: Array<string> = value.toLowerCase().split(" ");
			if(inputValuesLowerCase.indexOf("") != -1)
				inputValuesLowerCase.splice(inputValuesLowerCase.indexOf(""), 1);

			const isElementsOptionsList: boolean = (<any>this.elements[0].constructor).name == "OptionsList";
			const elements: Array <any> = (isElementsOptionsList ? (<OptionsList> this.elements[0]).elements : this.elements);
			// the type is not strong with this one..

			let itemsVisible: Array<ControlElement> = [];
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

				element.highlight = false;

				// set element visibility.
				element.visible = elementVisibility;
				if(elementVisibility && element.visible) 
					itemsVisible.push(element);
			}

			// set feedback text for filter..
			const infoElement: HTMLElement = <HTMLElement> this.el.getElementsByTagName("cf-info")[0];
			infoElement.innerHTML = itemsVisible.length == 0 ? Dictionary.get("input-no-filter").split("{input-value}").join(value) : "";
			if(itemsVisible.length == 0){
				infoElement.classList.add("show");
			}else{
				infoElement.classList.remove("show");
				
				// highlight first item when filtering
				itemsVisible[0].highlight = true;
			}

			// crude way of checking if list has changed...
			const hasListChanged: boolean = this.filterListNumberOfVisible != itemsVisible.length;
			if(hasListChanged){
				this.resize();
				this.animateElementsIn();
			}
			
			this.filterListNumberOfVisible = itemsVisible.length;
		}

		private animateElementsIn(){
			if(!this.el.classList.contains("animate-in"))
				this.el.classList.add("animate-in");

			for (let i = 0; i < this.elements.length; i++) {
				let element: ControlElement = <ControlElement>this.elements[i];
				element.animateIn();
			}
		}

		public canClickOnHighlightedItem(): boolean {
			const elements: Array <any> = (<any>this.elements[0].constructor).name == "OptionsList" ? (<OptionsList> this.elements[0]).elements : this.elements;

			for (let i = 0; i < elements.length; i++) {
				let element: IControlElement = <IControlElement>elements[i];
				if(element.highlight){
					element.el.click();
					return true;
				}
			}

			return false;
		}

		public setFocusOnElement(index: number){
			const isElementsOptionsList: boolean = (<any>this.elements[0].constructor).name == "OptionsList";
			const elements: Array <any> = (isElementsOptionsList ? (<OptionsList> this.elements[0]).elements : this.elements);
			index = index == -1 ? elements.length - 1 : index;
			if(elements)
				elements[index].el.focus();
		}

		public updateStateOnElements(controlElement: IControlElement){
			this.list.classList.add("disabled");
			if(controlElement.type == "RadioButton"){
				// uncheck other radio buttons...
				for (let i = 0; i < this.elements.length; i++) {
					let element: RadioButton = <RadioButton>this.elements[i];
					if(element != controlElement){
						element.checked = false;
					}
				}
			}
		}

		public reset(){
			this.el.classList.remove("one-row");
			this.el.classList.remove("two-row");
		}

		public getElement(index: number):IControlElement | OptionsList{
			return this.elements[index];
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
							}

							dto.controlElements.push(element);
						}
						
						dto.text = Dictionary.parseAndGetMultiValueString(values);
						
						break;

					case "RadioButton" :
						for (var i = 0; i < this.elements.length; i++) {
							let element: RadioButton = <RadioButton> this.elements[i];

							if(element.checked){
								dto.text = element.value;
							}

							dto.controlElements.push(element);
						}
						break;
					case "OptionsList":
						var element: OptionsList = <OptionsList> this.elements[0];
						dto.controlElements = element.getValue();

						var values: Array<string> = [];
						if(dto.controlElements && dto.controlElements[0]){
							for (let i = 0; i < dto.controlElements.length; i++) {
								let element: IControlElement = <IControlElement>dto.controlElements[i];
								values.push(dto.controlElements[i].value);
							}
						}

						// after value is created then set to all elements
						dto.controlElements = element.elements;

						dto.text = Dictionary.parseAndGetMultiValueString(values);

						break;
					
					case "UploadFileUI":
						dto.text = (<UploadFileUI> this.elements[0]).value;//Dictionary.parseAndGetMultiValueString(values);
						dto.controlElements.push(<UploadFileUI> this.elements[0]);
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
					this.elements.pop().dealloc();
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
					
					case "input" :
					default :
						if(tag.type == "file"){
							this.elements.push(new UploadFileUI({
								referenceTag: tag,
							}));
						}
						// nothing to add.
						console.log("UserInput buildControlElements:", "none Control UI type, only input field is needed.");
						break;
				}

				if(tag.type != "select" && this.elements.length > 0){
					const element: IControlElement = <IControlElement> this.elements[this.elements.length - 1];
					this.list.appendChild(element.el);
				}
			}

			const isElementsOptionsList: boolean = this.elements[0] && (<any>this.elements[0].constructor).name == "OptionsList";
			if(isElementsOptionsList){
				this.filterListNumberOfVisible = (<OptionsList> this.elements[0]).elements.length;
			}else{
				this.filterListNumberOfVisible = tags.length;
			}

			new Promise((resolve: any, reject: any) => this.resize(resolve, reject)).then(() => {
				const h: number = this.el.classList.contains("one-row") ? 52 : this.el.classList.contains("two-row") ? 102 : 0;

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
			this.elementWidth = 0;

			setTimeout(() => {
				this.listWidth = 0;
				const isElementsOptionsList: boolean = this.elements[0] && (<any>this.elements[0].constructor).name == "OptionsList";
				const elements: Array <any> = (isElementsOptionsList ? (<OptionsList> this.elements[0]).elements : this.elements);
				if(elements.length > 0){
					
					for (let i = 0; i < elements.length; i++) {
						let element: IControlElement = <IControlElement>elements[i];
						let rect: ControlElementVector = element.rect;
						this.listWidth += rect.width;
					}

					const elOffsetWidth: number = this.el.offsetWidth;
					let isListWidthOverElementWidth: boolean = this.listWidth > elOffsetWidth;
					if(isListWidthOverElementWidth){
						this.el.classList.add("two-row");
						this.listWidth = Math.max(elOffsetWidth, Math.round((this.listWidth / 2) + 50));
						this.list.style.width = this.listWidth + "px";
					}else{
						this.el.classList.add("one-row");
					}

					// check again after classes are set.
					isListWidthOverElementWidth = this.listWidth > elOffsetWidth;

					// sort the list so we can set tabIndex properly
					const tabIndexFilteredElements: Array<ControlElement> = elements.sort((a: ControlElement, b: ControlElement) => {
						return a.rect.left == b.rect.left ? 0 : a.rect.left < b.rect.left ? -1 : 1;
					});

					for (let i = 0; i < tabIndexFilteredElements.length; i++) {
						let element: ControlElement = <ControlElement>tabIndexFilteredElements[i];
						element.tabIndex = 3 + i;
					}
					
					// toggle nav button visiblity
					cancelAnimationFrame(this.rAF);
					if(isListWidthOverElementWidth){
						this.el.classList.remove("hide-nav-buttons");
					}else{
						this.el.classList.add("hide-nav-buttons");
					}

					this.elementWidth = elOffsetWidth;

					// resize scroll
					this.listScrollController.resize(this.listWidth, this.elementWidth);
				}

				if(resolve)
					resolve();
			}, 0);
		}

		public dealloc(){
			cancelAnimationFrame(this.rAF);
			this.rAF = null;

			this.el.removeEventListener('scroll', this.onScrollCallback, false);
			this.onScrollCallback = null;

			document.removeEventListener(ControlElementEvents.ON_FOCUS, this.onElementFocusCallback, false);
			this.onElementFocusCallback = null;

			document.removeEventListener(ChatResponseEvents.AI_QUESTION_ASKED, this.onChatAIReponseCallback, false);
			this.onChatAIReponseCallback = null;

			document.removeEventListener(UserInputEvents.KEY_CHANGE, this.onUserInputKeyChangeCallback, false);
			this.onUserInputKeyChangeCallback = null;

			this.listScrollController.dealloc();
		}
	}
}