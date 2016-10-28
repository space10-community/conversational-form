/// <reference path="../BasicElement.ts"/>

// namespace
namespace io.space10 {
	// interface
	export interface IChatResponseOptions extends IBasicElementOptions{
		response: string;
		image: string;
	}

	// class
	export class ChatResponse extends io.space10.BasicElement {
		private response: string;
		private image: string;

		public set visible(value: boolean){
			if(value){
				this.el.classList.add("show");
			}else{
				this.el.classList.remove("show");
			}
		}

		constructor(options: IChatResponseOptions){
			super(options);
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
			}
		}

		protected createElement(options: IChatResponseOptions): Element{
			this.response = options.response;
			this.image = options.image;
			super.createElement(options);

			setTimeout(() => {
				this.visible = this.response && this.response.length > 0;
			}, 0);

			return this.el;
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