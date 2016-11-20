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
		private flowDTOFromUserInputUpdate: FlowDTO;

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
			const paddingBottom: number = 30;
			this.el.style.paddingBottom = (dto.height + paddingBottom) + "px";
		}

		private onInputKeyChange(event: CustomEvent){
			const dto: FlowDTO = (<InputKeyChangeDTO> event.detail).dto;
			ConversationalForm.illustrateFlow(this, "receive", event.type, dto);

			if(this.currentResponse){
				const inputFieldStr: string = dto.text || dto.input.getInputValue();
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
				this.flowDTOFromUserInputUpdate = response;
			}
			else{
				// this should never happen..
				throw new Error("No current response ..?")
			}
		}

		private onFlowUpdate(event: CustomEvent){
			ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);

			const currentTag: ITag | ITagGroup = <ITag | ITagGroup> event.detail;

			if(this.flowDTOFromUserInputUpdate){
				// validate text..
				if(!this.flowDTOFromUserInputUpdate.text)
					this.flowDTOFromUserInputUpdate.text = Dictionary.get("user-reponse-missing");
				this.currentResponse.setValue(this.flowDTOFromUserInputUpdate);
			}

			// AI response
			const aiThumb: string = Dictionary.getAIResponse("thumb");
			let aiReponse: string = "";

			aiReponse = currentTag.question;

			// one way data binding values:
			if(this.flowDTOFromUserInputUpdate){
				// previous answer..
				aiReponse = aiReponse.split("{previous-answer}").join(this.flowDTOFromUserInputUpdate.text);
				
				// add other patterns here..
				// aiReponse = aiReponse.split("{...}").join(this.flowDTOFromUserInputUpdate.text);
			}
			this.createResponse(true, currentTag, aiReponse, aiThumb);

			// user reponse, create the waiting response
			this.createResponse(false, currentTag);
		}

		private createResponse(isAIReponse: boolean, currentTag: ITag, value: string = null, image: string = Dictionary.get("user-image")){
			this.currentResponse = new ChatResponse({
				// image: null,
				tag: currentTag,
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

		public dealloc(){
			document.removeEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);
			this.flowUpdateCallback = null;
			document.removeEventListener(FlowEvents.USER_INPUT_UPDATE, this.userInputUpdateCallback, false);
			this.userInputUpdateCallback = null;
			document.removeEventListener(UserInputEvents.KEY_CHANGE, this.onInputKeyChangeCallback, false);
			this.onInputKeyChangeCallback = null
			document.removeEventListener(UserInputEvents.CONTROL_ELEMENTS_ADDED, this.onControlElementsAddedToUserInputCallback, false);
			this.onControlElementsAddedToUserInputCallback = null
			super.dealloc();
		}
	}
}

