/// <reference path="../form-tags/Tag.ts"/>
/// <reference path="../Space10CUI.ts"/>

namespace io.space10 {
	// interface
	export interface FlowManagerOptions{
		cuiReference: Space10CUI;
		tags: Array<ITag>;
	}

	// class
	export class FlowManager {
		private static STEP_TIME: number = 1000;

		private cuiReference: Space10CUI;
		private tags: Array<ITag>;

		private maxSteps: number = 0;
		private step: number = 0;
		private stepTimer: number = 0;

		constructor(options: FlowManagerOptions){
			this.cuiReference = options.cuiReference;
			this.tags = options.tags;

			this.maxSteps = this.tags.length;

			console.log(this, 'FlowManager', this.tags);

			this.validateStepAndUpdate();
		}

		private nextStep(){
			this.step++;
			this.validateStepAndUpdate();
		}

		private previousStep(){
			this.step--;
			this.validateStepAndUpdate();
		}

		private validateStepAndUpdate(){
			this.step %= this.maxSteps;

			this.showStep();
		}

		private showStep(){
			console.log('showStep:', this.tags[this.step]);
		}
	}
}