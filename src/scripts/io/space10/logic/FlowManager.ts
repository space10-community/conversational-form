/// <reference path="../form-tags/Tag.ts"/>
/// <reference path="../Space10CUI.ts"/>

namespace io.space10 {
	// interface
	export interface FlowManagerOptions{
		cuiReference: Space10CUI;
		tags: Array<ITag>;
	}

	export const FlowEvents = {
		USER_INPUT_UPDATE: "cui-flow-user-input-update",
		USER_INPUT_INVALID: "cui-flow-user-input-invalid",
		//	detail: string
		FLOW_UPDATE: "cui-flow-update",
		//	detail: ITag | ITagGroup
	}

	// class
	export class FlowManager {
		private static STEP_TIME: number = 1000;

		private cuiReference: Space10CUI;
		private tags: Array<ITag>;

		private maxSteps: number = 0;
		private step: number = 0;
		private stepTimer: number = 0;
		private userInputSubmitCallback: () => void;

		public get currentTag(): ITag | ITagGroup {
			return this.tags[this.step];
		}

		constructor(options: FlowManagerOptions){
			this.cuiReference = options.cuiReference;
			this.tags = options.tags;

			this.maxSteps = this.tags.length;

			this.userInputSubmitCallback = this.userInputSubmit.bind(this);
			document.addEventListener(UserInputEvents.SUBMIT, this.userInputSubmitCallback, false);
		}

		public userInputSubmit(event: CustomEvent){
			Space10CUI.illustrateFlow(this, "receive", event.type, event.detail);

			if(this.currentTag.setTagValueAndIsValid(<string | ITag> event.detail)){
				Space10CUI.illustrateFlow(this, "dispatch", FlowEvents.USER_INPUT_UPDATE, event.detail)

				document.dispatchEvent(new CustomEvent(FlowEvents.USER_INPUT_UPDATE, {
					detail: event.detail //UserInput value
				}));

				// goto next step when user has answered
				setTimeout(() => this.nextStep(), 1000);
			}else{
				Space10CUI.illustrateFlow(this, "dispatch", FlowEvents.USER_INPUT_INVALID, event.detail)

				// Value not valid
				document.dispatchEvent(new CustomEvent(FlowEvents.USER_INPUT_INVALID, {
					detail: event.detail //UserInput value
				}));
			}
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

		public addStep(){
			// this can be used for when a Tags value is updated and new tags are presented,
			// TODO: fix this
		}

		public remove(){
			document.removeEventListener(UserInputEvents.SUBMIT, this.userInputSubmitCallback, false);
			this.userInputSubmitCallback = null;
		}

		private validateStepAndUpdate(){
			if(this.step == this.maxSteps - 1){
				console.warn("We are at the end..., submit click")
			}else{
				this.step %= this.maxSteps;
				this.showStep();
			}
		}

		private showStep(){
			Space10CUI.illustrateFlow(this, "dispatch", FlowEvents.FLOW_UPDATE, this.currentTag)

			document.dispatchEvent(new CustomEvent(FlowEvents.FLOW_UPDATE, {
				detail: this.currentTag
			}));
		}
	}
}