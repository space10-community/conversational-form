/// <reference path="Button.ts"/>
/// <reference path="ControlElement.ts"/>
/// <reference path="RadioButton.ts"/>
/// <reference path="CheckboxButton.ts"/>
/// <reference path="OptionsList.ts"/>
/// <reference path="UploadFileUI.ts"/>
/// <reference path="../../logic/EventDispatcher.ts"/>
/// <reference path="../ScrollController.ts"/>
/// <reference path="../chat/ChatResponse.ts"/>
/// <reference path="../../../typings/globals/es6-promise/index.d.ts"/>

// namespace
namespace cf {
	export interface ControlElementsDTO{
		height: number;
	}

	export interface IControlElementsOptions{
		el: HTMLElement;
		infoEl: HTMLElement;
		eventTarget: EventDispatcher;
	}

	export class ControlElements {
		private elements: Array<IControlElement | OptionsList>;
		private eventTarget: EventDispatcher;
		private el: HTMLElement;
		private list: HTMLElement;
		private infoElement: HTMLElement;
		private currentControlElement: IControlElement;

		private ignoreKeyboardInput: boolean = false;
		private rowIndex: number = -1;
		private columnIndex: number = 0;
		private tableableRows: Array<Array<IControlElement>>;

		private userInputUpdateCallback: () => void;
		private onChatReponsesUpdatedCallback: () => void;
		private onUserInputKeyChangeCallback: () => void;
		private onElementFocusCallback: () => void;
		private onScrollCallback: () => void;
		private onElementLoadedCallback: () => void;
		private onResizeCallback: () => void;

		private elementWidth: number = 0;
		private filterListNumberOfVisible: number = 0;
		private listScrollController: ScrollController;

		private rAF: number;
		private listWidth: number = 0;

		public get active():boolean{
			return this.elements && this.elements.length > 0;
		}

		public get focus():boolean{
			if(!this.elements)
				return false;

			const elements: Array<IControlElement> = this.getElements();
			for (var i = 0; i < elements.length; i++) {
				let element: ControlElement = <ControlElement>elements[i];
				if(element.focus){
					return true;
				}
			}

			return false;
		}

		public get highlighted():boolean{
			if(!this.elements)
				return false;

			const elements: Array<IControlElement> = this.getElements();
			for (var i = 0; i < elements.length; i++) {
				let element: ControlElement = <ControlElement>elements[i];
				if(element.highlight){
					return true;
				}
			}

			return false;
		}

		public set disabled(value: boolean){
			if(value)
				this.list.classList.add("disabled");
			else
				this.list.classList.remove("disabled");
		}

		public get length(): number{
			const elements: Array<IControlElement> = this.getElements();
			return elements.length;
		}

		constructor(options: IControlElementsOptions){
			this.el = options.el;
			this.eventTarget = options.eventTarget;
			this.list = <HTMLElement> this.el.getElementsByTagName("cf-list")[0];
			this.infoElement = options.infoEl;

			this.onScrollCallback = this.onScroll.bind(this);
			this.el.addEventListener('scroll', this.onScrollCallback, false);

			this.onResizeCallback = this.onResize.bind(this);
			window.addEventListener('resize', this.onResizeCallback, false);

			this.onElementFocusCallback = this.onElementFocus.bind(this);
			this.eventTarget.addEventListener(ControlElementEvents.ON_FOCUS, this.onElementFocusCallback, false);

			this.onElementLoadedCallback = this.onElementLoaded.bind(this);
			this.eventTarget.addEventListener(ControlElementEvents.ON_LOADED, this.onElementLoadedCallback, false);

			this.onChatReponsesUpdatedCallback = this.onChatReponsesUpdated.bind(this);
			this.eventTarget.addEventListener(ChatListEvents.CHATLIST_UPDATED, this.onChatReponsesUpdatedCallback, false);

			this.onUserInputKeyChangeCallback = this.onUserInputKeyChange.bind(this);
			this.eventTarget.addEventListener(UserInputEvents.KEY_CHANGE, this.onUserInputKeyChangeCallback, false);

			// user input update
			this.userInputUpdateCallback = this.onUserInputUpdate.bind(this);
			this.eventTarget.addEventListener(FlowEvents.USER_INPUT_UPDATE, this.userInputUpdateCallback, false);

			this.listScrollController = new ScrollController({
				interactionListener: this.el,
				listToScroll: this.list,
				eventTarget: this.eventTarget,
				listNavButtons: this.el.getElementsByTagName("cf-list-button"),
			});
		}

		private onScroll(event: Event){
			// some times the tabbing will result in el scroll, reset this.
			this.el.scrollLeft = 0;
		}

		/**
		* @name onElementLoaded
		* when element is loaded, usally image loaded.
		*/
		private onElementLoaded(event: CustomEvent){
			this.onResize(null);
		}

		private onElementFocus(event: CustomEvent){
			const vector: ControlElementVector = <ControlElementVector> event.detail;
			let x: number = (vector.x + vector.width < this.elementWidth ? 0 : vector.x - vector.width);
			x *= -1;

			this.updateRowColIndexFromVector(vector);

			this.listScrollController.setScroll(x, 0);
		}

		private updateRowColIndexFromVector(vector: ControlElementVector){
			for (let i = 0; i < this.tableableRows.length; i++) {
				let items: Array <IControlElement> = this.tableableRows[i];
			
				for (let j = 0; j < items.length; j++) {
					let item: IControlElement = items[j];
					if(item == vector.el){
						this.rowIndex = i;
						this.columnIndex = j;
						break;
					}
				}
			}
		}

		private onChatReponsesUpdated(event:CustomEvent){
			this.animateElementsIn();
		}

		private onUserInputKeyChange(event: CustomEvent){
			if(this.ignoreKeyboardInput){
				this.ignoreKeyboardInput = false;
				return;
			}

			const dto: InputKeyChangeDTO = event.detail;
			const userInput: UserInput = dto.dto.input;

			if(this.active){
				const isNavKey: boolean = [Dictionary.keyCodes["left"], Dictionary.keyCodes["right"], Dictionary.keyCodes["down"], Dictionary.keyCodes["up"]].indexOf(dto.keyCode) != -1;
				const shouldFilter: boolean = dto.inputFieldActive && !isNavKey;

				if(shouldFilter){
					// input field is active, so we should filter..
					const dto: FlowDTO = (<InputKeyChangeDTO> event.detail).dto;
					const inputValue: string = dto.input.getInputValue();
					this.filterElementsFrom(inputValue);
				}else{
					if(dto.keyCode == Dictionary.keyCodes["left"]){
						this.columnIndex--;
					}else if(dto.keyCode == Dictionary.keyCodes["right"]){
						this.columnIndex++;
					}else if(dto.keyCode == Dictionary.keyCodes["down"]){
						this.updateRowIndex(1);
					}else if(dto.keyCode == Dictionary.keyCodes["up"]){
						this.updateRowIndex(-1);
					}else if(dto.keyCode == Dictionary.keyCodes["enter"] || dto.keyCode == Dictionary.keyCodes["space"]){
						if(this.tableableRows[this.rowIndex] && this.tableableRows[this.rowIndex][this.columnIndex]){
							this.tableableRows[this.rowIndex][this.columnIndex].el.click();
						}else if(this.tableableRows[0] && this.tableableRows[0].length == 1){
							// this is when only one element in a filter, then we click it!
							this.tableableRows[0][0].el.click();
						}
					}

					if(!this.validateRowColIndexes()){
						userInput.setFocusOnInput();
					}
				}
			}

			if(!userInput.active && this.validateRowColIndexes() && this.tableableRows && (this.rowIndex == 0 || this.rowIndex == 1)){
				this.tableableRows[this.rowIndex][this.columnIndex].focus = true;
			}else if(!userInput.active){
				userInput.setFocusOnInput();
			}
		}

		private validateRowColIndexes():boolean{
			const maxRowIndex: number = (this.el.classList.contains("two-row") ? 1 : 0)
			if(this.rowIndex != -1 && this.tableableRows[this.rowIndex]){
				// columnIndex is only valid if rowIndex is valid
				if(this.columnIndex < 0){
					this.columnIndex = this.tableableRows[this.rowIndex].length - 1;
				}

				if(this.columnIndex > this.tableableRows[this.rowIndex].length - 1){
					this.columnIndex = 0;
				}

				return true;
			}else{
				this.resetTabList();
				return false;
			}
		}

		private updateRowIndex(direction: number){
			const oldRowIndex: number = this.rowIndex;
			this.rowIndex += direction;

			if(this.tableableRows[this.rowIndex]){
				// when row index is changed we need to find the closest column element, we cannot expect them to be indexly aligned
				const centerX: number = this.tableableRows[oldRowIndex] ? this.tableableRows[oldRowIndex][this.columnIndex].positionVector.centerX : 0
				const items: Array <IControlElement> = this.tableableRows[this.rowIndex];
				let currentDistance: number = 10000000000000;
				for (let i = 0; i < items.length; i++) {
					let element: IControlElement = <IControlElement>items[i];
					if(currentDistance > Math.abs(centerX - element.positionVector.centerX)){
						currentDistance = Math.abs(centerX - element.positionVector.centerX);
						this.columnIndex = i;
					}
				}
			}
		}

		private resetTabList(){
			this.rowIndex = -1;
			this.columnIndex = -1;
		}

		private onUserInputUpdate(event: CustomEvent){
			this.el.classList.remove("animate-in");
			this.infoElement.classList.remove("show");

			if(this.elements){
				const elements: Array<IControlElement> = this.getElements();
				for (var i = 0; i < elements.length; i++) {
					let element: ControlElement = <ControlElement>elements[i];
					element.animateOut();
				}
			}
		}

		private filterElementsFrom(value:string){
			const inputValuesLowerCase: Array<string> = value.toLowerCase().split(" ");
			if(inputValuesLowerCase.indexOf("") != -1)
				inputValuesLowerCase.splice(inputValuesLowerCase.indexOf(""), 1);

			const elements: Array<IControlElement> = this.getElements();
			if(elements.length > 1){
				// the type is not strong with this one..
				let itemsVisible: Array<ControlElement> = [];
				for (let i = 0; i < elements.length; i++) {
					let element: ControlElement = <ControlElement>elements[i];
					element.highlight = false;
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
					if(elementVisibility && element.visible) 
						itemsVisible.push(element);
				}

				// set feedback text for filter..
				this.infoElement.innerHTML = itemsVisible.length == 0 ? Dictionary.get("input-no-filter").split("{input-value}").join(value) : "";
				if(itemsVisible.length == 0){
					this.infoElement.classList.add("show");
				}else{
					this.infoElement.classList.remove("show");
				}

				// crude way of checking if list has changed...
				const hasListChanged: boolean = this.filterListNumberOfVisible != itemsVisible.length;
				if(hasListChanged){
					this.resize();
					this.animateElementsIn();
				}
				
				this.filterListNumberOfVisible = itemsVisible.length;

				// highlight first item
				if(value != "" && this.filterListNumberOfVisible > 0)
					itemsVisible[0].highlight = true;
			}
		}

		public clickOnHighlighted(){
			const elements: Array<IControlElement> = this.getElements();
			for (let i = 0; i < elements.length; i++) {
				let element: ControlElement = <ControlElement>elements[i];
				if(element.highlight){
					element.el.click();
					break;
				}
			}
		}

		public animateElementsIn(){
			if(this.elements){
				const elements: Array<IControlElement> = this.getElements();
				if(elements.length > 0){
					if(!this.el.classList.contains("animate-in"))
						this.el.classList.add("animate-in");
					
					for (let i = 0; i < elements.length; i++) {
						let element: ControlElement = <ControlElement>elements[i];
						element.animateIn();
					}
				}
			}
		}

		private getElements(): Array <IControlElement> {
			if(this.elements && this.elements.length > 0 && this.elements[0].type == "OptionsList")
				return (<OptionsList> this.elements[0]).elements;
			
			return <Array<IControlElement>> this.elements;
		}

		/**
		* @name buildTabableRows
		* build the tabable array index
		*/
		private buildTabableRows(): void {
			this.tableableRows = [];
			this.resetTabList();

			const elements: Array<IControlElement> = this.getElements();

			if(this.el.classList.contains("two-row")){
				// two rows
				this.tableableRows[0] = [];
				this.tableableRows[1] = [];

				for (let i = 0; i < elements.length; i++) {
					let element: IControlElement = <IControlElement>elements[i];
					if(element.visible){
						// crude way of checking if element is top row or bottom row..
						if(element.positionVector.y < 30)
							this.tableableRows[0].push(element);
						else
							this.tableableRows[1].push(element);
					}
				}
			}else{
				// single row
				this.tableableRows[0] = [];

				for (let i = 0; i < elements.length; i++) {
					let element: IControlElement = <IControlElement>elements[i];
					if(element.visible)
						this.tableableRows[0].push(element);
				}
			}
		}

		public resetAfterErrorMessage(){
			if(this.currentControlElement){
				//reverse value of currentControlElement.
				(<RadioButton | CheckboxButton>this.currentControlElement).checked = !(<RadioButton | CheckboxButton>this.currentControlElement).checked;
				this.currentControlElement = null;
			}

			this.disabled = false;
		}
		
		public focusFrom(angle: string){
			if(!this.tableableRows)
				return;

			this.columnIndex = 0;
			if(angle == "bottom"){
				this.rowIndex = this.el.classList.contains("two-row") ? 1 : 0;
			}else if(angle == "top"){
				this.rowIndex = 0;
			}

			if(this.tableableRows[this.rowIndex] && this.tableableRows[this.rowIndex][this.columnIndex]){
				this.ignoreKeyboardInput = true;
				this.tableableRows[this.rowIndex][this.columnIndex].focus = true;
			}else{
				this.resetTabList();
			}
		}

		public updateStateOnElementsFromTag(tag: ITag){
			for (var index = 0; index < this.elements.length; index++) {
				var element: any = this.elements[index];

				if(element.referenceTag == tag){
					this.updateStateOnElements(element);
					break;
				}
			}
		}

		public updateStateOnElements(controlElement: IControlElement){
			this.currentControlElement = controlElement;

			if(this.currentControlElement.type == "RadioButton"){
				// uncheck other radio buttons...
				const elements: Array<IControlElement> = this.getElements();
				for (let i = 0; i < elements.length; i++) {
					let element: RadioButton = <RadioButton>elements[i];
					if(element != controlElement){
						element.checked = false;
					}else{
						element.checked = true;
					}
				}
			}else if(this.currentControlElement.type == "CheckboxButton"){
				// change only the changed input
				const elements: Array<IControlElement> = this.getElements();
				for (let i = 0; i < elements.length; i++) {
					let element: CheckboxButton = <CheckboxButton>elements[i];
					if(element == controlElement){
						const isChecked: boolean = (<HTMLInputElement> element.referenceTag.domElement).checked;
						element.checked = isChecked;
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
						let numChecked: number = 0;// check if more than 1 is checked.
						var values: Array<string> = [];
						for (var i = 0; i < this.elements.length; i++) {
							let element: CheckboxButton = <CheckboxButton> this.elements[i];
							if(element.checked){
								if(numChecked++ > 1)
									break;
							}
						}

						for (var i = 0; i < this.elements.length; i++) {
							let element: CheckboxButton = <CheckboxButton> this.elements[i];
							if(element.checked){
								if(numChecked > 1)
									element.partOfSeveralChoices = true;

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
						dto.text = (<UploadFileUI> this.elements[0]).getFilesAsString();//Dictionary.parseAndGetMultiValueString(values);
						dto.controlElements.push(<UploadFileUI> this.elements[0]);
						break;
				}
			}

			return dto;
		}

		public clearTagsAndReset(){
			this.reset();

			if(this.elements){
				while(this.elements.length > 0){
					this.elements.pop().dealloc();
				}
			}
		}

		public buildTags(tags: Array<ITag>){
			this.disabled = false;

			const topList: HTMLUListElement = (<HTMLUListElement > this.el.parentNode).getElementsByTagName("ul")[0];
			const bottomList: HTMLUListElement = (<HTMLUListElement> this.el.parentNode).getElementsByTagName("ul")[1];

			// remove old elements
			this.clearTagsAndReset();

			this.elements = [];

			for (var i = 0; i < tags.length; i++) {
				var tag: ITag = tags[i];

				switch(tag.type){
					case "radio" :
						this.elements.push(new RadioButton({
							referenceTag: tag,
							eventTarget: this.eventTarget
						}));
						break;
					case "checkbox" :
						this.elements.push(new CheckboxButton({
							referenceTag: tag,
							eventTarget: this.eventTarget
						}));
					
						break;
					case "select" :
						this.elements.push(new OptionsList({
							referenceTag: tag,
							context: this.list,
							eventTarget: this.eventTarget
						}));
						break;
					case "input" :
					default :
						if(tag.type == "file"){
							this.elements.push(new UploadFileUI({
								referenceTag: tag,
								eventTarget: this.eventTarget
							}));
						}
						// nothing to add.
						// console.log("UserInput buildControlElements:", "none Control UI type, only input field is needed.");
						break;
				}

				if(tag.type != "select" && this.elements.length > 0){
					const element: IControlElement = <IControlElement> this.elements[this.elements.length - 1];
					this.list.appendChild(element.el);
				}
			}

			const isElementsOptionsList: boolean = this.elements[0] && this.elements[0].type == "OptionsList";
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
				this.eventTarget.dispatchEvent(new CustomEvent(UserInputEvents.CONTROL_ELEMENTS_ADDED, {
					detail: controlElementsAddedDTO
				}));
			});
		}

		private onResize(event: Event){
			this.resize();
		}

		public resize(resolve?: any, reject?: any){
			// scrollbar things
			// Element.offsetWidth - Element.clientWidth
			this.list.style.width = "100%";
			this.el.classList.remove("resized")
			this.el.classList.remove("one-row");
			this.el.classList.remove("two-row");
			this.elementWidth = 0;

			setTimeout(() => {
				this.listWidth = 0;
				const elements: Array <IControlElement> = this.getElements();

				if(elements && elements.length > 0){
					const listWidthValues: Array<number> = [];
					const listWidthValues2: Array<IControlElement> = [];
					let containsElementWithImage: boolean = false;
					for (let i = 0; i < elements.length; i++) {
						let element: IControlElement = <IControlElement>elements[i];
						if(element.visible){
							element.calcPosition();
							this.listWidth += element.positionVector.width;
							listWidthValues.push(element.positionVector.x + element.positionVector.width);
							listWidthValues2.push(element);
						}

						if(element.hasImage())
							containsElementWithImage = true;
					}

					const elOffsetWidth: number = this.el.offsetWidth;
					let isListWidthOverElementWidth: boolean = this.listWidth > elOffsetWidth;
					if(isListWidthOverElementWidth && !containsElementWithImage){
						this.el.classList.add("two-row");
						this.listWidth = Math.max(elOffsetWidth, Math.round((listWidthValues[Math.floor(listWidthValues.length / 2)]) + 50));
						this.list.style.width = this.listWidth + "px";
					}else{
						this.el.classList.add("one-row");
					}

					setTimeout(() => {
						// recalc after LIST classes has been added
						for (let i = 0; i < elements.length; i++) {
							let element: IControlElement = <IControlElement>elements[i];
							if(element.visible){
								element.calcPosition();
							}
						}

						// check again after classes are set.
						isListWidthOverElementWidth = this.listWidth > elOffsetWidth;

						// sort the list so we can set tabIndex properly
						var elementsCopyForSorting: Array <IControlElement> = elements.slice();
						const tabIndexFilteredElements: Array<IControlElement> = elementsCopyForSorting.sort((a: IControlElement, b: IControlElement) => {
							const aOverB: boolean = a.positionVector.y > b.positionVector.y;
							return a.positionVector.x == b.positionVector.x ? (aOverB ? 1 : -1) : a.positionVector.x < b.positionVector.x ? -1 : 1;
						});

						let tabIndex: number = 0;
						for (let i = 0; i < tabIndexFilteredElements.length; i++) {
							let element: IControlElement = <IControlElement>tabIndexFilteredElements[i];
							if(element.visible){
								//tabindex 1 are the UserInput element
								element.tabIndex = 2 + (tabIndex++);
							}else{
								element.tabIndex = -1;
							}
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

						this.buildTabableRows();

						this.el.classList.add("resized");

						if(resolve)
							resolve();
					}, 0);
				}
			}, 0);
		}

		public dealloc(){
			this.currentControlElement = null;
			this.tableableRows = null;

			cancelAnimationFrame(this.rAF);
			this.rAF = null;

			window.removeEventListener('resize', this.onResizeCallback, false);
			this.onResizeCallback = null;

			this.el.removeEventListener('scroll', this.onScrollCallback, false);
			this.onScrollCallback = null;

			this.eventTarget.removeEventListener(ControlElementEvents.ON_FOCUS, this.onElementFocusCallback, false);
			this.onElementFocusCallback = null;

			this.eventTarget.removeEventListener(ChatListEvents.CHATLIST_UPDATED, this.onChatReponsesUpdatedCallback, false);
			this.onChatReponsesUpdatedCallback = null;

			this.eventTarget.removeEventListener(UserInputEvents.KEY_CHANGE, this.onUserInputKeyChangeCallback, false);
			this.onUserInputKeyChangeCallback = null;

			this.eventTarget.removeEventListener(FlowEvents.USER_INPUT_UPDATE, this.userInputUpdateCallback, false);
			this.userInputUpdateCallback = null;

			this.eventTarget.removeEventListener(ControlElementEvents.ON_LOADED, this.onElementLoadedCallback, false);
			this.onElementLoadedCallback = null;

			this.listScrollController.dealloc();
		}
	}
}