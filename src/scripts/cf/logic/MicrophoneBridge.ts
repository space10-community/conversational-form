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

	// class
	export class MicrophoneBridge{
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
		private microphoneObj: IUserInput = "";
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
							console.log("voice: this.callInput() 2")
							this.callInput();
						}
					}else{
						console.log('voice: getUserMedia 3');
						// code for when both devices are available
						// interface is not active, button should be clicked
						this.hasUserMedia = false;
					}
				}, (error: any) =>{
					console.log('voice: getUserMedia error..');
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

		public dealloc(){
			this.cancel();

			this.promise = null;
			this.currentStream = null;

// 			if(this.equalizer){
// 				this.equalizer.dealloc();
// 			}

// 			this.equalizer = null;

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
					// this.el.setAttribute("error", Dictionary.get("user-reponse-missing"));
					this.showError(Dictionary.get("user-audio-reponse-invalid"));
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

			console.log("voice: this.callInput() 7(error)", error)
			this.callInput();
		}

		private setupEqualizer(){
			//analyser = audioContext.createAnalyser();
			const eqEl: HTMLElement = <HTMLElement> this.el.getElementsByTagName("cf-icon-audio-eq")[0];
			// if(SimpleEqualizer.supported && eqEl){
			// 	this.equalizer = new SimpleEqualizer(this.currentStream, eqEl);
			// }
		}
	}
}