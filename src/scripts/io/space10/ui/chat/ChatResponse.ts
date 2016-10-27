/// <reference path="../../Space10CUI.ts"/>

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

		constructor(options: IChatResponseOptions){
			super(options);
		}

		protected createElement(options: IChatResponseOptions): Element{
			this.response = options.response;
			this.image = options.image;
			return super.createElement(options);
		}

		// template, can be overwritten ...
		public getTemplate () : string {
			return `<s10cui-chat-response>
				<thumb style="background-image: url(`+this.image+`)"></thumb>
				<text>`+this.response+`</text>
			</s10cui-chat-response>`;
		}
	}
}