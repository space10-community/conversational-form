/// <reference path="../BasicElement.ts"/>
/// <reference path="../control-elements/ControlElements.ts"/>
/// <reference path="../../logic/FlowManager.ts"/>
/// <reference path="../../interfaces/IUserInputElement.ts"/>
/// <reference path="UserInputElement.ts"/>

// namespace
namespace cf {
	// interface

	// class
	export class UserVoiceInput extends UserInputElement implements IUserInputElement {
		public el: HTMLElement;
		private cfReference: ConversationalForm;

		public set visible(value: boolean){
			
		}

		constructor(options: IUserInputOptions){
			super(options);

			this.cfReference = options.cfReference;
			this.eventTarget = options.eventTarget;
		}

		public getFlowDTO():FlowDTO{
			let value: FlowDTO;// = this.inputElement.value;
			return value;
		}

		public reset(){
			super.reset();
		}

		public onFlowStopped(){
			// this.disabled = true;
		}

		protected onFlowUpdate(event: CustomEvent){
			super.onFlowUpdate(event);
		}
		// private doSubmit(){
		// 	this.eventTarget.dispatchEvent(new CustomEvent(UserInputEvents.SUBMIT, {
		// 		detail: dto
		// 	}));
		// }

		public setFocusOnInput(){
			if(!UserInputElement.preventAutoFocus){
				// ...
			}
		}

		public dealloc(){
			super.dealloc();
		}

		// override
		public getTemplate () : string {
			return `<cf-input>

				<cf-input-button class="cf-input-button">
					<div class="cf-icon-audio"></div>
				</cf-input-button>

				Ok, heeej voice!

			</cf-input>
			`;
		}
	}
}