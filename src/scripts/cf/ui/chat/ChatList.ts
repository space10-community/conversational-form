/// <reference path="ChatResponse.ts"/>
/// <reference path="../BasicElement.ts"/>
/// <reference path="../../logic/FlowManager.ts"/>


// namespace
namespace cf {
	// interface

	// class
	export class ChatList extends BasicElement {
		private flowUpdateCallback: () => void;
		private userInputUpdateCallback: () => void;
		private onInputKeyChangeCallback: () => void;
		private onControlElementsAddedToUserInputCallback: () => void;
		private currentResponse: ChatResponse;

		constructor(options: IBasicElementOptions){
			super(options);

			// flow update
			this.flowUpdateCallback = this.onFlowUpdate.bind(this);
			document.addEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);

			// user input update
			this.userInputUpdateCallback = this.onUserInputUpdate.bind(this);
			document.addEventListener(FlowEvents.USER_INPUT_UPDATE, this.userInputUpdateCallback, false);

			// user input key change
			this.onInputKeyChangeCallback = this.onInputKeyChange.bind(this);
			document.addEventListener(UserInputEvents.KEY_CHANGE, this.onInputKeyChangeCallback, false);

			// user input key change
			this.onControlElementsAddedToUserInputCallback = this.onControlElementsAddedToUserInput.bind(this);
			document.addEventListener(UserInputEvents.CONTROL_ELEMENTS_ADDED, this.onControlElementsAddedToUserInputCallback, false);
		}

		private onControlElementsAddedToUserInput(event: CustomEvent){
			const dto: ControlElementsDTO = event.detail;
			this.el.style.paddingBottom = (dto.height + 0) + "px";
		}

		private onInputKeyChange(event: CustomEvent){
			const dto: FlowDTO = event.detail;
			ConversationalForm.illustrateFlow(this, "receive", event.type, dto);

			if(this.currentResponse){
				const inputFieldStr: string = dto.text || dto.inputValue;
				if(!inputFieldStr || inputFieldStr.length == 0){
					this.currentResponse.visible = false;
				}else{
					if(!this.currentResponse.visible)
						this.currentResponse.visible = true;
				}
			}
		}

		private onUserInputUpdate(event: CustomEvent){
			ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);

			if(this.currentResponse){
				const response: FlowDTO = event.detail;
				this.currentResponse.setValue(response.text);
			}
			else{
				// this should never happen..
				throw new Error("No current response??")
			}
		}

		private onFlowUpdate(event: CustomEvent){
			ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);

			const currentTag: ITag | ITagGroup = <ITag | ITagGroup> event.detail;

			// AI response
			const aiThumb: string = Dictionary.getAIResponse("thumb");
			let aiReponse: string = "";

			// if(currentTag.type == "group"){
			// 	console.log("AI group reponse....:", currentTag);
			// 	const groupTagType: string = (<ITagGroup> currentTag).getGroupTagType();
			// 	aiReponse = Dictionary.getAIResponse(groupTagType);
			// }else{
			// 	console.log("AI tag reponse....:", currentTag);
			// 	aiReponse = Dictionary.getAIResponse(currentTag.type);
			// }

			aiReponse = "ChatList: " + (currentTag.name || currentTag.title) + " : " + currentTag.question;
			
			this.createResponse(true, aiReponse, aiThumb);

			// user reponse, create the waiting response
			this.createResponse(false);
		}

		private createResponse(isAIReponse: boolean, value: string = null, image: string = Dictionary.get("user-image")){
			this.currentResponse = new ChatResponse({
				// image: null,
				isAIReponse: isAIReponse,
				response: value,// || input-response,
				image: image,
			});
			
			this.el.appendChild(this.currentResponse.el);
			// this.el.scrollTop = 1000000000;
		}

		public getTemplate () : string {
			return `<cf-chat type='pluto'>
					</cf-chat>`;
		}

		public remove(){
			document.removeEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);
			this.flowUpdateCallback = null;
			document.removeEventListener(FlowEvents.USER_INPUT_UPDATE, this.userInputUpdateCallback, false);
			this.userInputUpdateCallback = null;
			document.removeEventListener(UserInputEvents.KEY_CHANGE, this.onInputKeyChangeCallback, false);
			this.onInputKeyChangeCallback = null
			document.removeEventListener(UserInputEvents.CONTROL_ELEMENTS_ADDED, this.onControlElementsAddedToUserInputCallback, false);
			this.onControlElementsAddedToUserInputCallback = null
			super.remove();
		}
	}
}

