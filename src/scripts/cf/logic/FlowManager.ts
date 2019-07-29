/// <reference path="../form-tags/Tag.ts"/>
/// <reference path="../ConversationalForm.ts"/>

namespace cf {
	// interface

	export interface FlowDTO{
		tag?: ITag | ITagGroup,
		text?: string;
		errorText?: string;
		input?: UserInputElement,
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
		FORM_SUBMIT: "cf-form-submit",
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

			this.userInputSubmitCallback = this.userInputSubmit.bind(this);
			this.eventTarget.addEventListener(UserInputEvents.SUBMIT, this.userInputSubmitCallback, false);
		}

		public userInputSubmit(event: CustomEvent){
			ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);

			let appDTO: FlowDTO = event.detail;
			if(!appDTO.tag)
				appDTO.tag = this.currentTag;

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
					if(appDTO.input)
						appDTO = appDTO.input.getFlowDTO();

					this.eventTarget.dispatchEvent(new CustomEvent(FlowEvents.USER_INPUT_UPDATE, {
						detail: appDTO //UserTextInput value
					}));

					// goto next step when user has answered
					setTimeout(() => this.nextStep(), ConversationalForm.animationsEnabled ? 250 : 0);
				}else{
					ConversationalForm.illustrateFlow(this, "dispatch", FlowEvents.USER_INPUT_INVALID, appDTO)

					// Value not valid
					this.eventTarget.dispatchEvent(new CustomEvent(FlowEvents.USER_INPUT_INVALID, {
						detail: appDTO //UserTextInput value
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

		/**
		* @name editTag
		* @param tagWithConditions, the tag containing conditions (can contain multiple)
		* @param tagConditions, the conditions of the tag to be checked
		*/

		private activeConditions: any;
		public areConditionsInFlowFullfilled(tagWithConditions: ITag, tagConditions: Array<ConditionalValue> ): boolean{
			if(!this.activeConditions){
				// we don't use this (yet), it's only to keep track of active conditions
				this.activeConditions = [];
			}

			let numConditionsFound: number = 0;
			// find out if tagWithConditions fullfills conditions
			for(var i = 0; i < this.tags.length; i++){
				const tag: ITag | ITagGroup = this.tags[i];
				if(tag !== tagWithConditions){
					// check if tags are fullfilled
					for (var j = 0; j < tagConditions.length; j++) {
						let tagCondition: ConditionalValue = tagConditions[j];
						// only check tags where tag id or name is defined
						const tagName: string = (tag.name || tag.id || "").toLowerCase();
						if(tagName !== "" && "cf-conditional-"+tagName === tagCondition.key.toLowerCase()){
							// key found, so check condition
							const flowTagValue: string | string[] = typeof tag.value === "string" ? <string> (<ITag> tag).value : <string[]>(<ITagGroup> tag).value;
							let areConditionsMeet: boolean = Tag.testConditions(flowTagValue, tagCondition);
							if(areConditionsMeet){
								this.activeConditions[tagName] = tagConditions;
								// conditions are meet
								if(++numConditionsFound == tagConditions.length){
									return true;
								}
							}
						}
					}
				}
			}

			return false;
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

			if(this.savedStep != -1){
				// if you are looking for where the none EDIT tag conditionsl check is done
				// then look at a tags disabled getter

				let foundConditionsToCurrentTag: boolean = false;
				// this happens when editing a tag..

				// check if any tags has a conditional check for this.currentTag.name
				for (var i = 0; i < this.tags.length; i++) {
					var tag: ITag | ITagGroup = this.tags[i];
					if(tag !== this.currentTag && tag.hasConditions()){
						// tag has conditions so check if it also has the right conditions
						if(tag.hasConditionsFor(this.currentTag.name)){
							foundConditionsToCurrentTag = true;
							this.step = this.tags.indexOf(this.currentTag);
							break;
						}
					}
				}

				// no conditional linking found, so resume flow
				if(!foundConditionsToCurrentTag){
					this.step = this.savedStep;
				}
			}

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
				this.tags = this.tags.concat(tags);
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
			this.savedStep = this.step - 1;//save step
			this.step = this.tags.indexOf(tag); // === this.currentTag
			this.validateStepAndUpdate();

			if(this.activeConditions && Object.keys(this.activeConditions).length > 0){
				this.savedStep = -1;//don't save step, as we wont return

				// clear chatlist.
				this.cfReference.chatList.clearFrom(this.step + 1);

				//reset from active tag, brute force
				const editTagIndex: number = this.tags.indexOf(tag);
				for(var i = editTagIndex + 1; i < this.tags.length; i++){
					const tag: ITag | ITagGroup = this.tags[i];
					tag.reset();
				}
			}
		}

		private setTags(tags: Array<ITag | ITagGroup>){
			this.tags = tags;

			for(var i = 0; i < this.tags.length; i++){
				const tag: ITag | ITagGroup = this.tags[i];
				tag.eventTarget = this.eventTarget;
				tag.flowManager = this;
			}

			this.maxSteps = this.tags.length;
		}

		private skipStep(){
			this.nextStep();
		}

		private validateStepAndUpdate(){
			if(this.maxSteps > 0){
				if(this.step == this.maxSteps){
					// console.warn("We are at the end..., submit click")
					this.eventTarget.dispatchEvent(new CustomEvent(FlowEvents.FORM_SUBMIT, {}));
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

			setTimeout(() => {
				this.eventTarget.dispatchEvent(new CustomEvent(FlowEvents.FLOW_UPDATE, {
					detail: {
						tag: this.currentTag,
						ignoreExistingTag: this.ignoreExistingTags,
						step: this.step,
						maxSteps: this.maxSteps
					}
				}));
			}, 0);
		}
	}
}