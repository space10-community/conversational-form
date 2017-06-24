/// <reference path="../ui/BasicElement.ts"/>
/// <reference path="../ui//control-elements/ControlElements.ts"/>
/// <reference path="../logic/FlowManager.ts"/>
/// <reference path="../interfaces/IUserInputElement.ts"/>
/// <reference path="../ui/inputs/UserInputElement.ts"/>
/// <reference path="../interfaces/IUserInputElement.ts"/>

// namespace
namespace cf {
	// interface
	export interface IMicrophoneBridgeOptions{
		el: HTMLElement;
		button: UserInputSubmitButton;
		microphoneObj: IUserInput;
		eventTarget: EventDispatcher;
	}

	export const MicrophoneBridgeEvent = {
		TERMNIAL_ERROR: "cf-microphone-bridge-error"
	}

	// class
	export class MicrophoneBridge{
		private equalizer: SimpleEqualizer;
		private el: HTMLElement;
		private button: UserInputSubmitButton;
		private currentTextResponse: string = "";
		private recordChunks: Array<any>;
		// private equalizer: SimpleEqualizer;
		private promise: Promise<any>;
		private currentStream: MediaStream;
		private _hasUserMedia: boolean = false;
		private inputErrorCount: number = 0;
		private inputCurrentError: string = "";
		private microphoneObj: IUserInput;
		private eventTarget: EventDispatcher;
		private flowUpdateCallback: () => void;

		private set hasUserMedia(value: boolean){
			this._hasUserMedia = value;
			if(!value){
				// this.submitButton.classList.add("permission-waiting");
			}else{
				// this.submitButton.classList.remove("permission-waiting");
			}
		}

		constructor(options: IMicrophoneBridgeOptions){
			this.el = options.el;
			this.button = options.button;
			this.eventTarget = options.eventTarget;

			// data object
			this.microphoneObj = options.microphoneObj;

			console.log('voice: this.el', this.el);

			this.flowUpdateCallback = this.onFlowUpdate.bind(this);
			this.eventTarget.addEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);
		}

		public cancel(){
			console.log('voice: mic cancel');
			this.button.loading = false;

			if(this.microphoneObj.cancelInput){
				this.microphoneObj.cancelInput();
			}
		}

		public onFlowUpdate(){
			this.currentTextResponse = null;

			console.log('voice: onFlowUpdate');

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
				if(!this.microphoneObj.awaitingCallback){
					console.log("voice: this.callInput() 1")
					this.callInput();
				}
			}
		}
		
		public getUserMedia(){
			try{
				navigator.getUserMedia = navigator.getUserMedia || (<any>window).navigator.webkitGetUserMedia || (<any>window).navigator.mozGetUserMedia;
				navigator.getUserMedia(<any> {audio: true}, (stream: MediaStream) => {
					this.currentStream = stream;

					console.log('voice: getUserMedia 1');

					if(stream.getAudioTracks().length > 0){
						// interface is active and available, so call it immidiatly
						this.hasUserMedia = true;
						this.setupEqualizer();

						console.log('voice: getUserMedia 2');

						if(!this.microphoneObj.awaitingCallback){
							// user
							console.log('voice: getUserMedia 3', "not awaiting feedback");
							this.callInput();
						}
					}else{
						console.log('voice: getUserMedia 4, button should be clicked');
						// code for when both devices are available
						// interface is not active, button should be clicked
						this.hasUserMedia = false;
					}
				}, (error: any) =>{
					console.log('voice: (getUserMedia) error!', error);
					// error..
					// not supported..
					this.hasUserMedia = false;
					this.eventTarget.dispatchEvent(new Event(MicrophoneBridgeEvent.TERMNIAL_ERROR));
				});
			}catch(error){
				// whoops
				// roll back to standard UI

				this.eventTarget.dispatchEvent(new Event(MicrophoneBridgeEvent.TERMNIAL_ERROR));
			}
		}

		public dealloc(){
			this.cancel();

			this.promise = null;
			this.currentStream = null;

			if(this.equalizer){
				this.equalizer.dealloc();
			}

			this.equalizer = null;

			this.eventTarget.removeEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);
			this.flowUpdateCallback = null;
		}

		public callInput(messageTime: number = 0){
			// remove current error message after x time
			// clearTimeout(this.clearMessageTimer);
			// this.clearMessageTimer = setTimeout(() =>{
			// 	this.el.removeAttribute("message");
			// }, messageTime);

			this.button.loading = true;

			if(this.equalizer){
				this.equalizer.disabled = false;
			}

			console.log("voice: ------------------------------------------------------");

			// call API, SpeechRecognintion etc. you decide, passing along the stream from getUserMedia can be used.. as long as the resolve is called with string attribute
			this.promise = new Promise((resolve: any, reject: any) => this.microphoneObj.input(resolve, reject, this.currentStream) )
			.then((result) => {

				// api contacted
				this.promise = null;
				// save response so it's available in getFlowDTO
				this.currentTextResponse = result.toString();
				console.log("voice: this.currentTextResponse:", this.currentTextResponse)
				if(!this.currentTextResponse || this.currentTextResponse == ""){
					console.log("voice: invalid..");
					this.showError(Dictionary.get("user-audio-reponse-invalid"));
					// invalid input, so call API again
					this.callInput();
					return;
				}

				this.inputErrorCount = 0;
				this.inputCurrentError = "";
				this.button.loading = false;

				// continue flow
				let dto: FlowDTO = <FlowDTO> {
					text: this.currentTextResponse
				};

				ConversationalForm.illustrateFlow(this, "dispatch", UserInputEvents.SUBMIT, dto);
				this.eventTarget.dispatchEvent(new CustomEvent(UserInputEvents.SUBMIT, {
					detail: dto
				}));
			}).catch((error) => {
				console.log('voice: (callInput) error!', error);
				if(this.isErrorTerminal(error)){
					// terminal error, fallback to 
					this.eventTarget.dispatchEvent(new CustomEvent(MicrophoneBridgeEvent.TERMNIAL_ERROR,{
						detail: Dictionary.get("microphone-terminal-error") + error
					}));
				}else{
					if(this.inputCurrentError != error){
						// api failed ...
						// show result in UI
						// this.inputErrorCount = 0;
						this.inputCurrentError = error;
					}else{
					}

					this.inputErrorCount++;

					if(this.inputErrorCount < 5){
						this.showError(this.inputCurrentError);
					}else{
						// this.showError("Error happening to many times, abort..");
					}
				}
			});
		}

		protected isErrorTerminal(error: string): boolean{
			const terminalErrors: Array<string> = ["network", "aborted"];
			if(terminalErrors.indexOf(error) !== -1)
				return true;

			return false;
		}

		private showError(error: string){
			const dto: FlowDTO = {
				errorText: error
			};

			ConversationalForm.illustrateFlow(this, "dispatch", FlowEvents.USER_INPUT_INVALID, dto)
			this.eventTarget.dispatchEvent(new CustomEvent(FlowEvents.USER_INPUT_INVALID, {
				detail: dto
			}));

			console.log("voice: showError(currentError..", error)
			this.callInput();
		}

		private setupEqualizer(){
			const eqEl: HTMLElement = <HTMLElement> this.el.getElementsByTagName("cf-icon-audio-eq")[0];
			if(SimpleEqualizer.supported && eqEl){
				this.equalizer = new SimpleEqualizer(this.currentStream, eqEl);
			}

			console.log("voice:", this.equalizer, eqEl, this.currentStream);
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