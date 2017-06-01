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

			// request microphone and start recording
			navigator.mediaDevices.getUserMedia({ audio: true })
			.then((stream: any) => {
				this.startRecording(stream);
			})
			.catch((error) =>{
				console.log("error.", error);
				this.submitButton.classList.remove("loading");
			});
		}

		protected startRecording(stream: any){
			this.recordChunks = [];
			var mediaRecorder: any = new (<any> window).MediaRecorder(stream);
			mediaRecorder.addEventListener('dataavailable', (event: any) => {
				// push each chunk (blobs) in an array, to use later on
				// process audio data here if needed (AudioContext)
				this.recordChunks.push(event.data);
			});

			mediaRecorder.addEventListener('stop', (event: Event) => {
				this.onRecordingStopped(event);
			});

			mediaRecorder.start();
			
			setTimeout(() => {
				mediaRecorder.stop();
			}, 10000)
		}

		private onRecordingStopped(event: Event){
			// Make blob out of our blobs, and open it.
			var blob = new Blob(this.recordChunks, { 'type' : 'audio/ogg; codecs=opus' });
			var audio: HTMLAudioElement = <HTMLAudioElement> document.getElementById('audio');
			// e.data contains a blob representing the recording
			audio.src = URL.createObjectURL(blob);
			audio.play();

			this.recordChunks = null;

			this.submitButton.classList.add("active");
			this.submitButton.classList.remove("loading");

			this.sendAudioToAPI();
		}

		private sendAudioToAPI(){
			if(!this.initObj.input){
				console.warn("userInput input nethod is not defined!");
				return;
			}

			// when done with microphone, use API to transmit this to text...
			var a = new Promise((resolve: any, reject: any) => this.initObj.input(resolve, reject) )
			.then((result) => {
				// api contacted

				// save response so it's available in getFlowDTO
				this.currentTextResponse = result.toString();

				const dto: FlowDTO = this.getFlowDTO();

				this.submitButton.classList.remove("loading");
				this.disabled = false;
				this.el.removeAttribute("error");

				// continue flow
				ConversationalForm.illustrateFlow(this, "dispatch", UserInputEvents.SUBMIT, dto);
				this.eventTarget.dispatchEvent(new CustomEvent(UserInputEvents.SUBMIT, {
					detail: dto
				}));
			}).catch(() => {
				// api failed
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