/// <reference path="../BasicElement.ts"/>
/// <reference path="../control-elements/ControlElements.ts"/>
/// <reference path="../../logic/FlowManager.ts"/>
/// <reference path="../../interfaces/IUserInput.ts"/>

// Abstract UserInpt element, should be extended when adding a new UI for user input

// namespace
namespace cf {
	// interface
	export class UserInputElement extends BasicElement implements IUserInputElement {
		public static ERROR_TIME: number = 2000;
		public static preventAutoFocus: boolean = false;
		public static hideUserInputOnNoneTextInput: boolean = false;

		public el: HTMLElement;

		protected cfReference: ConversationalForm;
		private onChatReponsesUpdatedCallback: () => void;
		private windowFocusCallback: () => void;
		private inputInvalidCallback: () => void;
		private flowUpdateCallback: () => void;
		protected _currentTag: ITag | ITagGroup;
		protected _disabled: boolean = false;
		protected _visible: boolean = false;

		public get currentTag(): ITag | ITagGroup{
			return this._currentTag;
		}
	
		public set visible(value: boolean){
			this._visible = value;

			if(!this.el.classList.contains("animate-in") && value){
				setTimeout(() => {
					this.el.classList.add("animate-in");
				}, 0);
			}else if(this.el.classList.contains("animate-in") && !value){
				this.el.classList.remove("animate-in");
			}
		}

		public set disabled(value: boolean){
			const hasChanged: boolean = this._disabled != value;
			if(hasChanged){
				this._disabled = value;
				if(value){
					this.el.setAttribute("disabled", "disabled");
				}else{
					this.setFocusOnInput();
					this.el.removeAttribute("disabled");
				}
			}
		}

		public get disabled():boolean{
			return this._disabled
		}

		public get height():number{
			let elHeight: number = 0
			let elMargin: number = 0;
			const el: any = <any>this.el;
			if(Helpers.isInternetExlorer()) {
				// IE
				elHeight = (<any>el).offsetHeight;
				elMargin = parseInt(el.currentStyle.marginTop, 10) + parseInt(el.currentStyle.marginBottom, 10);
				elMargin *= 2;
			} else {
				// none-IE
				elHeight = parseInt(document.defaultView.getComputedStyle(el, '').getPropertyValue('height'), 10);
				elMargin = parseInt(document.defaultView.getComputedStyle(el, '').getPropertyValue('margin-top')) + parseInt(document.defaultView.getComputedStyle(el, '').getPropertyValue('margin-bottom'));
			}
			return (elHeight + elMargin);
		}

		constructor(options: IUserInputOptions){
			super(options);

			this.onChatReponsesUpdatedCallback = this.onChatReponsesUpdated.bind(this);
			this.eventTarget.addEventListener(ChatListEvents.CHATLIST_UPDATED, this.onChatReponsesUpdatedCallback, false);

			this.windowFocusCallback = this.windowFocus.bind(this);
			window.addEventListener('focus', this.windowFocusCallback, false);

			this.inputInvalidCallback = this.inputInvalid.bind(this);
			this.eventTarget.addEventListener(FlowEvents.USER_INPUT_INVALID, this.inputInvalidCallback, false);

			this.flowUpdateCallback = this.onFlowUpdate.bind(this);
			this.eventTarget.addEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);
		}
		protected onEnterOrSubmitButtonSubmit(event: CustomEvent = null){
			
		}

		protected inputInvalid(event: CustomEvent){
		}

		/**
		* @name deactivate
		* DEactivate the field
		*/
		public deactivate(): void {
			this.disabled = true;
		}

		/**
		* @name reactivate
		* REactivate the field
		*/
		public reactivate(): void {
			this.disabled = false;
		}

		public getFlowDTO():FlowDTO{
			let value: FlowDTO;// = this.inputElement.value;
			return value;
		}
		public setFocusOnInput(){
		}
		public onFlowStopped(){
		}
		public reset(){
		}
		
		public dealloc(){
			this.eventTarget.removeEventListener(ChatListEvents.CHATLIST_UPDATED, this.onChatReponsesUpdatedCallback, false);
			this.onChatReponsesUpdatedCallback = null;

			this.eventTarget.removeEventListener(FlowEvents.USER_INPUT_INVALID, this.inputInvalidCallback, false);
			this.inputInvalidCallback = null;

			window.removeEventListener('focus', this.windowFocusCallback, false);
			this.windowFocusCallback = null;

			this.eventTarget.removeEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);
			this.flowUpdateCallback = null;

			super.dealloc();
		}

		protected onFlowUpdate(event: CustomEvent){
			ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);
			this._currentTag = <ITag | ITagGroup> event.detail.tag;
		}

		protected windowFocus(event: Event){

		}

		private onChatReponsesUpdated(event:CustomEvent){
			// only show when user response
			if(!(<any> event.detail).currentResponse.isRobotResponse){
				this.visible = true;
				this.disabled = false;
				this.setFocusOnInput();
			}
		}
	}

	export interface IUserInputOptions extends IBasicElementOptions{
		cfReference: ConversationalForm;
		microphoneInputObj: IUserInput;
	}

	export const UserInputEvents = {
		SUBMIT: "cf-input-user-input-submit",
		KEY_CHANGE: "cf-input-key-change",
		CONTROL_ELEMENTS_ADDED: "cf-input-control-elements-added",
		HEIGHT_CHANGE: "cf-input-height-change",
		FOCUS: "cf-input-focus",
		BLUR: "cf-input-blur",
	}
}