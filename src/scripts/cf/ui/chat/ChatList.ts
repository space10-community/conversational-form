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
		private currentResponse: ChatResponse;
		private currentUserResponse: ChatResponse;
		private flowDTOFromUserInputUpdate: FlowDTO;
		private responses: Array<ChatResponse>;

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
		}

		private onInputKeyChange(event: CustomEvent){
			const dto: FlowDTO = (<InputKeyChangeDTO> event.detail).dto;
			ConversationalForm.illustrateFlow(this, "receive", event.type, dto);
		}

		private onUserInputUpdate(event: CustomEvent){
			ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);

			if(this.currentUserResponse){
				const response: FlowDTO = event.detail;
				this.flowDTOFromUserInputUpdate = response;

				if(!this.flowDTOFromUserInputUpdate.text)
					this.flowDTOFromUserInputUpdate.text = Dictionary.get("user-reponse-missing");
				this.currentUserResponse.setValue(this.flowDTOFromUserInputUpdate);
			}
			else{
				// this should never happen..
				throw new Error("No current response ..?")
			}
		}

		private onFlowUpdate(event: CustomEvent){
			ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);

			const currentTag: ITag | ITagGroup = <ITag | ITagGroup> event.detail;

			// robot response
			let robotReponse: string = "";

			robotReponse = currentTag.question;

			// one way data binding values:
			if(this.flowDTOFromUserInputUpdate){
				// previous answer..
				robotReponse = robotReponse.split("{previous-answer}").join(this.flowDTOFromUserInputUpdate.text);
				
				// add other patterns here..
				// robotReponse = robotReponse.split("{...}").join(this.flowDTOFromUserInputUpdate.text);
			}
			this.createResponse(true, currentTag, robotReponse);

			// user reponse, create the waiting response
			this.createResponse(false, currentTag);
		}

		public updateThumbnail(robot: boolean, img: string){
			Dictionary.set(robot ? "robot-image" : "user-image", robot ? "robot" : "human", img);

			const newImage: string = robot ? Dictionary.getRobotResponse("robot-image") : Dictionary.get("user-image");
			for (let i = 0; i < this.responses.length; i++) {
				let element: ChatResponse = <ChatResponse>this.responses[i];
				if(robot && element.isRobotReponse){
					element.updateThumbnail(newImage);
				}else if(!robot && !element.isRobotReponse){
					element.updateThumbnail(newImage);
				}

			}
		}

		public createResponse(isRobotReponse: boolean, currentTag: ITag, value: string = null){
			const response: ChatResponse = new ChatResponse({
				// image: null,
				tag: currentTag,
				isRobotReponse: isRobotReponse,
				response: value,// || input-response,
				image: isRobotReponse ? Dictionary.getRobotResponse("robot-image") : Dictionary.get("user-image"),
			});

			if(!this.responses)
				this.responses = [];
			this.responses.push(response);

			this.currentResponse = response;

			if(!isRobotReponse)
				this.currentUserResponse = this.currentResponse;
			
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
			super.dealloc();
		}
	}
}

