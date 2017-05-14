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
		private onInputHeightChangeCallback: () => void;
		private currentResponse: ChatResponse;
		private currentUserResponse: ChatResponse;
		private flowDTOFromUserInputUpdate: FlowDTO;
		private responses: Array<ChatResponse>;

		constructor(options: IBasicElementOptions){
			super(options);

			this.responses = [];

			// flow update
			this.flowUpdateCallback = this.onFlowUpdate.bind(this);
			this.eventTarget.addEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);

			// user input update
			this.userInputUpdateCallback = this.onUserInputUpdate.bind(this);
			this.eventTarget.addEventListener(FlowEvents.USER_INPUT_UPDATE, this.userInputUpdateCallback, false);

			// user input key change
			this.onInputKeyChangeCallback = this.onInputKeyChange.bind(this);
			this.eventTarget.addEventListener(UserInputEvents.KEY_CHANGE, this.onInputKeyChangeCallback, false);

			// user input height change
			this.onInputHeightChangeCallback = this.onInputHeightChange.bind(this);
			this.eventTarget.addEventListener(UserInputEvents.HEIGHT_CHANGE, this.onInputHeightChangeCallback, false);
		}

		private onInputHeightChange(event: CustomEvent){
			const dto: FlowDTO = (<InputKeyChangeDTO> event.detail).dto;
			ConversationalForm.illustrateFlow(this, "receive", event.type, dto);
			this.scrollListTo();
		}

		private onInputKeyChange(event: CustomEvent){
			const dto: FlowDTO = (<InputKeyChangeDTO> event.detail).dto;
			ConversationalForm.illustrateFlow(this, "receive", event.type, dto);
		}

		private onUserInputUpdate(event: CustomEvent){
			ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);

			if(this.currentUserResponse){
				const response: FlowDTO = event.detail;
				this.setCurrentUserResponse(response);
			}
			else{
				// this should never happen..
				throw new Error("No current response ..?")
			}
		}

		private onFlowUpdate(event: CustomEvent){
			ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);

			const currentTag: ITag | ITagGroup = <ITag | ITagGroup> event.detail.tag;
			if(this.currentResponse)
				this.currentResponse.disabled = false;

			if(this.containsTagResponse(currentTag) && !event.detail.ignoreExistingTag){
				// because user maybe have scrolled up and wants to edit

				// tag is already in list, so re-activate it
				this.onUserWantsToEditTag(currentTag);
			}else{
				// robot response
				setTimeout(() => {
					const robot: ChatResponse = this.createResponse(true, currentTag, currentTag.question);
					if(this.currentUserResponse){
						// linked, but only if we should not ignore existing tag
						this.currentUserResponse.setLinkToOtherReponse(robot);
						robot.setLinkToOtherReponse(this.currentUserResponse);
					}

					// user response, create the waiting response
					setTimeout(() => {
						this.currentUserResponse = this.createResponse(false, currentTag);

					}, 200);
				}, this.responses.length === 0 ? 500 : 0);
			}
		}

		/**
		* @name containsTagResponse
		* @return boolean
		* check if tag has already been responded to
		*/
		private containsTagResponse(tagToChange: ITag): boolean {
			for (let i = 0; i < this.responses.length; i++) {
				let element: ChatResponse = <ChatResponse>this.responses[i];
				if(!element.isRobotReponse && element.tag == tagToChange && !tagToChange.hasConditions()){
					return true;
				}
			}

			return false;
		}
		/**
		* @name onUserAnswerClicked
		* on user ChatReponse clicked
		*/
		private onUserWantsToEditTag(tagToChange: ITag): void {
			let oldReponse: ChatResponse;
			for (let i = 0; i < this.responses.length; i++) {
				let element: ChatResponse = <ChatResponse>this.responses[i];
				if(!element.isRobotReponse && element.tag == tagToChange){
					// update element thhat user wants to edit
					oldReponse = element;
					break;
				}
			}

			// reset the current user response
			this.currentUserResponse.processResponseAndSetText();

			if(oldReponse){
				// only disable latest tag when we jump back
				if(this.currentUserResponse == this.responses[this.responses.length - 1]){
					this.currentUserResponse.hide();
				}

				this.currentUserResponse = oldReponse;

				this.onListUpdate(this.currentUserResponse);
			}
		}

		private onListUpdate(chatResponse: ChatResponse){
			setTimeout(() => {
				this.eventTarget.dispatchEvent(new CustomEvent(ChatListEvents.CHATLIST_UPDATED, {
					detail: this
				}));

				chatResponse.show();

				this.scrollListTo(chatResponse);
			}, 0);
		}

		/**
		* @name clearFrom
		* remove responses, this usually happens if a user jumps back to a conditional element
		*/
		public clearFrom(index: number): void {
			index += index % 2; // round up so we dont remove the user response element
			while(this.responses.length > index){
				let element: ChatResponse = this.responses.pop();
				element.dealloc();
			}
		}

		/**
		* @name setCurrentUserResponse
		* Update current reponse, is being called automatically from onFlowUpdate, but can also in rare cases be called automatically when flow is controlled manually.
		* reponse: FlowDTO
		*/
		public setCurrentUserResponse(dto: FlowDTO){
			this.flowDTOFromUserInputUpdate = dto;

			if(!this.flowDTOFromUserInputUpdate.text && dto.tag){
				if(dto.tag.type == "group"){
					this.flowDTOFromUserInputUpdate.text = Dictionary.get("user-reponse-missing-group");
				}else if(dto.tag.type != "password"){
					this.flowDTOFromUserInputUpdate.text = Dictionary.get("user-reponse-missing");
				}
			}

			this.currentUserResponse.setValue(this.flowDTOFromUserInputUpdate);
			this.scrollListTo();
		}

		/**
		* @name getResponses
		* returns the submitted responses.
		*/
		public getResponses(): Array<ChatResponse> {
			return this.responses;
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

		public createResponse(isRobotReponse: boolean, currentTag: ITag, value: string = null) : ChatResponse{
			const response: ChatResponse = new ChatResponse({
				// image: null,
				list: this,
				tag: currentTag,
				eventTarget: this.eventTarget,
				isRobotReponse: isRobotReponse,
				response: value,
				image: isRobotReponse ? Dictionary.getRobotResponse("robot-image") : Dictionary.get("user-image"),
			});

			this.responses.push(response);

			this.currentResponse = response;

			const scrollable: HTMLElement = <HTMLElement> this.el.querySelector("scrollable");
			scrollable.appendChild(this.currentResponse.el);

			this.onListUpdate(response);

			return response;
		}

		public scrollListTo(response: ChatResponse = null){
			try{
				const scrollable: HTMLElement = <HTMLElement> this.el.querySelector("scrollable");
				const y: number = response ? response.el.offsetTop - 50 : 1000000000;
				scrollable.scrollTop = y;
				setTimeout(() => scrollable.scrollTop = y, 100);
			}catch(e){
				// catch errors where CF have been removed
			}
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

