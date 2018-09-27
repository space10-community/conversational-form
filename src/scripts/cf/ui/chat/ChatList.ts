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
		private onControlElementsResizedCallback: () => void;
		private onControlElementsChangedCallback: () => void;
		private currentResponse: ChatResponse;
		private currentUserResponse: ChatResponse;
		private flowDTOFromUserInputUpdate: FlowDTO;
		private responses: Array<ChatResponse>;
		private input: UserInputElement;

		constructor(options: IBasicElementOptions){
			super(options);

			ChatResponse.list = this;

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

			// on control elements changed
			this.onControlElementsResizedCallback = this.onControlElementsResized.bind(this);
			this.eventTarget.addEventListener(ControlElementsEvents.ON_RESIZE, this.onControlElementsResizedCallback, false);

			this.onControlElementsChangedCallback = this.onControlElementsChanged.bind(this);
			this.eventTarget.addEventListener(ControlElementsEvents.CHANGED, this.onControlElementsChangedCallback, false);
		}

		private onInputHeightChange(event: CustomEvent){
			const dto: FlowDTO = (<InputKeyChangeDTO> event.detail).dto;
			ConversationalForm.illustrateFlow(this, "receive", event.type, dto);

			// this.input.controlElements.el.style.transition = "height 2s ease-out";
			// this.input.controlElements.el.style.height = this.input.controlElements.el.scrollHeight + 'px';

			this.onInputElementChanged();
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
		}

		public addInput(input: UserInputElement){
			this.input = input;
		}

		/**
		* @name onControlElementsChanged
		* on control elements change
		*/
		private onControlElementsChanged(event: Event): void {
			this.onInputElementChanged();
		}

		/**
		* @name onControlElementsResized
		* on control elements resize
		*/
		private onControlElementsResized(event: Event): void {

			ConversationalForm.illustrateFlow(this, "receive", ControlElementsEvents.ON_RESIZE);
			let responseToScrollTo: ChatResponse = this.currentResponse;
			if(responseToScrollTo){
				if(!responseToScrollTo.added){
					// element not added yet, so find closest
					for (let i = this.responses.indexOf(responseToScrollTo); i >= 0; i--) {
						let element: ChatResponse = <ChatResponse>this.responses[i];
						if(element.added){
							responseToScrollTo = element;
							break;
						}
					}
				}
				
				responseToScrollTo.scrollTo();
			}

			this.onInputElementChanged();
		}

		private onInputElementChanged(){
			if (!this.cfReference || !this.cfReference.el) return;
			const cfHeight: number = this.cfReference.el.offsetHeight;
			const inputHeight: number = this.input.height;
			const listHeight: number = cfHeight - inputHeight;
			//this.el.style.height = listHeight + "px";
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
					robot.whenReady(() =>{
						// create user response
						this.currentUserResponse = this.createResponse(false, currentTag);
						robot.scrollTo();
					});

					if(this.currentUserResponse){
						// linked, but only if we should not ignore existing tag
						this.currentUserResponse.setLinkToOtherReponse(robot);
						robot.setLinkToOtherReponse(this.currentUserResponse);
					}
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
				if(!element.isRobotResponse && element.tag == tagToChange && !tagToChange.hasConditions()){
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
			let responseUserWantsToEdit: ChatResponse;
			for (let i = 0; i < this.responses.length; i++) {
				let element: ChatResponse = <ChatResponse>this.responses[i];
				if(!element.isRobotResponse && element.tag == tagToChange){
					// update element thhat user wants to edit
					responseUserWantsToEdit = element;
					break;
				}
			}

			// reset the current user response
			this.currentUserResponse.processResponseAndSetText();

			if(responseUserWantsToEdit){
				// remove latest user response, if it is there any, also make sure we don't remove the first one
				if(this.responses.length > 2){
					if(!this.responses[this.responses.length - 1].isRobotResponse){
						this.responses.pop().dealloc();
					}
					
					// remove latest robot response, it should always be a robot response
					this.responses.pop().dealloc();
				}

				this.currentUserResponse = responseUserWantsToEdit;

				// TODO: Set user field to thinking?
				// this.currentUserResponse.setToThinking??

				this.currentResponse = this.responses[this.responses.length - 1];

				this.onListUpdate(this.currentUserResponse);
			}
		}

		private updateTimer: number = 0;
		private onListUpdate(chatResponse: ChatResponse){
			clearTimeout(this.updateTimer);

			this.updateTimer = setTimeout(() => {
				this.eventTarget.dispatchEvent(new CustomEvent(ChatListEvents.CHATLIST_UPDATED, {
					detail: this
				}));
				chatResponse.show();
			}, 0);
		}

		/**
		* @name clearFrom
		* remove responses, this usually happens if a user jumps back to a conditional element
		*/
		public clearFrom(index: number): void {
			index = index * 2; // double up because of robot responses
			index += index % 2; // round up so we dont remove the user response element
			while(this.responses.length > index){
				this.responses.pop().dealloc();
			}
		}

		/**
		* @name setCurrentUserResponse
		* Update current reponse, is being called automatically from onFlowUpdate, but can also, in rare cases, be called when flow is controlled manually.
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
				if(robot && element.isRobotResponse){
					element.updateThumbnail(newImage);
				}else if(!robot && !element.isRobotResponse){
					element.updateThumbnail(newImage);
				}
			}
		}

		public createResponse(isRobotResponse: boolean, currentTag: ITag, value: string = null) : ChatResponse{
			const scrollable: HTMLElement = <HTMLElement> this.el.querySelector(".scrollableInner");
			const response: ChatResponse = new ChatResponse({
				// image: null,
				cfReference: this.cfReference,
				list: this,
				tag: currentTag,
				eventTarget: this.eventTarget,
				isRobotResponse: isRobotResponse,
				response: value,
				image: isRobotResponse ? Dictionary.getRobotResponse("robot-image") : Dictionary.get("user-image"),
				container: scrollable
			});

			this.responses.push(response);

			this.currentResponse = response;

			this.onListUpdate(response);

			return response;
		}

		public getTemplate () : string {
			return `<cf-chat type='pluto'>
						<scrollable>
							<div class="scrollableInner"></div>
						</scrollable>
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

