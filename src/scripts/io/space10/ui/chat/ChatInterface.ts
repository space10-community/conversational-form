/// <reference path="ChatResponse.ts"/>
/// <reference path="../../Space10CUI.ts"/>
/// <reference path="../../logic/FlowManager.ts"/>


// namespace
namespace io.space10 {
	// interface

	// class
	export class ChatInterface extends io.space10.BasicElement {
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
			document.addEventListener(io.space10.InputEvents.KEY_CHANGE, this.onInputKeyChangeCallback, false);
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
				this.createUserResponse(event.detail);
			}
		}

		private onFlowUpdate(event: CustomEvent){
			const currentTag: io.space10.ITag | io.space10.ITagGroup = <io.space10.ITag | io.space10.ITagGroup> event.detail;

			let str: string;
			str = "<u>CUI Chat</u>";
			str += "</br>tag type: " + currentTag.type;
			if(currentTag.title)
				str += "</br>tag title: " + currentTag.title;
			else if(currentTag.name)
				str += "</br>tag name: " + currentTag.name;

			str += "</br>tag question: " + currentTag.question;


			if(currentTag.type == "group"){
				const group: io.space10.ITagGroup = <io.space10.ITagGroup> currentTag;
				for (var i = 0; i < group.elements.length; i++) {
					var element: ITag = group.elements[i];
					str += "</br>- group tag type: " + element.type;
				}
			}
			
			this.createTag(currentTag);
			
			// create the waiting user response
			this.createUserResponse();
		}

		private createTag(tag: io.space10.ITag | io.space10.ITagGroup){
			// TODO: create special tags..
			if(tag.type == "group"){
				const grouptTag: io.space10.ITag = (<io.space10.ITagGroup> tag).elements[0]
				console.log(this, 'create specific tag:', grouptTag.type);
			}else{
				console.log(this, 'create specific tag:', tag.type);
			}

			// TODO: This is just for testing, !!!!!!!!!!!!!! REMOVE !!!!!!!!!!!!!!!
			const aiThumb: string = Dictionary.getAIResponse("thumb");
			this.createUserResponse(tag.question, aiThumb);
		}

		private createUserResponse(value: string = null, image: string = Dictionary.get("user-image")){
			
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

