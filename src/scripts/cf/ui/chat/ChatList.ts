/// <reference path="ChatResponse.ts"/>
/// <reference path="../BasicElement.ts"/>
/// <reference path="../../logic/FlowManager.ts"/>

// namespace
namespace cf {
	// interface
	export const ChatListEvents = {
		CHATLIST_UPDATED: "cf-chatlist-updated"
	}

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
			this.eventTarget.addEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);

			// user input update
			this.userInputUpdateCallback = this.onUserInputUpdate.bind(this);
			this.eventTarget.addEventListener(FlowEvents.USER_INPUT_UPDATE, this.userInputUpdateCallback, false);

			// user input key change
			this.onInputKeyChangeCallback = this.onInputKeyChange.bind(this);
			this.eventTarget.addEventListener(UserInputEvents.KEY_CHANGE, this.onInputKeyChangeCallback, false);
		}

		private onInputKeyChange(event: CustomEvent){
			const dto: FlowDTO = (<InputKeyChangeDTO> event.detail).dto;
			ConversationalForm.illustrateFlow(this, "receive", event.type, dto);
		}

		private onUserInputUpdate(event: CustomEvent){
			ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);

			if(this.currentUserResponse){
				const response: FlowDTO = event.detail;
				this.setCurrentResponse(response);
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

		/**
		* @name onUserAnswerClicked
		* on user ChatReponse clicked
		*/
		public onUserWantToEditPreviousAnswer(tag: ITag): void {
			console.log((<any>this.constructor).name, 'this.onUserWantToEditPreviousAnswer:', this.currentUserResponse);
			this.currentUserResponse.skippedBecauseOfEdit();
		}

		/**
		* @name setCurrentResponse
		* Update current reponse, is being called automatically from onFlowUpdate, but can also in rare cases be called automatically when flow is controlled manually.
		* reponse: FlowDTO
		*/
		public setCurrentResponse(response: FlowDTO){
			this.flowDTOFromUserInputUpdate = response;

			if(!this.flowDTOFromUserInputUpdate.text){
				if(response.input.currentTag.type == "group")
					this.flowDTOFromUserInputUpdate.text = Dictionary.get("user-reponse-missing-group");
				else
					this.flowDTOFromUserInputUpdate.text = Dictionary.get("user-reponse-missing");
			}

			this.currentUserResponse.setValue(this.flowDTOFromUserInputUpdate);
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
				eventTarget: this.eventTarget,
				isRobotReponse: isRobotReponse,
				response: value,
				image: isRobotReponse ? Dictionary.getRobotResponse("robot-image") : Dictionary.get("user-image"),
			});

			if(!this.responses)
				this.responses = [];
			this.responses.push(response);

			this.currentResponse = response;

			if(!isRobotReponse)
				this.currentUserResponse = this.currentResponse;
			
			const scrollable = this.el.querySelector("scrollable");
			scrollable.appendChild(this.currentResponse.el);
			// this.el.scrollTop = 1000000000;

			setTimeout(() => {
				this.eventTarget.dispatchEvent(new CustomEvent(ChatListEvents.CHATLIST_UPDATED, {
					detail: this
				}));
			}, 0);
		}

		public getTemplate () : string {
			return `<cf-chat type='pluto'>
						<scrollable></scrollable>
					</cf-chat>`;
		}

		public dealloc(){
			this.eventTarget.removeEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);
			this.flowUpdateCallback = null;

			this.eventTarget.removeEventListener(FlowEvents.USER_INPUT_UPDATE, this.userInputUpdateCallback, false);
			this.userInputUpdateCallback = null;

			this.eventTarget.removeEventListener(UserInputEvents.KEY_CHANGE, this.onInputKeyChangeCallback, false);
			this.onInputKeyChangeCallback = null
			super.dealloc();
		}
	}
}

