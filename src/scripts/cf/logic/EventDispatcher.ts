namespace cf {
	// interface

	export class EventDispatcher implements EventTarget{
		private target: DocumentFragment;
		constructor() {
			this.target = document.createDocumentFragment();
		}

		public addEventListener(type: string, listener?: EventListenerOrEventListenerObject, useCapture?: boolean): void{
			console.log("addEventListener:", type, listener, useCapture);
			return this.target.addEventListener(type, listener, useCapture);
		}

		public dispatchEvent(event: Event | CustomEvent): boolean{
			console.log("dispatchEvent:", event);
			return this.target.dispatchEvent(event);
		}

		public removeEventListener(type: string, listener?: EventListenerOrEventListenerObject, useCapture?: boolean): void{
			console.log("removeEventListener:", type, listener, useCapture);
			this.target.removeEventListener(type, listener, useCapture);
		}
	}
}