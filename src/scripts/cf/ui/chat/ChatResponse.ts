/// <reference path="../BasicElement.ts"/>
/// <reference path="../../logic/Helpers.ts"/>
/// <reference path="../../ConversationalForm.ts"/>

// namespace
namespace cf {
	// interface
	export interface IChatResponseOptions extends IBasicElementOptions{
		response: string;
		image: string;
		isRobotReponse: boolean;
		tag: ITag;
	}

	export const ChatResponseEvents = {
		ROBOT_QUESTION_ASKED: "cf-on-robot-asked-question",
		USER_ANSWER_CLICKED: "cf-on-user-answer-clicked",
	}

	// class
	export class ChatResponse extends BasicElement {
		private static THINKING_MARKUP: string = "<thinking><span>.</span><span>.</span><span>.</span></thinking>";

		public isRobotReponse: boolean;

		private response: string;
		private image: string;
		private _tag: ITag
		private responseLink: ChatResponse;

		private onClickCallback: () => void;

		public get tag(): ITag{
			return this._tag;
		}

		public get disabled() : boolean {
			return this.el.classList.contains("disabled");
		}

		public set disabled(value : boolean) {
			this.el.classList.toggle("disabled", value);
		}

		public set visible(value: boolean){
			if(value){
				this.el.classList.add("show");
			}else{
				this.el.classList.remove("show");
			}
		}

		constructor(options: IChatResponseOptions){
			super(options);
			this._tag = options.tag;
		}

		public setValue(dto: FlowDTO = null){
			this.response = dto ? dto.text : "";

			this.processResponse();
			
			const text: Element = this.el.getElementsByTagName("text")[0];

			if(!this.visible){
				this.visible = true;
			}

			const isThinking: boolean = text.hasAttribute("thinking");

			if(!this.isRobotReponse && dto){
				// presume reponse is added
				this.el.classList.add("can-edit");
				this.disabled = false;
			}

			if(!isThinking || (!this.response || this.response.length == 0)){
				text.innerHTML = ChatResponse.THINKING_MARKUP;
				this.el.classList.remove("can-edit");
				text.setAttribute("thinking", "");
			}else{
				text.innerHTML = this.response;
				text.setAttribute("value-added", "");
				text.removeAttribute("thinking");

				// check for if reponse type is file upload...
				if(dto && dto.controlElements && dto.controlElements[0]){
					switch(dto.controlElements[0].type){
						case "UploadFileUI" :
							text.classList.add("file-icon");
							var icon = document.createElement("span");
							icon.innerHTML = Dictionary.get("icon-type-file");
							text.insertBefore(icon.children[0], text.firstChild)
							break;
					}
				}

				if(this.isRobotReponse){
					// Robot Reponse ready to ask question.
					ConversationalForm.illustrateFlow(this, "dispatch", ChatResponseEvents.ROBOT_QUESTION_ASKED, this.response);
					this.eventTarget.dispatchEvent(new CustomEvent(ChatResponseEvents.ROBOT_QUESTION_ASKED, {
						detail: this
					}));
				}else if(!this.onClickCallback){
					this.onClickCallback = this.onClick.bind(this);
					this.el.addEventListener(Helpers.getMouseEvent("click"), this.onClickCallback, false);
				}
			}
		}

		public updateThumbnail(src: string){
			this.image = src;
			const thumbEl: HTMLElement = <HTMLElement> this.el.getElementsByTagName("thumb")[0];
			thumbEl.style.backgroundImage = "url(" + this.image + ")";
		}

		public setLinkToOtherReponse(response: ChatResponse){
			// link reponse to another one, keeping the update circle complete.
			this.responseLink = response;
		}

		/**
		* @name onClickCallback
		* click handler for el
		*/
		private onClick(event: MouseEvent): void {
			ConversationalForm.illustrateFlow(this, "dispatch", ChatResponseEvents.USER_ANSWER_CLICKED, event);
			this.eventTarget.dispatchEvent(new CustomEvent(ChatResponseEvents.USER_ANSWER_CLICKED, {
				detail: this._tag
			}));
		}

		private processResponse(){
			this.response = Helpers.emojify(this.response);
			
			if(this._tag && this._tag.type == "password" && !this.isRobotReponse){
				var newStr: string = "";
				for (let i = 0; i < this.response.length; i++) {
					newStr += "*";
				}
				this.response = newStr;
			}
		}

		protected setData(options: IChatResponseOptions):void{
			this.image = options.image;
			this.response = "";
			this.isRobotReponse = options.isRobotReponse;
			super.setData(options);

			setTimeout(() => {
				this.setValue();

				if(this.isRobotReponse || options.response != null){
					// Robot is pseudo thinking, can also be user -->
					// , but if addUserChatResponse is called from ConversationalForm, then the value is there, therefore skip ...
					setTimeout(() => this.setValue(<FlowDTO>{text: options.response}), 0);//ConversationalForm.animationsEnabled ? Helpers.lerp(Math.random(), 500, 900) : 0);
				}else{
					this.disabled = false;
					// show the 3 dots automatically, we expect the reponse to be empty upon creation
					setTimeout(() => this.el.classList.add("peak-thumb"), ConversationalForm.animationsEnabled ? 1400 : 0);
				}
			}, 0);
		}

		public dealloc(){
			if(this.onClickCallback){
				this.el.removeEventListener(Helpers.getMouseEvent("click"), this.onClickCallback, false);
				this.onClickCallback = null;
			}

			super.dealloc();
		}

		// template, can be overwritten ...
		public getTemplate () : string {
			return `<cf-chat-response class="` + (this.isRobotReponse ? "robot" : "user") + `">
				<thumb style="background-image: url(` + this.image + `)"></thumb>
				<text>` + (!this.response ? ChatResponse.THINKING_MARKUP : this.response) + `</text>
			</cf-chat-response>`;
		}
	}
}