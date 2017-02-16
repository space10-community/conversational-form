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
		public static generalFlowStepCallback: (dto: FlowDTO, success: () => void, error: (optionalErrorMessage?: string) => void) => void;

		private cuiReference: ConversationalForm;
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
			this.cuiReference = options.cuiReference;
			this.tags = options.tags;

			this.maxSteps = this.tags.length;

			this.userInputSubmitCallback = this.userInputSubmit.bind(this);
			document.addEventListener(UserInputEvents.SUBMIT, this.userInputSubmitCallback, false);
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
					ConversationalForm.illustrateFlow(this, "dispatch", FlowEvents.USER_INPUT_UPDATE, appDTO)

					// update to latest DTO because values can be changed in validation flow...
					appDTO = appDTO.input.getFlowDTO();

					document.dispatchEvent(new CustomEvent(FlowEvents.USER_INPUT_UPDATE, {
						detail: appDTO //UserInput value
					}));

					// goto next step when user has answered
					setTimeout(() => this.nextStep(), ConversationalForm.animationsEnabled ? 250 : 0);
				}else{
					ConversationalForm.illustrateFlow(this, "dispatch", FlowEvents.USER_INPUT_INVALID, appDTO)

					// Value not valid
					document.dispatchEvent(new CustomEvent(FlowEvents.USER_INPUT_INVALID, {
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
			document.removeEventListener(UserInputEvents.SUBMIT, this.userInputSubmitCallback, false);
			this.userInputSubmitCallback = null;
		}

		/**
		* @name editTag
		* go back in time and edit a tag.
		*/
		public editTag(tag: ITag): void {
			this.savedStep = this.step - 1;
			this.startFrom(tag);
		}

		private skipStep(){
			this.nextStep();
		}

		private validateStepAndUpdate(){
			if(this.maxSteps > 0){
				if(this.step == this.maxSteps){
					// console.warn("We are at the end..., submit click")
					this.cuiReference.doSubmitForm();
				}else{
					this.step %= this.maxSteps;
					this.showStep();
				}
			}
		}

		private showStep(){
			if(this.stopped)
				return;

			ConversationalForm.illustrateFlow(this, "dispatch", FlowEvents.FLOW_UPDATE, this.currentTag);

			if(this.currentTag.disabled){
				// check if current tag has become or is disabled, if it is, then skip step.
				this.skipStep();
			}else{
				// 
				document.dispatchEvent(new CustomEvent(FlowEvents.FLOW_UPDATE, {
					detail: this.currentTag
				}));
			}

		}
	}
}