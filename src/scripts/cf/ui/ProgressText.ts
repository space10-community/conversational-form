/// <reference path="BasicElement.ts"/>
/// <reference path="control-elements/ControlElements.ts"/>
/// <reference path="../logic/FlowManager.ts"/>

// namespace
namespace cf {
	// interface

	// class
	export class ProgressText extends BasicElement {
		private flowUpdateCallback: () => void;
		private inputInvalidCallback: () => void;
		private count: number = 0;
		private currentType: string = "";
		private errorTimer = 0;

		constructor(options: IBasicElementOptions){
			super(options);

			// flow update
			this.flowUpdateCallback = this.onFlowUpdate.bind(this);
			document.addEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);

			this.inputInvalidCallback = this.onInputInvalid.bind(this);
			document.addEventListener(FlowEvents.USER_INPUT_INVALID, this.inputInvalidCallback, false);
		}

		private onInputInvalid(event: CustomEvent){
			ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);
			let str: string = Dictionary.get("progress-"+this.currentType+"-error");

			this.setText(true);

			clearTimeout(this.errorTimer);
			this.errorTimer = setTimeout(() => {
				this.setText();
			}, UserInput.ERROR_TIME);
		}

		private onFlowUpdate(event: CustomEvent){
			ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);
			this.count++;

			clearTimeout(this.errorTimer);
			const tag: ITag | ITagGroup = <ITag | ITagGroup> event.detail;
			
			this.currentType = tag.type == "group" ? (<ITagGroup> tag).getGroupTagType() : tag.type;
				
			this.setText();
		}
		
		private setText(error: boolean = false){
			if(error)
				this.el.setAttribute("error", "error");
			else
				this.el.removeAttribute("error");

			const str: string = Dictionary.get("progress-"+this.currentType+(error ? "-error" : ""));
			let countStr: string = this.count.toString();
			countStr = countStr.length == 1 ? "0"+countStr : countStr;
			this.el.innerHTML = countStr + " / " + str;
		}

		public remove(){
			document.removeEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);
			this.flowUpdateCallback = null;

			document.removeEventListener(FlowEvents.USER_INPUT_INVALID, this.inputInvalidCallback, false);
			this.inputInvalidCallback = null;

			super.remove();
		}
		
		public getTemplate () : string {
			return `<cf-progress-text>
				
			</cf-progress-text>`;
		}
	}
}