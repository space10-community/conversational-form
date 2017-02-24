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
		cfReference: ConversationalForm;
		eventTarget: EventDispatcher;
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
		public static generalFlowStepCallback: (dto: FlowDTO, success: () => void, error: (optionalErrorMessage?: string) => void) => void;

		private eventTarget: EventDispatcher;

		private cfReference: ConversationalForm;
		private tags: Array<ITag>;

		private stopped: boolean = false;
		private maxSteps: number = 0;
		private step: number = 0;
		private savedStep: number = -1;
		private stepTimer: number = 0;
		private userInputSubmitCallback: () => void;

		public get currentTag(): ITag | ITagGroup {
			return this.tags[this.step];
		}

		constructor(options: FlowManagerOptions){
			this.cfReference = options.cfReference;
			this.eventTarget = options.eventTarget;
			this.tags = options.tags;

			this.maxSteps = this.tags.length;

			this.userInputSubmitCallback = this.userInputSubmit.bind(this);
			this.eventTarget.addEventListener(UserInputEvents.SUBMIT, this.userInputSubmitCallback, false);
		}

		public userInputSubmit(event: CustomEvent){
			ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);

			let appDTO: FlowDTO = event.detail;
			let isTagValid: Boolean = this.currentTag.setTagValueAndIsValid(appDTO);
			let hasCheckedForTagSpecificValidation: boolean = false;
			let hasCheckedForGlobalFlowValidation: boolean = false;

			const onValidationCallback = () =>{
				// check 1
				if(this.currentTag.validationCallback && typeof this.currentTag.validationCallback == "function"){
					if(!hasCheckedForTagSpecificValidation && isTagValid){
						hasCheckedForTagSpecificValidation = true;
						this.currentTag.validationCallback(appDTO, () => {
							isTagValid = true;
							onValidationCallback();
						}, (optionalErrorMessage?: string) => {
							isTagValid = false;
							if(optionalErrorMessage)
								appDTO.errorText = optionalErrorMessage;
							onValidationCallback();
						});

						return;
					}
				}

				// check 2, this.currentTag.required <- required should be handled in the callback.
				if(FlowManager.generalFlowStepCallback && typeof FlowManager.generalFlowStepCallback == "function"){
					if(!hasCheckedForGlobalFlowValidation && isTagValid){
						hasCheckedForGlobalFlowValidation = true;
						// use global validationCallback method
						FlowManager.generalFlowStepCallback(appDTO, () => {
							isTagValid = true;
							onValidationCallback();
						}, (optionalErrorMessage?: string) => {
							isTagValid = false;
							if(optionalErrorMessage)
								appDTO.errorText = optionalErrorMessage;
							onValidationCallback();
						});

						return;
					}
				}

				// go on with the flow
				if(isTagValid){
					// do the normal flow..
					ConversationalForm.illustrateFlow(this, "dispatch", FlowEvents.USER_INPUT_UPDATE, appDTO)

					// update to latest DTO because values can be changed in validation flow...
					appDTO = appDTO.input.getFlowDTO();

					this.eventTarget.dispatchEvent(new CustomEvent(FlowEvents.USER_INPUT_UPDATE, {
						detail: appDTO //UserInput value
					}));

					// goto next step when user has answered
					setTimeout(() => this.nextStep(), ConversationalForm.animationsEnabled ? 250 : 0);
				}else{
					ConversationalForm.illustrateFlow(this, "dispatch", FlowEvents.USER_INPUT_INVALID, appDTO)

					// Value not valid
					this.eventTarget.dispatchEvent(new CustomEvent(FlowEvents.USER_INPUT_INVALID, {
						detail: appDTO //UserInput value
					}));
				}
			}

			// TODO, make into promises when IE is rolling with it..
			onValidationCallback();
		}

		public startFrom(indexOrTag: number | ITag){
			if(typeof indexOrTag == "number")
				this.step = indexOrTag;
			else{
				// find the index..
				this.step = this.tags.indexOf(indexOrTag);
			}

			this.validateStepAndUpdate();
		}

		public start(){
			this.stopped = false;
			this.validateStepAndUpdate();
		}

		public stop(){
			this.stopped = true;
		}

		public nextStep(){
			if(this.savedStep != -1)
				this.step = this.savedStep;
			
			this.savedStep = -1;//reset saved step

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
			this.eventTarget.removeEventListener(UserInputEvents.SUBMIT, this.userInputSubmitCallback, false);
			this.userInputSubmitCallback = null;
		}

		/**
		* @name editTag
		* go back in time and edit a tag.
		*/
		public editTag(tag: ITag): void {
			this.savedStep = this.step - 1;
			this.step = this.tags.indexOf(tag); // === this.currentTag
			this.validateStepAndUpdate();
		}

		private skipStep(){
			this.nextStep();
		}

		private validateStepAndUpdate(){
			if(this.maxSteps > 0){
				if(this.step == this.maxSteps){
					// console.warn("We are at the end..., submit click")
					this.cfReference.doSubmitForm();
				}else{
					this.step %= this.maxSteps;
					if(this.currentTag.disabled){
						// check if current tag has become or is disabled, if it is, then skip step.
						this.skipStep();
					}else{
						this.showStep();
					}
				}
			}
		}

		private showStep(){
			if(this.stopped)
				return;

			ConversationalForm.illustrateFlow(this, "dispatch", FlowEvents.FLOW_UPDATE, this.currentTag);

			this.currentTag.refresh();

			this.eventTarget.dispatchEvent(new CustomEvent(FlowEvents.FLOW_UPDATE, {
				detail: this.currentTag
			}));
		}
	}
}