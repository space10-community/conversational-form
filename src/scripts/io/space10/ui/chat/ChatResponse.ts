/// <reference path="../BasicElement.ts"/>
/// <reference path="../../logic/Helpers.ts"/>

// namespace
namespace io.space10 {
	// interface
	export interface IChatResponseOptions{
		response: string;
		image: string;
		isAIReponse: boolean;
	}

	// class
	export class ChatResponse extends io.space10.BasicElement {
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
			}
		}

		protected setData(options: IChatResponseOptions){
			this.image = options.image;
			this.response = "";
			this.isAIReponse = options.isAIReponse;
			super.setData(options);

			setTimeout(() => {
				this.visible = this.isAIReponse || (this.response && this.response.length > 0);
				this.setValue("");

				if(this.isAIReponse){
					// ...
					setTimeout(() => this.setValue(options.response), io.space10.Helpers.lerp(Math.random(), 250, 600));
				}
			}, 0);
		}

		// template, can be overwritten ...
		public getTemplate () : string {
			return `<s10cui-chat-response>
				<thumb style="background-image: url(` + this.image + `)"></thumb>
				<text ` + (!this.response || this.response.length == 0 ? "thinking" : "") + `>` + (!this.response ? "" : this.response) + `</text>
			</s10cui-chat-response>`;
		}
	}
}