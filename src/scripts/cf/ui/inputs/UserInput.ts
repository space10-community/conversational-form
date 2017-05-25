/// <reference path="../BasicElement.ts"/>
/// <reference path="../control-elements/ControlElements.ts"/>
/// <reference path="../../logic/FlowManager.ts"/>
/// <reference path="../../interfaces/IUserInput.ts"/>

// namespace
namespace cf {
	// interface
	export class UserInput extends BasicElement implements IUserInput {
		public static ERROR_TIME: number = 2000;
		public static preventAutoFocus: boolean = false;
		private windowFocusCallback: () => void;
		private flowUpdateCallback: () => void;
		protected _currentTag: ITag | ITagGroup;
		protected _disabled: boolean = false;
		protected _visible: boolean = false;

		public get currentTag(): ITag | ITagGroup{
			return this._currentTag;
		}
		public set disabled(value: boolean){
			this._disabled = value;
		}
		public set visible(value: boolean){
			this._visible = value;
		}
		constructor(options: any){
			super(options);

			this.windowFocusCallback = this.windowFocus.bind(this);
			window.addEventListener('focus', this.windowFocusCallback, false);

			this.flowUpdateCallback = this.onFlowUpdate.bind(this);
			this.eventTarget.addEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);
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
	}

	export interface IUserInputOptions extends IBasicElementOptions{
		cfReference: ConversationalForm
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