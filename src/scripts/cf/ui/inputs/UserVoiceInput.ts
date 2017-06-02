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
		private currentTextResponse: string = "";
		private recordChunks: Array<any>;
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
			let value: FlowDTO;
			value = <FlowDTO> {
				input: this,
				text: this.currentTextResponse,
				tag: this.currentTag
			};


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

		private onSubmitButtonClick(event: MouseEvent){
			this.onEnterOrSubmitButtonSubmit(event);
		}

		protected onEnterOrSubmitButtonSubmit(event: MouseEvent = null){
			this.submitButton.classList.add("loading");
			this.el.removeAttribute("error");

			// call API, SpeechRecognintion, or getUserMedia can be used.. as long as the resolve is called with text/string
			var a = new Promise((resolve: any, reject: any) => this.initObj.input(resolve, reject) )
			.then((result) => {
				// api contacted
				// save response so it's available in getFlowDTO
				this.currentTextResponse = result.toString();
				if(!this.currentTextResponse || this.currentTextResponse == ""){
					this.currentTextResponse = Dictionary.get("user-reponse-missing");
				}

				const dto: FlowDTO = this.getFlowDTO();

				this.submitButton.classList.remove("loading");
				this.disabled = false;
				this.el.removeAttribute("error");

				// continue flow
				ConversationalForm.illustrateFlow(this, "dispatch", UserInputEvents.SUBMIT, dto);
				this.eventTarget.dispatchEvent(new CustomEvent(UserInputEvents.SUBMIT, {
					detail: dto
				}));

				this.submitButton.classList.add("active");
				this.submitButton.classList.remove("loading");
			}).catch((result) => {
				// api failed ...
				this.el.setAttribute("error", result);
				this.disabled = false;
				this.submitButton.classList.remove("loading");
			});
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

			</cf-input>
			`;
		}
	}
}