/// <reference path="../BasicElement.ts"/>
/// <reference path="../control-elements/ControlElements.ts"/>
/// <reference path="../../logic/FlowManager.ts"/>
/// <reference path="../../logic/MicrophoneBridge.ts"/>
/// <reference path="../../interfaces/IUserInputElement.ts"/>
/// <reference path="UserInputElement.ts"/>

// namespace
namespace cf {
	// interface

	export interface UserInputSubmitButtonOptions{
		eventTarget: EventDispatcher;
	}

	export const UserInputSubmitButtonEvents = {
		CHANGE: "userinput-submit-button-change-value"
	}

	// class
	export class UserInputSubmitButton {
		private onClickCallback: () => void;
		private eventTarget: EventDispatcher;

		private mic: MicrophoneBridge;
		private onMicrophoneTerminalErrorCallback: () => void;

		public el: HTMLElement;

		public set typing(value: boolean){
			if(value){
				this.el.classList.add("typing");
				this.loading = false;
				if(this.mic){
					this.mic.cancel();
				}
			}else{
				this.el.classList.remove("typing");
				if(this.mic){
					this.mic.callInput();
				}
			}
		}

		public get typing(): boolean{
			return this.el.classList.contains("typing");
		}

		public set loading(value: boolean){
			if(value)
				this.el.classList.add("loading");
			else
				this.el.classList.remove("loading");
		}

		public get loading(): boolean{
			return this.el.classList.contains("loading");
		}

		constructor(options: UserInputSubmitButtonOptions){
			this.eventTarget = options.eventTarget;

			var template: HTMLTemplateElement = document.createElement('template');
			template.innerHTML = this.getTemplate();
			this.el = <HTMLElement> template.firstChild || <HTMLElement>template.content.firstChild;

			this.onClickCallback = this.onClick.bind(this);
			this.el.addEventListener("click", this.onClickCallback, false);

			this.onMicrophoneTerminalErrorCallback = this.onMicrophoneTerminalError.bind(this);
			this.eventTarget.addEventListener(MicrophoneBridgeEvent.TERMNIAL_ERROR, this.onMicrophoneTerminalErrorCallback, false);
		}

		public addMicrophone (microphoneObj: IUserInput) {
			console.log('voice: yeyees mic!');

			this.el.classList.add("microphone-interface");
			var template: HTMLTemplateElement = document.createElement('template');
			template.innerHTML = `<div class="cf-input-icons cf-microphone">
				<div class="cf-icon-audio"></div>
				<cf-icon-audio-eq></cf-icon-audio-eq>
			</div>`;
			const mic: HTMLElement = <HTMLElement> template.firstChild || <HTMLElement>template.content.firstChild;

			this.mic = new MicrophoneBridge({
				el: mic,
				button: this,
				eventTarget: this.eventTarget,
				microphoneObj: microphoneObj
			});

			this.el.appendChild(mic);

			// this.mic = null;
			// this.el.appendChild(this.mic.el);
		}

		public getTemplate () : string {
			return `<cf-input-button class="cf-input-button">
						<div class="cf-input-icons">
							<div class="cf-icon-progress"></div>
							<div class="cf-icon-attachment"></div>
						</div>
					</cf-input-button>`;
		}

		protected onMicrophoneTerminalError(event: Error){
			console.log('voice: onMicrophoneTerminalError', event);
			if(this.mic){
				this.mic.dealloc();
				this.mic = null;
				this.el.classList.remove("microphone-interface");
				this.loading = false;
				this.el.removeChild(this.el.getElementsByClassName("cf-microphone")[0]);
			}
		}

		private onClick(event: MouseEvent){
			console.log('voice: onClick');
			const isMicVisible: boolean = this.mic && !this.typing;
			if(isMicVisible){
				this.mic.callInput();
			}else{
				this.eventTarget.dispatchEvent(new CustomEvent(UserInputSubmitButtonEvents.CHANGE));
			}
		}

		/**
		* @name click
		* force click on button
		*/
		public click(): void {
			this.el.click();
		}

		/**
		* @name dealloc
		* remove instance
		*/
		public dealloc(): void {
			this.eventTarget.removeEventListener(MicrophoneBridgeEvent.TERMNIAL_ERROR, this.onMicrophoneTerminalErrorCallback, false);
			this.onMicrophoneTerminalErrorCallback = null;

			if(this.mic){
				this.mic.dealloc();
			}
			this.mic = null;

			this.el.removeEventListener("click", this.onClickCallback, false);
			this.onClickCallback = null;
			this.el = null;
			this.eventTarget = null;
		}
	}
}