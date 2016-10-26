/// <reference path="Button.ts"/>
/// <reference path="../Space10CUI.ts"/>
/// <reference path="../logic/FlowManager.ts"/>


// namespace
namespace io.space10 {
	// interface

	// class
	export class ChatInterface extends io.space10.BasicElement {
		private flowUpdateCallback: () => void;

		constructor(options: IBasicElementOptions){
			super(options);

			this.flowUpdateCallback = this.onFlowUpdate.bind(this);
			document.addEventListener(io.space10.FlowEvents.UPDATE, this.flowUpdateCallback, false);
		}

		private onFlowUpdate(event: Event){
			console.log(this, 'onFlowUpdate, currentTag:', this.flowManager.currentTag);

			let str: string;
			str = "<u>CUI Chat</u>";
			str += "</br>tag type: " + this.flowManager.currentTag.type;
			if(this.flowManager.currentTag.title)
				str += "</br>tag title: " + this.flowManager.currentTag.title;
			else if(this.flowManager.currentTag.name)
				str += "</br>tag name: " + this.flowManager.currentTag.name;


			if(this.flowManager.currentTag.type == "group"){
				const group: io.space10.ITagGroup = <io.space10.ITagGroup> this.flowManager.currentTag;
				for (var i = 0; i < group.elements.length; i++) {
					var element: ITag = group.elements[i];
					str += "</br>- group tag type: " + element.type;
				}
			}else{
				// single tag..
			}

			this.el.innerHTML = str;
		}

		public getTemplate () : string {
			return `<div class='s10cui-chat' type='pluto'>
						Chat
					</div>`;
		}

		public remove(){
			document.removeEventListener(io.space10.FlowEvents.UPDATE, this.flowUpdateCallback, false);
			this.flowUpdateCallback = null;
			super.remove();
		}
	}
}

