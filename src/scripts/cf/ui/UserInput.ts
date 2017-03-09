/// <reference path="BasicElement.ts"/>
/// <reference path="control-elements/ControlElements.ts"/>
/// <reference path="../logic/FlowManager.ts"/>

// namespace
namespace cf {
	// interface

	export interface InputKeyChangeDTO{
		dto: FlowDTO,
		keyCode: number,
		inputFieldActive: boolean
	}

	export interface IUserInputOptions extends IBasicElementOptions{
		cfReference: ConversationalForm
	}

	export const UserInputEvents = {
		SUBMIT: "cf-input-user-input-submit",
		//	detail: string

		KEY_CHANGE: "cf-input-key-change",
		//	detail: string

		CONTROL_ELEMENTS_ADDED: "cf-input-control-elements-added",
		//	detail: string
	}

	// class
	export class UserInput extends BasicElement {
		public static preventAutoFocus: boolean = false;

		public static ERROR_TIME: number = 2000;
		public el: HTMLElement;

		private cfReference: ConversationalForm;
		private inputElement: HTMLTextAreaElement;
		private submitButton: HTMLButtonElement;
		private currentValue: string = "";
		private windowFocusCallback: () => void;
		private flowUpdateCallback: () => void;
		private inputInvalidCallback: () => void;
		private onControlElementSubmitCallback: () => void;
		private onSubmitButtonClickCallback: () => void;
		private onInputFocusCallback: () => void;
		private onInputBlurCallback: () => void;
		private onControlElementProgressChangeCallback: () => void;
		private errorTimer: number = 0;
		private shiftIsDown: boolean = false;
		private _disabled: boolean = false;
		private keyUpCallback: () => void;
		private keyDownCallback: () => void;

		private controlElements: ControlElements;
		private _currentTag: ITag | ITagGroup;

		//acts as a fallb ack for ex. shadow dom implementation
		private _active: boolean = false;
		public get active(): boolean{
			return this.inputElement === document.activeElement || this._active;
		}

		public set visible(value: boolean){
			if(!this.el.classList.contains("animate-in") && value)
				this.el.classList.add("animate-in");
			else if(this.el.classList.contains("animate-in") && !value)
				this.el.classList.remove("animate-in");
		}

		public get currentTag(): ITag | ITagGroup{
			return this._currentTag;
		}

		public set disabled(value: boolean){
			const hasChanged: boolean = this._disabled != value;
			if(hasChanged){
				this._disabled = value;
				if(value){
					this.el.setAttribute("disabled", "disabled");
					this.inputElement.blur();
				}else{
					this.setFocusOnInput();
					this.el.removeAttribute("disabled");
				}
			}
		}

		constructor(options: IUserInputOptions){
			super(options);

			this.cfReference = options.cfReference;
			this.eventTarget = options.eventTarget;
			this.inputElement = this.el.getElementsByTagName("textarea")[0];
			this.onInputFocusCallback = this.onInputFocus.bind(this);
			this.inputElement.addEventListener('focus', this.onInputFocusCallback, false);
			this.onInputBlurCallback = this.onInputBlur.bind(this);
			this.inputElement.addEventListener('blur', this.onInputBlurCallback, false);

			//<cf-input-control-elements> is defined in the ChatList.ts
			this.controlElements = new ControlElements({
				el: <HTMLElement> this.el.getElementsByTagName("cf-input-control-elements")[0],
				infoEl: <HTMLElement> this.el.getElementsByTagName("cf-info")[0],
				eventTarget: this.eventTarget
			})

			// setup event listeners
			this.windowFocusCallback = this.windowFocus.bind(this);
			window.addEventListener('focus', this.windowFocusCallback, false);

			this.keyUpCallback = this.onKeyUp.bind(this);
			document.addEventListener("keyup", this.keyUpCallback, false);

			this.keyDownCallback = this.onKeyDown.bind(this);
			document.addEventListener("keydown", this.keyDownCallback, false);

			this.flowUpdateCallback = this.onFlowUpdate.bind(this);
			this.eventTarget.addEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);

			this.inputInvalidCallback = this.inputInvalid.bind(this);
			this.eventTarget.addEventListener(FlowEvents.USER_INPUT_INVALID, this.inputInvalidCallback, false);

			this.onControlElementSubmitCallback = this.onControlElementSubmit.bind(this);
			this.eventTarget.addEventListener(ControlElementEvents.SUBMIT_VALUE, this.onControlElementSubmitCallback, false);

			this.onControlElementProgressChangeCallback = this.onControlElementProgressChange.bind(this);
			this.eventTarget.addEventListener(ControlElementEvents.PROGRESS_CHANGE, this.onControlElementProgressChangeCallback, false);

			this.submitButton = <HTMLButtonElement> this.el.getElementsByTagName("cf-input-button")[0];
			this.onSubmitButtonClickCallback = this.onSubmitButtonClick.bind(this);
			this.submitButton.addEventListener("click", this.onSubmitButtonClickCallback, false);
		}

		public getInputValue():string{
			const str: string = this.inputElement.value;

			// Build-in way to handle XSS issues ->
			const div = document.createElement('div');
			div.appendChild(document.createTextNode(str));
			return div.innerHTML;
		}

		public getFlowDTO():FlowDTO{
			let value: FlowDTO;// = this.inputElement.value;

			// check for values on control elements as they should overwrite the input value.
			if(this.controlElements && this.controlElements.active){
				value = <FlowDTO> this.controlElements.getDTO();
			}else{
				value = <FlowDTO> {
					text: this.getInputValue()
				};
			}

			value.input = this;

			return value;
		}

		public reset(){
			if(this.controlElements){
				this.controlElements.clearTagsAndReset()
			}
		}

		public onFlowStopped(){
			if(this.controlElements)
				this.controlElements.clearTagsAndReset();
			
			this.disabled = true;
			this.visible = false;
		}

		private onInputChange(){
			if(!this.active && !this.controlElements.active)
				return;

			this.inputElement.style.height = "0px";
			this.inputElement.style.height = this.inputElement.scrollHeight + "px";
		}

		private inputInvalid(event: CustomEvent){
			ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);
			const dto: FlowDTO = event.detail;

			this.inputElement.setAttribute("data-value", this.inputElement.value);
			this.inputElement.value = "";

			this.el.setAttribute("error", "");
			this.disabled = true;
			// cf-error
			this.inputElement.setAttribute("placeholder", dto.errorText || this._currentTag.errorMessage);
			clearTimeout(this.errorTimer);

			this.errorTimer = setTimeout(() => {
				this.disabled = false;
				this.el.removeAttribute("error");
				this.inputElement.value = this.inputElement.getAttribute("data-value");
				this.inputElement.setAttribute("data-value", "");
				this.setPlaceholder();
				this.setFocusOnInput();

				if(this.controlElements)
					this.controlElements.resetAfterErrorMessage();

			}, UserInput.ERROR_TIME);
		}

		private setPlaceholder() {
			if(this._currentTag){
				if(this._currentTag.inputPlaceholder){
					this.inputElement.setAttribute("placeholder", this._currentTag.inputPlaceholder);
				}else{
					this.inputElement.setAttribute("placeholder", this._currentTag.type == "group" ? Dictionary.get("group-placeholder") : Dictionary.get("input-placeholder"));
				}
			}else{
				this.inputElement.setAttribute("placeholder", Dictionary.get("group-placeholder"));
			}
		}

		private onFlowUpdate(event: CustomEvent){
			ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);

			// animate input field in
			this.visible = true;

			this._currentTag = <ITag | ITagGroup> event.detail;

			this.el.setAttribute("tag-type", this._currentTag.type);

			// set input field to type password if the dom input field is that, covering up the input
			this.inputElement.setAttribute("type", this._currentTag.type == "password" ? "password" : "input");

			clearTimeout(this.errorTimer);
			this.el.removeAttribute("error");
			this.inputElement.setAttribute("data-value", "");
			this.inputElement.value = "";

			this.setPlaceholder();

			this.resetValue();

			if(!UserInput.preventAutoFocus)
				this.setFocusOnInput();

			this.controlElements.reset();

			if(this._currentTag.type == "group"){
				this.buildControlElements((<ITagGroup> this._currentTag).elements);
			}else{
				this.buildControlElements([this._currentTag]);
			}

			if(this._currentTag.type == "text" || this._currentTag.type == "email"){
				this.inputElement.value = this._currentTag.defaultValue.toString();
				this.onInputChange();
			}

			setTimeout(() => {
				this.disabled = false;
			}, 150);
		}

		private onControlElementProgressChange(event: CustomEvent){
			const status: string = event.detail;
			this.disabled = status == ControlElementProgressStates.BUSY;
		}

		private buildControlElements(tags: Array<ITag>){
			this.controlElements.buildTags(tags);
		}

		private onControlElementSubmit(event: CustomEvent){
			ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);

			// when ex a RadioButton is clicked..
			const controlElement: IControlElement = <IControlElement> event.detail;

			this.controlElements.updateStateOnElements(controlElement);

			this.doSubmit();
		}

		private onSubmitButtonClick(event: MouseEvent){
			this.onEnterOrSubmitButtonSubmit(event);
		}

		private onKeyDown(event: KeyboardEvent){
			if(!this.active && !this.controlElements.focus)
				return;

			if(event.keyCode == Dictionary.keyCodes["shift"])
				this.shiftIsDown = true;
			
			// prevent textarea line breaks
			if(event.keyCode == Dictionary.keyCodes["enter"] && !event.shiftKey)
				event.preventDefault();
			else{
				// handle password input
				if(this._currentTag && this._currentTag.type == "password"){
					if(event.key.toLowerCase() == "backspace")
						this.currentValue = this.currentValue.length > 0 ? this.currentValue.slice(0, this.currentValue.length - 1) : "";
					else
						this.currentValue += event.key;
				}
			}
		}

		private onKeyUp(event: KeyboardEvent){
			if(!this.active && !this.controlElements.focus)
				return;

			// reset current value, happens when user selects all text and delete or cmd+backspace
			if(this.inputElement.value == "" || this.inputElement.selectionStart != this.inputElement.selectionEnd)
				this.currentValue = "";

			if(event.keyCode == Dictionary.keyCodes["shift"]){
				this.shiftIsDown = false;
			}else if(event.keyCode == Dictionary.keyCodes["up"]){
				event.preventDefault();

				if(this.active && !this.controlElements.focus)
					this.controlElements.focusFrom("bottom");
			}else if(event.keyCode == Dictionary.keyCodes["down"]){
				event.preventDefault();

				if(this.active && !this.controlElements.focus)
					this.controlElements.focusFrom("top");
			}else if(event.keyCode == Dictionary.keyCodes["tab"]){
				// tab key pressed, check if node is child of CF, if then then reset focus to input element

				var doesKeyTargetExistInCF: boolean = false;
				var node = (<HTMLElement> event.target).parentNode;
				while (node != null) {
					if (node === this.cfReference.el) {
						doesKeyTargetExistInCF = true;
						break;
					}

					node = node.parentNode;
				}
				
				// prevent normal behaviour, we are not here to take part, we are here to take over!
				if(!doesKeyTargetExistInCF){
					event.preventDefault();
					if(!this.controlElements.active)
						this.setFocusOnInput();
				}
			}

			if(this.el.hasAttribute("disabled"))
				return;

			const value: FlowDTO = this.getFlowDTO();

			if((event.keyCode == Dictionary.keyCodes["enter"] && !event.shiftKey) || event.keyCode == Dictionary.keyCodes["space"]){
				if(event.keyCode == Dictionary.keyCodes["enter"] && this.active){
					event.preventDefault();
					this.onEnterOrSubmitButtonSubmit();
				}else{
					// either click on submit button or do something with control elements
					if(event.keyCode == Dictionary.keyCodes["enter"] || event.keyCode == Dictionary.keyCodes["space"]){
						event.preventDefault();

						const tagType: string = this._currentTag.type == "group" ? (<TagGroup>this._currentTag).getGroupTagType() : this._currentTag.type;

						if(tagType == "select" || tagType == "checkbox"){
							const mutiTag: SelectTag | InputTag = <SelectTag | InputTag> this._currentTag;
							// if select or checkbox then check for multi select item
							if(tagType == "checkbox" || (<SelectTag> mutiTag).multipleChoice){
								if(this.active && event.keyCode == Dictionary.keyCodes["enter"]){
									// click on UserInput submit button, only ENTER allowed
									this.submitButton.click();
								}else{
									// let UI know that we changed the key
									this.dispatchKeyChange(value, event.keyCode);

									if(!this.active){
										// after ui has been selected we RESET the input/filter
										this.resetValue();
										this.setFocusOnInput();
										this.dispatchKeyChange(value, event.keyCode);
									}
								}
							}else{
								this.dispatchKeyChange(value, event.keyCode);
							}
						}else{
							if(this._currentTag.type == "group"){
								// let the controlements handle action
								this.dispatchKeyChange(value, event.keyCode);
							}
						}
					}else if(event.keyCode == Dictionary.keyCodes["space"] && document.activeElement){
						this.dispatchKeyChange(value, event.keyCode);
					}
				}
			}else if(event.keyCode != Dictionary.keyCodes["shift"] && event.keyCode != Dictionary.keyCodes["tab"]){
				this.dispatchKeyChange(value, event.keyCode)
			}

			// handle password input
			if(this._currentTag && this._currentTag.type == "password"){
				this.inputElement.value = this.currentValue.replace(/./g, () => "*");
			}

			this.onInputChange();
		}

		private dispatchKeyChange(dto: FlowDTO, keyCode: number){
			ConversationalForm.illustrateFlow(this, "dispatch", UserInputEvents.KEY_CHANGE, dto);
			this.eventTarget.dispatchEvent(new CustomEvent(UserInputEvents.KEY_CHANGE, {
				detail: <InputKeyChangeDTO> {
					dto: dto,
					keyCode: keyCode,
					inputFieldActive: this.active
				}
			}));
		}

		private windowFocus(event: Event){
			if(!UserInput.preventAutoFocus)
				this.setFocusOnInput();
		}

		private onInputBlur(event: FocusEvent){
			this._active = false;
		}

		private onInputFocus(event: FocusEvent){
			this._active = true;
			this.onInputChange();
		}

		public setFocusOnInput(){
			this.inputElement.focus();
		}

		private onEnterOrSubmitButtonSubmit(event: MouseEvent = null){
			if(this.active && this.controlElements.highlighted){
				// active input field and focus on control elements happens when a control element is highlighted
				this.controlElements.clickOnHighlighted();
			}else{
				if(!this._currentTag){
					// happens when a form is empty, so just play along and submit response to chatlist..
					this.eventTarget.cf.addUserChatResponse(this.inputElement.value);
				}else{
					// we need to check if current tag is file
					if(this._currentTag.type == "file" && event){
						// trigger <input type="file" but only when it's from clicking button
						(<UploadFileUI> this.controlElements.getElement(0)).triggerFileSelect();
					}else{
						// for groups, we expect that there is always a default value set
						this.doSubmit();
					}
				}
			}
		}

		private doSubmit(){
			const dto: FlowDTO = this.getFlowDTO();

			this.disabled = true;
			this.el.removeAttribute("error");
			this.inputElement.setAttribute("data-value", "");

			ConversationalForm.illustrateFlow(this, "dispatch", UserInputEvents.SUBMIT, dto);
			this.eventTarget.dispatchEvent(new CustomEvent(UserInputEvents.SUBMIT, {
				detail: dto
			}));
		}

		private resetValue(){
			this.inputElement.value = "";
			this.onInputChange();
		}

		public dealloc(){
			this.inputElement.removeEventListener('blur', this.onInputBlurCallback, false);
			this.onInputBlurCallback = null;

			this.inputElement.removeEventListener('focus', this.onInputFocusCallback, false);
			this.onInputFocusCallback = null;

			window.removeEventListener('focus', this.windowFocusCallback, false);
			this.windowFocusCallback = null;

			document.removeEventListener("keydown", this.keyDownCallback, false);
			this.keyDownCallback = null;

			document.removeEventListener("keyup", this.keyUpCallback, false);
			this.keyUpCallback = null;

			this.eventTarget.removeEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);
			this.flowUpdateCallback = null;

			this.eventTarget.removeEventListener(FlowEvents.USER_INPUT_INVALID, this.inputInvalidCallback, false);
			this.inputInvalidCallback = null;

			this.eventTarget.removeEventListener(ControlElementEvents.SUBMIT_VALUE, this.onControlElementSubmitCallback, false);
			this.onControlElementSubmitCallback = null;

			this.submitButton = <HTMLButtonElement> this.el.getElementsByClassName("cf-input-button")[0];
			this.submitButton.removeEventListener("click", this.onSubmitButtonClickCallback, false);
			this.onSubmitButtonClickCallback = null;

			super.dealloc();
		}

		// override
		public getTemplate () : string {
			return `<cf-input>
				<cf-info></cf-info>
				<cf-input-control-elements>
					<cf-list-button direction="prev">
					</cf-list-button>
					<cf-list-button direction="next">
					</cf-list-button>
					<cf-list>
					</cf-list>
				</cf-input-control-elements>

				<cf-input-button class="cf-input-button">
					<div class="cf-icon-progress"></div>
					<div class="cf-icon-attachment"></div>
				</cf-input-button>
				
				<textarea type='input' tabindex="1" rows="1"></textarea>

			</cf-input>
			`;
		}
	}
}