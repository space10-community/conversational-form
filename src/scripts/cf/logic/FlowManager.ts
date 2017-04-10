/// <reference path="../form-tags/Tag.ts"/>
/// <reference path="../ConversationalForm.ts"/>

namespace cf {
	// interface

	export interface FlowDTO{
		tag?: ITag | ITagGroup,
		text?: string;
		errorText?: string;
		input?: UserInput,
		controlElements?: Array <IControlElement>;
	}

	export interface FlowManagerOptions{
		cfReference: ConversationalForm;
		eventTarget: EventDispatcher;
		tags: Array<ITag>;
		flowStepCallback?: (dto: FlowDTO, success: () => void, error: (optionalErrorMessage?: string) => void) => void;
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

		private flowStepCallback: (dto: FlowDTO, success: () => void, error: (optionalErrorMessage?: string) => void) => void;
		private eventTarget: EventDispatcher;

		private cfReference: ConversationalForm;
		private tags: Array<ITag | ITagGroup>;

		private stopped: boolean = false;
		private maxSteps: number = 0;
		private step: number = 0;
		private savedStep: number = -1;
		private stepTimer: number = 0;
		/**
		* ignoreExistingTags
		* @type boolean
		* ignore existing tags, usually this is set to true when using startFrom, where you don't want it to check for exisintg tags in the list
		*/
		private ignoreExistingTags: boolean = false;
		private userInputSubmitCallback: () => void;

		public get currentTag(): ITag | ITagGroup {
			return this.tags[this.step];
		}

		constructor(options: FlowManagerOptions){
			this.cfReference = options.cfReference;
			this.eventTarget = options.eventTarget;
			this.flowStepCallback = options.flowStepCallback;

			this.setTags(options.tags);

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
				if(this.flowStepCallback && typeof this.flowStepCallback == "function"){
					if(!hasCheckedForGlobalFlowValidation && isTagValid){
						hasCheckedForGlobalFlowValidation = true;
						// use global validationCallback method
						this.flowStepCallback(appDTO, () => {
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

		public startFrom(indexOrTag: number | ITag, ignoreExistingTags: boolean = false){
			if(typeof indexOrTag == "number")
				this.step = indexOrTag;
			else{
				// find the index..
				this.step = this.tags.indexOf(indexOrTag);
			}

			this.ignoreExistingTags = ignoreExistingTags;
			if(!this.ignoreExistingTags){
				this.editTag(this.tags[this.step]);
			}else{
				//validate step, and ask for skipping of current step
				this.showStep();
			}
		}

		public start(){
			this.stopped = false;
			this.validateStepAndUpdate();
		}

		public stop(){
			this.stopped = true;
		}

		public nextStep(){
			if(this.stopped)
				return;

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

		public getStep(): number{
			return this.step;
		}

		public addTags(tags: Array<ITag | ITagGroup>, atIndex: number = -1) : Array<ITag | ITagGroup>{
			// used to append new tag
			if(atIndex !== -1 && atIndex < this.tags.length){
				const pre: Array<ITag | ITagGroup> = this.tags.slice(0, atIndex)
				const post: Array<ITag | ITagGroup> = this.tags.slice(atIndex, this.tags.length)
				this.tags = this.tags.slice(0, atIndex).concat(tags).concat(post);
			}else{
				this.tags.concat(tags);
			}

			this.setTags(this.tags);

			return this.tags;
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
			this.ignoreExistingTags = false;
			this.savedStep = this.step - 1;
			this.step = this.tags.indexOf(tag); // === this.currentTag
			this.validateStepAndUpdate();
		}

		private setTags(tags: Array<ITag | ITagGroup>){
			this.tags = tags;

			for(var i = 0; i < this.tags.length; i++){
				const tag: ITag | ITagGroup = this.tags[i];
				tag.eventTarget = this.eventTarget;
			}
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
				detail: {
					tag: this.currentTag,
					ignoreExistingTag: this.ignoreExistingTags
				}
			}));
		}
	}
}