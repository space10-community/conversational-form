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
		private submitButton: HTMLButtonElement;
		private onSubmitButtonClickCallback: () => void;
		constructor(options: IUserInputOptions){
			super(options);

			this.cfReference = options.cfReference;
			this.eventTarget = options.eventTarget;

			this.submitButton = <HTMLButtonElement> this.el.getElementsByTagName("cf-input-button")[0];
			this.onSubmitButtonClickCallback = this.onSubmitButtonClick.bind(this);
			this.submitButton.addEventListener("click", this.onSubmitButtonClickCallback, false);
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

		private onSubmitButtonClick(event: MouseEvent){
			this.onEnterOrSubmitButtonSubmit(event);
		}

		protected onEnterOrSubmitButtonSubmit(event: MouseEvent = null){
			console.log("yes! Do the voice thing!");
		}
		public setFocusOnInput(){
			if(!UserInputElement.preventAutoFocus){
				// ...
			}
		}

		public dealloc(){
			this.submitButton = <HTMLButtonElement> this.el.getElementsByClassName("cf-input-button")[0];
			this.submitButton.removeEventListener("click", this.onSubmitButtonClickCallback, false);
			this.onSubmitButtonClickCallback = null;

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