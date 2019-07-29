/// <reference path="../BasicElement.ts"/>
/// <reference path="../../logic/Helpers.ts"/>
/// <reference path="../../ConversationalForm.ts"/>
/// <reference path="../../interfaces/IUserInterfaceOptions.ts"/>

// namespace
namespace cf {
	// interface
	export interface IChatResponseOptions extends IBasicElementOptions{
		response: string;
		image: string;
		list: ChatList;
		isRobotResponse: boolean;
		tag: ITag;
		container: HTMLElement;
	}

	export const ChatResponseEvents = {
		USER_ANSWER_CLICKED: "cf-on-user-answer-clicked"
	}

	// class
	export class ChatResponse extends BasicElement {
		public static list: ChatList;
		private static THINKING_MARKUP: string = "<p class='show'><thinking><span>.</span><span>.</span><span>.</span></thinking></p>";

		public isRobotResponse: boolean;

		public response: string;
		public originalResponse: string; // keep track of original response with id pipings
		public parsedResponse: string;
		
		private uiOptions: IUserInterfaceOptions;
		private textEl: Element;
		private image: string;
		private container: HTMLElement;
		private _tag: ITag;
		private readyTimer: any;
		private responseLink: ChatResponse; // robot reference from use
		private onReadyCallback: () => void;

		private onClickCallback: () => void;

		public get tag(): ITag{
			return this._tag;
		}

		public get added() : boolean {
			return !!this.el || !!this.el.parentNode || !!this.el.parentNode.parentNode;
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

		/**
		 * We depend on scroll in a column-reverse flex container. This is where Edge and Firefox comes up short
		 */
		private hasFlexBug():boolean {
			return this.cfReference.el.classList.contains('browser-firefox') || this.cfReference.el.classList.contains('browser-edge');
		}

		private animateIn() {
			const outer:HTMLElement = document.querySelector('scrollable');
			const inner:HTMLElement = document.querySelector('.scrollableInner');
			if (this.hasFlexBug()) inner.classList.remove('scroll');
			
			requestAnimationFrame(() => { 
				var height = this.el.scrollHeight;
				this.el.style.height = '0px';
				requestAnimationFrame(() => { 
					this.el.style.height = height + 'px';
					this.el.classList.add('show');
					
					// Listen for transitionend and set to height:auto
					try {
						const sm = window.getComputedStyle(document.querySelectorAll('p.show')[0]);
						const cssAnimationTime: number = +sm.animationDuration.replace('s', ''); // format '0.234234xs
						const cssAnimationDelayTime: number = +sm.animationDelay.replace('s', '');
						setTimeout(() => {
							this.el.style.height = 'auto';

							if (this.hasFlexBug() && inner.scrollHeight > outer.offsetHeight) {
								inner.classList.add('scroll');
								inner.scrollTop = inner.scrollHeight;
							}
						}, (cssAnimationTime + cssAnimationDelayTime) * 1500);
					} catch(err) {
						// Fallback method. Assuming animations do not take longer than 1000ms
						setTimeout(() => {
							if (this.hasFlexBug() && inner.scrollHeight > outer.offsetHeight) {
								inner.classList.add('scroll');
								inner.scrollTop = inner.scrollHeight;
							}
							this.el.style.height = 'auto';
						}, 3000);
					}
				});
			});
		}

		public set visible(value: boolean){

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
			this.container = options.container;
			this.uiOptions = options.cfReference.uiOptions;
			this._tag = options.tag;
		}

		public whenReady(resolve: () => void){
			this.onReadyCallback = resolve;
		}

		public setValue(dto: FlowDTO = null){
			
			// if(!this.visible){
			// 	this.visible = true;
			// }

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

			const thumbEl: HTMLElement = <HTMLElement> this.el.getElementsByTagName("thumb")[0];

			if(src.indexOf("text:") === 0){
				const thumbElSpan: HTMLElement = <HTMLElement> thumbEl.getElementsByTagName("span")[0];
				thumbElSpan.innerHTML = src.split("text:")[1];
				thumbElSpan.setAttribute("length", src.length.toString());
			} else {
				this.image = src;
				thumbEl.style.backgroundImage = 'url("' + this.image + '")';
			}
		}

		public setLinkToOtherReponse(response: ChatResponse){
			// link reponse to another one, keeping the update circle complete.
			this.responseLink = response;
		}

		public processResponseAndSetText(){
			if(!this.originalResponse)
				return;

			var innerResponse: string = this.originalResponse;
			
			if(this._tag && this._tag.type == "password" && !this.isRobotResponse){
				var newStr: string = "";
				for (let i = 0; i < innerResponse.length; i++) {
					newStr += "*";
				}
				innerResponse = newStr;
			}

			// if robot, then check linked response for binding values
			if(this.responseLink && this.isRobotResponse){
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
			}

			// check if response contains an image as answer
			const responseContains: boolean = innerResponse.indexOf("contains-image") != -1;
			if(responseContains)
				this.textEl.classList.add("contains-image");
				// now set it
				if(this.isRobotResponse){
					this.textEl.innerHTML = "";

					if(!this.uiOptions) this.uiOptions = this.cfReference.uiOptions; // On edit uiOptions are empty, so this mitigates the problem. Not ideal.

					let robotInitResponseTime: number = this.uiOptions.robot.robotResponseTime;
					if (robotInitResponseTime != 0){
						this.setToThinking();
					}

					// robot response, allow for && for multiple responses
					var chainedResponses: Array<string> = innerResponse.split("&&");
					
					if(robotInitResponseTime === 0){
						for (let i = 0; i < chainedResponses.length; i++) {
							let str: string = <string>chainedResponses[i];
							this.textEl.innerHTML += "<p>" + str + "</p>";
						}
						for (let i = 0; i < chainedResponses.length; i++) {
							setTimeout(() =>{
								this.tryClearThinking();
								const p: NodeListOf<HTMLElement> = this.textEl.getElementsByTagName("p");
								p[i].classList.add("show");
								this.scrollTo();

							},chainedResponses.length > 1 && i > 0 ? robotInitResponseTime + ((i + 1) * this.uiOptions.robot.chainedResponseTime) : 0);
						}	
					} else {					
						for (let i = 0; i < chainedResponses.length; i++) {
							const revealAfter = robotInitResponseTime + (i * this.uiOptions.robot.chainedResponseTime);
							let str: string = <string>chainedResponses[i];
							setTimeout(() =>{
								this.tryClearThinking();
								this.textEl.innerHTML += "<p>" + str + "</p>";
								const p: NodeListOf<HTMLElement> = this.textEl.getElementsByTagName("p");
								p[i].classList.add("show");
								this.scrollTo();
							}, revealAfter);
						}
					}


					this.readyTimer = setTimeout(() => {
						if(this.onReadyCallback)
							this.onReadyCallback();

						// reset, as it can be called again
						this.onReadyCallback = null;

						if(this._tag && this._tag.skipUserInput === true){
							setTimeout(() =>{
								this._tag.flowManager.nextStep()
								this._tag.skipUserInput = false; // to avoid nextStep being fired again as this would make the flow jump too far when editing a response
							},this.uiOptions.robot.chainedResponseTime);
						}
						
					}, robotInitResponseTime + (chainedResponses.length * this.uiOptions.robot.chainedResponseTime));
				} else {
					// user response, act normal
					this.tryClearThinking();

					const hasImage = innerResponse.indexOf('<img') > -1;
					const imageRegex = new RegExp('<img[^>]*?>', 'g');
					const imageTag = innerResponse.match(imageRegex);
					if (hasImage && imageTag) {
						innerResponse = innerResponse.replace(imageTag[0], '');
						this.textEl.innerHTML = `<p class="hasImage">${imageTag}<span>${innerResponse}</span></p>`;
					} else {
						this.textEl.innerHTML = `<p>${innerResponse}</p>`;
					}

					const p: NodeListOf<HTMLElement> = this.textEl.getElementsByTagName("p");
					p[p.length - 1].offsetWidth;
					p[p.length - 1].classList.add("show");
					this.scrollTo();
				}
				
				this.parsedResponse = innerResponse;

			// }

			// value set, so add element, if not added
			if (
				this.uiOptions.robot
				&& this.uiOptions.robot.robotResponseTime === 0
			) {
				this.addSelf();
			} else {
				setTimeout(() => {
					this.addSelf();
				}, 0);
			}

			// bounce
			this.textEl.removeAttribute("value-added");
			setTimeout(() => {
				this.textEl.setAttribute("value-added", "");
				this.el.classList.add("peak-thumb");
			}, 0);
			
			this.checkForEditMode();

			// update response
			// remove the double ampersands if present
			this.response = innerResponse.split("&&").join(" ");
		}
		
		public scrollTo(){

			const y: number = this.el.offsetTop;
			const h: number = this.el.offsetHeight;

			if(!this.container && this.el) this.container = this.el; // On edit this.container is empty so this is a fix to reassign it. Not ideal, but...
			
			if (
				this.container
				&& this.container.parentElement
				&& this.container.parentElement.scrollHeight
			) {
				this.container.parentElement.scrollTop = y + h + this.container.parentElement.scrollHeight;
			}
		}

		private checkForEditMode(){
			if(!this.isRobotResponse && !this.el.hasAttribute("thinking")){
				this.el.classList.add("can-edit");
				this.disabled = false;
			}
		}

		private tryClearThinking(){
			if(this.el.hasAttribute("thinking")){
				this.textEl.innerHTML = "";
				this.el.removeAttribute("thinking");
			}
		}

		private setToThinking(){
			const canShowThinking: boolean = (this.isRobotResponse && this.uiOptions.robot.robotResponseTime !== 0) || (!this.isRobotResponse && this.cfReference.uiOptions.user.showThinking && !this._tag.skipUserInput);
			if(canShowThinking){
				this.textEl.innerHTML = ChatResponse.THINKING_MARKUP;
				this.el.classList.remove("can-edit");
				this.el.setAttribute("thinking", "");
			}

			if(this.cfReference.uiOptions.user.showThinking || this.cfReference.uiOptions.user.showThumb){
				this.addSelf();
			}
		}

		/**
		* @name addSelf
		* add one self to the chat list
		*/
		private addSelf(): void {
			if(this.el.parentNode != this.container){
				this.container.appendChild(this.el);
				this.animateIn();
			}
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

			this.updateThumbnail(this.image);

			if(this.isRobotResponse || this.response != null){
				// Robot is pseudo thinking, can also be user -->
				// , but if addUserChatResponse is called from ConversationalForm, then the value is there, therefore skip ...
				setTimeout(() =>{
					this.setValue(<FlowDTO>{text: this.response})
				}, 0);
				//ConversationalForm.animationsEnabled ? Helpers.lerp(Math.random(), 500, 900) : 0);
			}else{
				if(this.cfReference.uiOptions.user.showThumb){
					this.el.classList.add("peak-thumb");
				}
			}
		}

		public dealloc(){
			clearTimeout(this.readyTimer);
			this.container = null;
			this.uiOptions = null;
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
				<thumb><span></span></thumb>
				<text></text>
			</cf-chat-response>`;
		}
	}
}