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
		USER_ANSWER_CLICKED: "cf-on-user-answer-clicked",
	}

	// class
	export class ChatResponse extends BasicElement {
		private static THINKING_MARKUP: string = "<thinking><span>.</span><span>.</span><span>.</span></thinking>";

		public isRobotReponse: boolean;

		public response: string;
		public parsedResponse: string;
		private textEl: Element;
		private image: string;
		private _tag: ITag
		private responseLink: ChatResponse; // robot reference from use

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
			this.textEl = <Element> this.el.getElementsByTagName("text")[0];
		}

		public setValue(dto: FlowDTO = null){
			if(!this.visible){
				this.visible = true;
			}

			const isThinking: boolean = this.textEl.hasAttribute("thinking");

			if(!this.isRobotReponse && dto){
				// presume reponse is added
				this.el.classList.add("can-edit");
				this.disabled = false;
			}

			if(!dto || dto.text == ""){
				this.textEl.innerHTML = ChatResponse.THINKING_MARKUP;
				this.el.classList.remove("can-edit");
				this.textEl.setAttribute("thinking", "");
			}else{

				this.response = dto.text;
				const processedResponse: string = this.processResponseAndSetText(dto);

				if(this.responseLink && !this.isRobotReponse){
					// call robot and update for binding values ->
					this.responseLink.processResponseAndSetText(dto);
				}

				// check for if response type is file upload...
				if(dto && dto.controlElements && dto.controlElements[0]){
					switch(dto.controlElements[0].type){
						case "UploadFileUI" :
							this.textEl.classList.add("file-icon");
							break;
					}
				}

				if(!this.isRobotReponse && !this.onClickCallback){
					this.onClickCallback = this.onClick.bind(this);
					this.el.addEventListener(Helpers.getMouseEvent("click"), this.onClickCallback, false);
				}
			}
		}

		public hide(){
			this.el.classList.remove("show");
			this.disabled = true;
		}

		public show(){
			this.el.classList.add("show");
			this.disabled = false;
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

		public processResponseAndSetText(dto: FlowDTO): string{
			var innerResponse: string = this.response;
			
			if(this._tag && this._tag.type == "password" && !this.isRobotReponse){
				var newStr: string = "";
				for (let i = 0; i < innerResponse.length; i++) {
					newStr += "*";
				}

				innerResponse = newStr;
			}else{
				innerResponse = Helpers.emojify(innerResponse)
			}

			if(this.responseLink && this.isRobotReponse){
				// if robot, then check linked response for binding values
				
				// one way data binding values:
				innerResponse = innerResponse.split("{previous-answer}").join(this.responseLink.parsedResponse);
				// add more..
				// innerResponse = innerResponse.split("{...}").join(this.responseLink.parsedResponse);
			}

			// now set it
			this.textEl.innerHTML = innerResponse;
			this.parsedResponse = innerResponse;

			// bounce
			this.textEl.removeAttribute("thinking");
			this.textEl.removeAttribute("value-added");
			setTimeout(() => {
				this.textEl.setAttribute("value-added", "");
			}, 0)

			return innerResponse;
		}

		/**
		* @name onClickCallback
		* click handler for el
		*/
		private onClick(event: MouseEvent): void {
			this.el.classList.remove("can-edit");
			ConversationalForm.illustrateFlow(this, "dispatch", ChatResponseEvents.USER_ANSWER_CLICKED, event);
			this.eventTarget.dispatchEvent(new CustomEvent(ChatResponseEvents.USER_ANSWER_CLICKED, {
				detail: this._tag
			}));
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
					// shows the 3 dots automatically, we expect the reponse to be empty upon creation
					// TODO: Auto completion insertion point
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