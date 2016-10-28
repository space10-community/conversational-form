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
		private currentResponse: io.space10.ChatResponse;

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
			if(this.currentResponse){
				const inputFieldStr: string = event.detail;
				if(inputFieldStr.length == 0){
					this.currentResponse.visible = false;
				}else{
					if(!this.currentResponse.visible)
						this.currentResponse.visible = true;
				}
			}
		}

		private onUserInputUpdate(event: CustomEvent){
			if(this.currentResponse){
				const response: string | ITag = event.detail;
				if(response.toString() == "[object Object]")
					this.currentResponse.setValue((<ITag> response).title);
				else
					this.currentResponse.setValue((<string> response));
			}
			else{
				// this should never happen..
				throw new Error("No current response??")
			}
		}

		private onFlowUpdate(event: CustomEvent){
			const currentTag: io.space10.ITag | io.space10.ITagGroup = <io.space10.ITag | io.space10.ITagGroup> event.detail;

			// AI response
			const aiThumb: string = Dictionary.getAIResponse("thumb");
			this.createResponse(true, (currentTag.name || currentTag.title) + " : " + currentTag.question, aiThumb);
			
			// user reponse, create the waiting response
			this.createResponse(false);
		}

		private createResponse(isAIReponse: boolean, value: string = null, image: string = Dictionary.get("user-image")){
			this.currentResponse = new io.space10.ChatResponse({
				// image: null,
				isAIReponse: isAIReponse,
				response: value,// || input-response,
				image: image
			});

			this.el.appendChild(this.currentResponse.el);
			this.el.scrollTo(0, 1000000000);
		}

		public getTemplate () : string {
			return `<s10cui-chat type='pluto'>
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

