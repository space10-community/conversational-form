/// <reference path="../BasicElement.ts"/>
/// <reference path="../../logic/Helpers.ts"/>
/// <reference path="../../ConversationalForm.ts"/>

// namespace
namespace cf {
	// interface
	export interface IChatResponseOptions{
		response: string;
		image: string;
		isAIReponse: boolean;
	}

	export const ChatResponseEvents = {
		AI_QUESTION_ASKED: "cf-on-ai-asked-question"
	}

	// class
	export class ChatResponse extends BasicElement {
		private response: string;
		private image: string;
		private isAIReponse: boolean;

		public set visible(value: boolean){
			if(value){
				this.el.classList.add("show");
			}else{
				this.el.classList.remove("show");
			}
		}

		public setValue(value: string){
			this.response = value;
			const text: Element = this.el.getElementsByTagName("text")[0];
			text.innerHTML = value;

			if(!this.response || this.response.length == 0){
				text.setAttribute("thinking", "");
			}else{
				text.setAttribute("value-added", "");
				text.removeAttribute("thinking");

				if(!this.visible){
					this.visible = true;
				}

				if(this.isAIReponse){
					// AI Reponse ready to ask question.

					ConversationalForm.illustrateFlow(this, "dispatch", ChatResponseEvents.AI_QUESTION_ASKED, value);
					document.dispatchEvent(new CustomEvent(ChatResponseEvents.AI_QUESTION_ASKED, {
						detail: this
					}));
				}
			}

		}

		protected setData(options: IChatResponseOptions):void{
			this.image = options.image;
			this.response = "";
			this.isAIReponse = options.isAIReponse;
			super.setData(options);

			setTimeout(() => {
				this.visible = this.isAIReponse || (this.response && this.response.length > 0);
				this.setValue("");

				if(this.isAIReponse){
					// AI is pseudo thinking
					setTimeout(() => this.setValue(options.response), Helpers.lerp(Math.random(), 500, 900));
				}else{
					// show the 3 dots automatically
					// setTimeout(() => this.visible = true, 1100);
				}
			}, 0);
		}

		// template, can be overwritten ...
		public getTemplate () : string {
			return `<cf-chat-response>
				<thumb style="background-image: url(` + this.image + `)"></thumb>
				<text ` + (!this.response || this.response.length == 0 ? "thinking" : "") + `>` + (!this.response ? "" : this.response) + `</text>
			</cf-chat-response>`;
		}
	}
}