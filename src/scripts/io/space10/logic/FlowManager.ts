/// <reference path="../form-tags/Tag.ts"/>
/// <reference path="../Space10CUI.ts"/>

namespace io.space10 {
	// interface
	export interface FlowManagerOptions{
		cuiReference: Space10CUI;
		tags: Array<ITag>;
	}

	export const FlowEvents = {
		UPDATE: "cui-flow-update"
	}

	// class
	export class FlowManager {
		private static STEP_TIME: number = 1000;

		private cuiReference: Space10CUI;
		private tags: Array<ITag>;

		private maxSteps: number = 0;
		private step: number = 0;
		private stepTimer: number = 0;

		public get currentTag(): io.space10.ITag | io.space10.ITagGroup {
			return this.tags[this.step];
		}

		constructor(options: FlowManagerOptions){
			this.cuiReference = options.cuiReference;
			this.tags = options.tags;

			this.maxSteps = this.tags.length;
		}

		public start(){
			this.validateStepAndUpdate();
		}

		public nextStep(){
			this.step++;
			this.validateStepAndUpdate();
		}

		public previousStep(){
			this.step--;
			this.validateStepAndUpdate();
		}

		private validateStepAndUpdate(){
			this.step %= this.maxSteps;

			this.showStep();
		}

		private showStep(){
			document.dispatchEvent(new Event(io.space10.FlowEvents.UPDATE));
		}
	}
}