/// <reference path="ChatResponse.ts"/>
/// <reference path="../BasicElement.ts"/>
/// <reference path="../../logic/FlowManager.ts"/>


// namespace
namespace io.space10 {
	// interface

	// class
	export class ChatList extends io.space10.BasicElement {
		private flowUpdateCallback: () => void;
		private userInputUpdateCallback: () => void;
		private onInputKeyChangeCallback: () => void;
		private currentUserResponse: io.space10.ChatResponse;

		constructor(options: IBasicElementOptions){
			super(options);

			// flow update
			this.flowUpdateCallback = this.onFlowUpdate.bind(this);
			document.addEventListener(io.space10.FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);

			// user input update
			this.userInputUpdateCallback = this.onUserInputUpdate.bind(this);
			document.addEventListener(io.space10.FlowEvents.USER_INPUT_UPDATE, this.userInputUpdateCallback, false);

			// user input update
			this.onInputKeyChangeCallback = this.onInputKeyChange.bind(this);
			document.addEventListener(io.space10.UserInputEvents.KEY_CHANGE, this.onInputKeyChangeCallback, false);
		}

		private onInputKeyChange(event: CustomEvent){
			if(this.currentUserResponse){
				const inputFieldStr: string = event.detail;
				if(inputFieldStr.length == 0){
					this.currentUserResponse.visible = false;
				}else{
					if(!this.currentUserResponse.visible)
						this.currentUserResponse.visible = true;
				}
			}
		}

		private onUserInputUpdate(event: CustomEvent){
			if(this.currentUserResponse)
				this.currentUserResponse.setValue(event.detail);
			else{
				// this should never happen..
				this.createResponse(event.detail);
			}
		}

		private onFlowUpdate(event: CustomEvent){
			const currentTag: io.space10.ITag | io.space10.ITagGroup = <io.space10.ITag | io.space10.ITagGroup> event.detail;

			const aiThumb: string = Dictionary.getAIResponse("thumb");
			this.createResponse((currentTag.title || currentTag.name) + " : " + currentTag.question, aiThumb);
			
			// create the waiting user response
			this.createResponse();
		}

		private createResponse(value: string = null, image: string = Dictionary.get("user-image")){
			
			this.currentUserResponse = new io.space10.ChatResponse({
				// image: null,
				response: value,// || input-response,
				image: image
			});

			this.el.appendChild(this.currentUserResponse.el);
			this.el.scrollTo(0, 1000000000);
		}

		public getTemplate () : string {
			return `<s10cui-chat type='pluto'>
						Chat
					</s10cui-chat>`;
		}

		public remove(){
			document.removeEventListener(io.space10.FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);
			this.flowUpdateCallback = null;
			document.addEventListener(io.space10.FlowEvents.USER_INPUT_UPDATE, this.userInputUpdateCallback, false);
			this.userInputUpdateCallback = null;
			super.remove();
		}
	}
}

