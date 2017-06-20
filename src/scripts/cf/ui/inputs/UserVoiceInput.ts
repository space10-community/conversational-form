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
		private clearMessageTimer: number = 0;
		private equalizer: SimpleEqualizer;
		private promise: Promise<any>;
		private currentStream: MediaStream;
		private _hasUserMedia: boolean = false;
		private inputErrorCount: number = 0;
		private inputCurrentError: string = "";

		private set hasUserMedia(value: boolean){
			this._hasUserMedia = value;
			if(!value){
				this.submitButton.classList.add("permission-waiting");
			}else{
				this.submitButton.classList.remove("permission-waiting");
				this.el.removeAttribute("message");
			}
		}

		constructor(options: IUserInputOptions){
			super(options);

			this.cfReference = options.cfReference;
			this.eventTarget = options.eventTarget;

			this.submitButton = <HTMLButtonElement> this.el.getElementsByTagName("cf-input-button")[0];
			this.onSubmitButtonClickCallback = this.onSubmitButtonClick.bind(this);
			this.submitButton.addEventListener("click", this.onSubmitButtonClickCallback, false);

			this.el.setAttribute("message", Dictionary.get("awaiting-mic-permission"));
			this._hasUserMedia = false;
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
			this.currentTextResponse = null;

			if(!this._hasUserMedia){
				// check if user has granted
				let hasGranted: boolean = false;
				if((<any> window).navigator.mediaDevices){
					(<any> window).navigator.mediaDevices.enumerateDevices().then((devices: any) => {
						devices.forEach((device: any) => {
							if(!hasGranted && device.label !== ""){
								hasGranted = true;
							}
						});

						if(hasGranted){
							// user has previously granted, so call getusermedia, as this wont prombt user
							this.getUserMedia();
						}else{
							// await click on button, wait state
						}
					});
				}
			}else{
				// user has granted ready to go go
				if(!this.initObj.awaitingCallback){
					console.log("voice: this.callInputInterface() 1")
					this.callInputInterface();
				}
			}
		}

		protected inputInvalid(event: CustomEvent){
			//invalid! call interface again
			this.el.setAttribute("message", Dictionary.get("user-audio-reponse-invalid"));
			console.log("voice: this.callInputInterface() 5")
			this.callInputInterface(1500);
		}

		private getUserMedia(){
			try{
				navigator.getUserMedia = navigator.getUserMedia || (<any>window).navigator.webkitGetUserMedia || (<any>window).navigator.mozGetUserMedia;
				navigator.getUserMedia(<any> {audio: true}, (stream: MediaStream) => {
					this.currentStream = stream;

					if(stream.getAudioTracks().length > 0){
						// interface is active and available, so call it immidiatly
						this.hasUserMedia = true;
						this.setupEqualizer();
						if(!this.initObj.awaitingCallback){
							console.log("voice: this.callInputInterface() 8")
							this.callInputInterface();
						}
					}else{
						// code for when both devices are available
						// interface is not active, button should be clicked
						this.hasUserMedia = false;
					}
				}, (error: any) =>{
					// error..
					// not supported..
					this.hasUserMedia = false;
					this.el.setAttribute("error", error.message || error.name);
				});
			}catch(error){
				// whoops
				// roll back to standard UI
			}
		}

		private setupEqualizer(){
			//analyser = audioContext.createAnalyser();
			const eqEl: HTMLElement = <HTMLElement> this.el.getElementsByTagName("cf-icon-audio-eq")[0];
			if(SimpleEqualizer.supported && eqEl){
				this.equalizer = new SimpleEqualizer(this.currentStream, eqEl);
			}
		}

		private onSubmitButtonClick(event: MouseEvent){
			this.onEnterOrSubmitButtonSubmit(event);
		}

		protected onEnterOrSubmitButtonSubmit(event: MouseEvent = null){
			if(!this._hasUserMedia){
				this.getUserMedia();
			}else{
				console.log("voice: this.callInputInterface() 3")
				this.callInputInterface();
			}
		}

		private callInputInterface(messageTime: number = 0){
			// remove current error message after x time
			clearTimeout(this.clearMessageTimer);
			this.clearMessageTimer = setTimeout(() =>{
				this.el.removeAttribute("message");
			}, messageTime);

			if(this.disabled){
				console.log("voice: callInputInterface > this.disabled:", this.disabled);
				return;
			}

			this.submitButton.classList.add("loading");
			this.submitButton.classList.remove("permission-waiting");

			console.log("voice: callInputInterface", this.promise);

			// call API, SpeechRecognintion, passing along the stream from getUserMedia can be used.. as long as the resolve is called with string attribute
			this.promise = new Promise((resolve: any, reject: any) => this.initObj.input(resolve, reject, this.currentStream) )
			.then((result) => {
				this.inputErrorCount = 0;
				this.inputCurrentError = "";
				// api contacted
				this.promise = null;
				// save response so it's available in getFlowDTO
				this.currentTextResponse = result.toString();
				console.log("voice: this.currentTextResponse:", this.currentTextResponse)
				if(!this.currentTextResponse || this.currentTextResponse == ""){
					// this.el.setAttribute("error", Dictionary.get("user-reponse-missing"));
					this.showError(Dictionary.get("user-audio-reponse-invalid"));
					return;
				}

				const dto: FlowDTO = this.getFlowDTO();

				this.submitButton.classList.add("active");
				this.submitButton.classList.remove("loading");

				this.disabled = false;
				this.el.removeAttribute("error");
				console.log("voice: ------ result received, next step", dto)

				// continue flow
				ConversationalForm.illustrateFlow(this, "dispatch", UserInputEvents.SUBMIT, dto);
				this.eventTarget.dispatchEvent(new CustomEvent(UserInputEvents.SUBMIT, {
					detail: dto
				}));
			}).catch((error) => {
				if(this.inputCurrentError != error){
					// api failed ...
					// show result in UI
					// this.inputErrorCount = 0;
					this.inputCurrentError = error;
				}else{
				}

				console.log('>>', error, "<<");

				this.inputErrorCount++;

				if(this.inputErrorCount < 5){
					this.showError(this.inputCurrentError);
				}else{
					// this.showError("Error happening to many times, abort..");
				}
			});
		}

		private showError(error: string){
			this.el.setAttribute("error", error);

			console.log("voice: this.callInputInterface() 7(error)", error)
			this.callInputInterface();
		}

		public deactivate(): void {
			super.deactivate();
			if(this.equalizer)
				this.equalizer.disabled = true;
			console.log("voice: deactivate")
		}

		public reactivate(): void {
			super.reactivate();
			console.log("voice: reactivate")
			console.log("voice: this.callInputInterface() 4")
			if(this.equalizer)
				this.equalizer.disabled = false;
			this.callInputInterface();
		}

		public setFocusOnInput(){
			if(!UserInputElement.preventAutoFocus){
				// ...
			}
		}

		public dealloc(){
			this.promise = null;
			this.currentStream = null;
			if(this.equalizer){
				this.equalizer.dealloc();
			}
			this.equalizer = null;

			this.submitButton.removeEventListener("click", this.onSubmitButtonClickCallback, false);
			this.onSubmitButtonClickCallback = null;

			super.dealloc();
		}

		// override
		public getTemplate () : string {
			return this.customTemplate || `<cf-input>

				<cf-input-button class="cf-input-button">
					<div class="cf-icon-audio">
					</div>
					<cf-icon-audio-eq></cf-icon-audio-eq>
				</cf-input-button>

			</cf-input>`;
		}
	}

	class SimpleEqualizer{
		private context: AudioContext;
		private analyser: AnalyserNode;
		private mic: MediaStreamAudioSourceNode;
		private javascriptNode: ScriptProcessorNode;
		private elementToScale: HTMLElement;

		private _disabled: boolean = false;
		public set disabled(value: boolean){
			this._disabled = value;
			Helpers.setTransform(this.elementToScale, "scale(0)");
		}
		constructor(stream: any, elementToScale: HTMLElement){
			this.elementToScale = elementToScale;
			this.context = new AudioContext();
			this.analyser = this.context.createAnalyser();
			this.mic = this.context.createMediaStreamSource(stream);
			this.javascriptNode = this.context.createScriptProcessor(2048, 1, 1);

			this.analyser.smoothingTimeConstant = 0.3;
			this.analyser.fftSize = 1024;

			this.mic.connect(this.analyser);
			this.analyser.connect(this.javascriptNode);
			this.javascriptNode.connect(this.context.destination);
			this.javascriptNode.onaudioprocess = () => {
				this.onAudioProcess();
			};
		}

		private onAudioProcess(){
			if(this._disabled)
				return;

			var array =  new Uint8Array(this.analyser.frequencyBinCount);
			this.analyser.getByteFrequencyData(array);
			var values = 0;

			var length = array.length;
			for (var i = 0; i < length; i++) {
				values += array[i];
			}

			var average = values / length;
			const percent: number = 1 - ((100 - average) / 100);
			Helpers.setTransform(this.elementToScale, "scale("+percent+")");
		}

		public dealloc(){
			this.javascriptNode.onaudioprocess = null;
			this.javascriptNode = null;
			this.analyser = null;
			this.mic = null;
			this.elementToScale = null;
			this.context = null;
		}

		public static supported():boolean{
			(<any>window).AudioContext = (<any>window).AudioContext || (<any>window).webkitAudioContext;
			if((<any>window).AudioContext){
				return true;
			}
			else {
				return false;
			}
		}
	}
}