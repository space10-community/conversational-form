/// <reference path="../BasicElement.ts"/>
/// <reference path="../control-elements/ControlElements.ts"/>
/// <reference path="../../logic/FlowManager.ts"/>
/// <reference path="../../interfaces/IUserInput.ts"/>
/// <reference path="UserInput.ts"/>

// namespace
namespace cf {
	// interface

	// class
	export class UserVoiceInput extends UserInput implements IUserInput {
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
			if(!UserInput.preventAutoFocus){
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
					<div class="cf-icon-progress"></div>
					<div class="cf-icon-audio"></div>
				</cf-input-button>

			</cf-input>
			`;
		}
	}
}