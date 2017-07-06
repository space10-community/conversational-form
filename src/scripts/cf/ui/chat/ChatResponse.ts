/// <reference path="../BasicElement.ts"/>
/// <reference path="../../logic/Helpers.ts"/>
/// <reference path="../../ConversationalForm.ts"/>

// namespace
namespace cf {
	// interface
	export interface IChatResponseOptions extends IBasicElementOptions{
		response: string;
		image: string;
		list: ChatList;
		isRobotResponse: boolean;
		tag: ITag;
	}

	export const ChatResponseEvents = {
		USER_ANSWER_CLICKED: "cf-on-user-answer-clicked",
	}

	// class
	export class ChatResponse extends BasicElement {
		public static list: ChatList;
		private static THINKING_MARKUP: string = "<thinking><span>.</span><span>.</span><span>.</span></thinking>";

		public isRobotResponse: boolean;

		public response: string;
		public originalResponse: string; // keep track of original response with id pipings
		public parsedResponse: string;
		private textEl: Element;
		private image: string;
		private _tag: ITag;
		private responseLink: ChatResponse; // robot reference from use
		private onReadyCallback: () => void;

		private onClickCallback: () => void;

		public get tag(): ITag{
			return this._tag;
		}

		public get disabled() : boolean {
			return this.el.classList.contains("disabled");
		}

		public set disabled(value : boolean) {
			if(value)
				this.el.classList.add("disabled");
			else
				this.el.classList.remove("disabled");
		}

		public set visible(value: boolean){
			this.el.offsetWidth;
			setTimeout(() => value ? this.el.classList.add("show") : this.el.classList.remove("show"), 100);
		}

		public get strippedSesponse():string{
			var html = this.response;
			// use browsers native way of stripping
			var div = document.createElement("div");
			div.innerHTML = html;
			return div.textContent || div.innerText || "";
		}

		constructor(options: IChatResponseOptions){
			super(options);
			this._tag = options.tag;
		}

		public whenReady(resolve: () => void){
			this.onReadyCallback = resolve;
		}

		public setValue(dto: FlowDTO = null){
			if(!this.visible){
				this.visible = true;
			}

			const isThinking: boolean = this.el.hasAttribute("thinking");

			if(!dto){
				this.setToThinking();
			}else{
				// same same
				this.response = this.originalResponse = dto.text;
				
				this.processResponseAndSetText();

				if(this.responseLink && !this.isRobotResponse){
					// call robot and update for binding values ->
					this.responseLink.processResponseAndSetText();
				}

				// check for if response type is file upload...
				if(dto && dto.controlElements && dto.controlElements[0]){
					switch(dto.controlElements[0].type){
						case "UploadFileUI" :
							this.textEl.classList.add("file-icon");
							break;
					}
				}

				if(!this.isRobotResponse && !this.onClickCallback){
					// edit
					this.onClickCallback = this.onClick.bind(this);
					this.el.addEventListener(Helpers.getMouseEvent("click"), this.onClickCallback, false);
				}
			}
		}

		public show(){
			this.visible = true;
			this.disabled = false;
			if(!this.response){
				this.setToThinking();
			}else{
				this.checkForEditMode();
			}
		}

		public updateThumbnail(src: string){
			this.image = src;
			const thumbEl: HTMLElement = <HTMLElement> this.el.getElementsByTagName("thumb")[0];
			thumbEl.style.backgroundImage = 'url("' + this.image + '")';
		}

		public setLinkToOtherReponse(response: ChatResponse){
			// link reponse to another one, keeping the update circle complete.
			this.responseLink = response;
		}

		public processResponseAndSetText(){
			if(!this.originalResponse)
				return;

			console.log('multiple: this.originalResponse', this.originalResponse);
			var innerResponse: string = this.originalResponse;
			
			if(this._tag && this._tag.type == "password" && !this.isRobotResponse){
				var newStr: string = "";
				for (let i = 0; i < innerResponse.length; i++) {
					newStr += "*";
				}

				innerResponse = newStr;
			}else{
				innerResponse = Helpers.emojify(innerResponse)
			}

			if(this.responseLink && this.isRobotResponse){
				// if robot, then check linked response for binding values
				
				// one way data binding values:
				innerResponse = innerResponse.split("{previous-answer}").join(this.responseLink.parsedResponse);

			}

			if(this.isRobotResponse){
				// Piping, look through IDs, and map values to dynamics
				const reponses: Array<ChatResponse> = ChatResponse.list.getResponses();
				for (var i = 0; i < reponses.length; i++) {
					var response: ChatResponse = reponses[i];
					if(response !== this){
						if(response.tag){
							// check for id, standard
							if(response.tag.id){
								innerResponse = innerResponse.split("{" + response.tag.id + "}").join(<string> response.tag.value);
							}

							//fallback check for name
							if(response.tag.name){
								innerResponse = innerResponse.split("{" + response.tag.name + "}").join(<string> response.tag.value);
							}
						}
					}
				}

				// add more..
				// innerResponse = innerResponse.split("{...}").join(this.responseLink.parsedResponse);
			}

			// check if response contains an image as answer
			const responseContains: boolean = innerResponse.indexOf("contains-image") != -1;
			if(responseContains)
				this.textEl.classList.add("contains-image");
			

			console.log('multiple: innerResponse', innerResponse,"+++", this.response);

			// if(this.response != innerResponse){
				// now set it
				if(this.isRobotResponse){
					this.textEl.innerHTML = "";
					// robot response, allow for && for multiple responses
					var chainedResponses: Array<string> = innerResponse.split("&&");
					for (let i = 0; i < chainedResponses.length; i++) {
						let str: string = <string>chainedResponses[i];
						setTimeout(() =>{
							this.textEl.innerHTML += "<p>" + str + "</p>";
							const p: NodeListOf<HTMLElement> = this.textEl.getElementsByTagName("p");
							p[p.length - 1].offsetWidth;
							p[p.length - 1].classList.add("show");
						}, 500 + (i * 500));
					}

					setTimeout(() => {
						if(this.onReadyCallback)
							this.onReadyCallback();
					}, chainedResponses.length * 500);
				}else{
					// user response, act normal
					this.textEl.innerHTML = "<p>" + innerResponse + "</p>";
					const p: NodeListOf<HTMLElement> = this.textEl.getElementsByTagName("p");
					p[p.length - 1].offsetWidth;
					p[p.length - 1].classList.add("show");
				}

				this.parsedResponse = innerResponse;
			// }

			// bounce
			this.el.removeAttribute("thinking");
			this.textEl.removeAttribute("value-added");
			setTimeout(() => {
				this.textEl.setAttribute("value-added", "");
			}, 0);

			this.checkForEditMode();

			// update response
			this.response = innerResponse;
		}

		private checkForEditMode(){
			if(!this.isRobotResponse && !this.el.hasAttribute("thinking")){
				this.el.classList.add("can-edit");
				this.disabled = false;
			}
		}

		private setToThinking(){
			this.textEl.innerHTML = ChatResponse.THINKING_MARKUP;
			this.el.classList.remove("can-edit");
			this.el.setAttribute("thinking", "");
		}

		/**
		* @name onClickCallback
		* click handler for el
		*/
		private onClick(event: MouseEvent): void {
			this.setToThinking();

			ConversationalForm.illustrateFlow(this, "dispatch", ChatResponseEvents.USER_ANSWER_CLICKED, event);
			this.eventTarget.dispatchEvent(new CustomEvent(ChatResponseEvents.USER_ANSWER_CLICKED, {
				detail: this._tag
			}));
		}

		protected setData(options: IChatResponseOptions):void{
			this.image = options.image;
			this.response = this.originalResponse = options.response;
			this.isRobotResponse = options.isRobotResponse;
			
			super.setData(options);
		}
		protected onElementCreated(){
			this.textEl = <Element> this.el.getElementsByTagName("text")[0];

			this.setValue();

			this.updateThumbnail(this.image);

			if(this.isRobotResponse || this.response != null){
				// Robot is pseudo thinking, can also be user -->
				// , but if addUserChatResponse is called from ConversationalForm, then the value is there, therefore skip ...
				setTimeout(() =>{
					this.setValue(<FlowDTO>{text: this.response})
				}, 0);
				//ConversationalForm.animationsEnabled ? Helpers.lerp(Math.random(), 500, 900) : 0);
			}else{
				// shows the 3 dots automatically, we expect the reponse to be empty upon creation
				// TODO: Auto completion insertion point
				setTimeout(() =>{
					this.el.classList.add("peak-thumb")
				}, ConversationalForm.animationsEnabled ? 1400 : 0);
			}
		}

		public dealloc(){
			this.onReadyCallback = null;

			if(this.onClickCallback){
				this.el.removeEventListener(Helpers.getMouseEvent("click"), this.onClickCallback, false);
				this.onClickCallback = null;
			}

			super.dealloc();
		}

		// template, can be overwritten ...
		public getTemplate () : string {
			return `<cf-chat-response class="` + (this.isRobotResponse ? "robot" : "user") + `">
				<thumb></thumb>
				<text></text>
			</cf-chat-response>`;
		}
	}
}