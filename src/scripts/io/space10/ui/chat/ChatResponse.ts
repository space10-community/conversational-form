/// <reference path="../../Space10CUI.ts"/>

// namespace
namespace io.space10 {
	// interface
	export interface IChatResponseOptions extends IBasicElementOptions{
		response: string;
	}

	// class
	export class ChatResponse extends io.space10.BasicElement {
		private response: string;

		constructor(options: IChatResponseOptions){
			super(options);
		}

		protected createElement(options: IChatResponseOptions): Element{
			this.response = options.response;
			return super.createElement(options);
		}

		// template, can be overwritten ...
		public getTemplate () : string {
			return `<s10cui-chat-response>
				<thumb>{{image}}</thumb>
				<text>`+this.response+`</text>
			</s10cui-chat-response>`;
		}
	}
}