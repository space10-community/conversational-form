/// <reference path="../logic/FlowManager.ts"/>

// namespace
namespace cf {
	// interface
	
	// class
	export class ProgressBar {
		private flowUpdateCallback: () => void;
		public el: HTMLElement;
		private bar: HTMLElement;
		private eventTarget: EventDispatcher;

		constructor(options: IBasicElementOptions){
			this.flowUpdateCallback = this.onFlowUpdate.bind(this);
			this.eventTarget = options.eventTarget;
			this.eventTarget.addEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);
			this.eventTarget.addEventListener(FlowEvents.FORM_SUBMIT, () => this.setWidth(100), false);

			this.el = document.createElement("div");
			this.el.className = "cf-progressBar";

			this.bar = document.createElement("div");
			this.bar.className = 'bar';
			this.el.appendChild(this.bar);

			setTimeout(() => this.init(), 800);
		}

		private init () {
			this.el.classList.add('show');
		}

		private onFlowUpdate(event: CustomEvent){
			this.setWidth(event.detail.step / event.detail.maxSteps * 100);
		}

		private setWidth (percentage: number) {
			this.bar.style.width = `${percentage}%`;
		}

		public dealloc(){
			this.eventTarget.removeEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);
			this.flowUpdateCallback = null;
		}
	}
}

