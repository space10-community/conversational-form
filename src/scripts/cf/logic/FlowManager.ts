/// <reference path="../form-tags/Tag.ts"/>
/// <reference path="../ConversationalForm.ts"/>

namespace cf {
	// interface

	export interface FlowDTO{
		text?: string;
		errorText?: string;
		input?: UserInput,
		controlElements?: Array <IControlElement>;
	}

	export interface FlowManagerOptions{
		cuiReference: ConversationalForm;
		tags: Array<ITag>;
	}

	export const FlowEvents = {
		USER_INPUT_UPDATE: "cf-flow-user-input-update",
		USER_INPUT_INVALID: "cf-flow-user-input-invalid",
		//	detail: string
		FLOW_UPDATE: "cf-flow-update",
		//	detail: ITag | ITagGroup
	}

	// class
	export class FlowManager {
		private static STEP_TIME: number = 1000;

		private cuiReference: ConversationalForm;
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
			ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);

			var appDTO: FlowDTO = event.detail;

			if(this.currentTag.setTagValueAndIsValid(appDTO)){
				ConversationalForm.illustrateFlow(this, "dispatch", FlowEvents.USER_INPUT_UPDATE, appDTO)

				// update to latest DTO because values can be changed in validation flow...
				appDTO = appDTO.input.getFlowDTO();

				document.dispatchEvent(new CustomEvent(FlowEvents.USER_INPUT_UPDATE, {
					detail: appDTO //UserInput value
				}));

				// goto next step when user has answered
				setTimeout(() => this.nextStep(), 250);
			}else{
				ConversationalForm.illustrateFlow(this, "dispatch", FlowEvents.USER_INPUT_INVALID, appDTO)

				// Value not valid
				document.dispatchEvent(new CustomEvent(FlowEvents.USER_INPUT_INVALID, {
					detail: appDTO //UserInput value
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
			// this can be used for when a Tags value is updated and new tags are presented
			// like dynamic tag insertion depending on an answer.. V2..
		}

		public dealloc(){
			document.removeEventListener(UserInputEvents.SUBMIT, this.userInputSubmitCallback, false);
			this.userInputSubmitCallback = null;
		}

		private validateStepAndUpdate(){
			if(this.step == this.maxSteps){
				// console.warn("We are at the end..., submit click")
				this.cuiReference.doSubmitForm();
			}else{
				this.step %= this.maxSteps;
				this.showStep();
			}
		}

		private showStep(){
			ConversationalForm.illustrateFlow(this, "dispatch", FlowEvents.FLOW_UPDATE, this.currentTag)

			document.dispatchEvent(new CustomEvent(FlowEvents.FLOW_UPDATE, {
				detail: this.currentTag
			}));
		}
	}
}