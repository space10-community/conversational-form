/// <reference path="../ConversationalForm.ts"/>

namespace cf {
	// interface

	export class EventDispatcher implements EventTarget{
		private target: DocumentFragment;
		
		private _cf: ConversationalForm;
		public get cf(): ConversationalForm{
			return this._cf;
		}

		public set cf(value: ConversationalForm){
			this._cf = value;
		}

		constructor(cfRef: ConversationalForm = null) {
			this._cf = cfRef;

			this.target = document.createDocumentFragment();
		}

		public addEventListener(type: string, listener?: EventListenerOrEventListenerObject, useCapture?: boolean): void{
			return this.target.addEventListener(type, listener, useCapture);
		}

		public dispatchEvent(event: Event | CustomEvent): boolean{
			return this.target.dispatchEvent(event);
		}

		public removeEventListener(type: string, listener?: EventListenerOrEventListenerObject, useCapture?: boolean): void{
			this.target.removeEventListener(type, listener, useCapture);
		}
	}
}