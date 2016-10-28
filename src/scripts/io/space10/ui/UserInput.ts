/// <reference path="BasicElement.ts"/>
/// <reference path="control-elements/Button.ts"/>
/// <reference path="control-elements/RadioButton.ts"/>
/// <reference path="../logic/FlowManager.ts"/>

// namespace
namespace io.space10 {
	// interface
	// export interface IUserInputOptions extends IBasicElementOptions{

	// }

	export const UserInputEvents = {
		SUBMIT: "cui-input-user-input-submit",
		KEY_CHANGE: "cui-input-key-change",
	}

	// class
	export class UserInput extends io.space10.BasicElement {
		public el: Element;

		private inputElement: HTMLInputElement;
		private flowUpdateCallback: () => void;
		private inputInvalidCallback: () => void;
		private errorTimer: number = 0;
		private controlElements: Array<IBasicElement>;
		private controlElementsElement: Element;

		constructor(options: IBasicElementOptions){
			super(options);

			this.el.setAttribute("placeholder", Dictionary.get("input-placeholder"));
			this.el.addEventListener("keyup", this.onKeyUp.bind(this), false);

			this.inputElement = this.el.getElementsByTagName("input")[0];
			this.controlElementsElement = this.el.getElementsByTagName("s10cui-input-control-elements")[0];

			// flow update
			this.flowUpdateCallback = this.onFlowUpdate.bind(this);
			document.addEventListener(io.space10.FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);

			this.inputInvalidCallback = this.inputInvalid.bind(this);
			document.addEventListener(io.space10.FlowEvents.USER_INPUT_INVALID, this.inputInvalidCallback, false);
		}

		public getValue():string{
			return this.inputElement.value;
		}

		private inputInvalid(event: CustomEvent){
			this.inputElement.setAttribute("error", "");
			this.inputElement.setAttribute("disabled", "disabled");
			this.inputElement.setAttribute("placeholder", Dictionary.get("input-placeholder-error"));
			clearTimeout(this.errorTimer);

			this.errorTimer = setTimeout(() => {
				this.inputElement.removeAttribute("disabled");
				this.inputElement.removeAttribute("error");
				this.inputElement.setAttribute("placeholder", Dictionary.get("input-placeholder"));
				this.inputElement.focus();
			}, 2000);
		}

		private onFlowUpdate(event: CustomEvent){
			clearTimeout(this.errorTimer);
			this.inputElement.removeAttribute("error");
			this.inputElement.removeAttribute("disabled");
			this.inputElement.setAttribute("placeholder", Dictionary.get("input-placeholder"));
			this.resetValue();
			this.inputElement.focus();

			const currentTag: io.space10.ITag | io.space10.ITagGroup = <io.space10.ITag | io.space10.ITagGroup> event.detail;
			// TODO: Show UI according to what kind of tag it is..
			if(currentTag.type == "group"){
				console.log('UserInput > currentTag is a group of types:', (<io.space10.ITagGroup> currentTag).elements[0].type);
				this.buildControlElements((<io.space10.ITagGroup> currentTag).elements);
			}else{
				console.log('UserInput > currentTag type:', currentTag.type);
				this.buildControlElements([currentTag]);
			}
		}

		private buildControlElements(tags: Array<io.space10.ITag>){
			//TODO: Remove old elements..
			if(this.controlElements){
				while(this.controlElements.length > 0)
					this.controlElementsElement.removeChild(this.controlElements.pop().el);
			}

			this.controlElements = [];

			for (var i = 0; i < tags.length; i++) {
				var tag: io.space10.ITag = tags[i];
				
				console.log(this, 'tag.type:', tag.type);
				switch(tag.type){
					case "radio" :
						this.controlElements.push(new RadioButton({}));
						break;
					case "checkbox" :
						// TODO: add checkbox tag..
						break;
					case "select" :
						// TODO: add select sub tag..
						break;
					case "texts" :
						// nothing to add.
						break;
				}

				if(tag.type != "text")
					this.controlElementsElement.appendChild(this.controlElements[this.controlElements.length - 1].el);
			}
		}

		private onKeyUp(event: KeyboardEvent){
			if(event.keyCode == 13){
				// enter
				this.inputElement.setAttribute("disabled", "disabled");

				// TODO: validate input ..
				document.dispatchEvent(new CustomEvent(io.space10.UserInputEvents.SUBMIT, {
					detail: this.getValue()
				}));
			}else{
				document.dispatchEvent(new CustomEvent(io.space10.UserInputEvents.KEY_CHANGE, {
					detail: this.getValue()
				}));
			}
		}

		private resetValue(){
			this.inputElement.value = "";
		}

		// override
		public getTemplate () : string {
			return `<s10cui-input>
				<s10cui-input-control-elements></s10cui-input-control-elements>
				<input type='input'>
			</s10cui-input>
			`;
		}
	}
}