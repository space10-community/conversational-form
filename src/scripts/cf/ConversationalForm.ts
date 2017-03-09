// version 0.9.0

/// <reference path="ui/UserInput.ts"/>
/// <reference path="ui/chat/ChatList.ts"/>
/// <reference path="logic/FlowManager.ts"/>
/// <reference path="logic/EventDispatcher.ts"/>
/// <reference path="form-tags/Tag.ts"/>
/// <reference path="form-tags/TagGroup.ts"/>
/// <reference path="form-tags/InputTag.ts"/>
/// <reference path="form-tags/SelectTag.ts"/>
/// <reference path="form-tags/ButtonTag.ts"/>
/// <reference path="data/Dictionary.ts"/>

interface Window { ConversationalForm: any; }

namespace cf {

	// CUI options
	export interface ConversationalFormOptions{
		tags?: Array<ITag>,
		formEl: HTMLFormElement,
		context?: HTMLElement,
		dictionaryData?: Object,
		dictionaryRobot?: Object,
		userImage?: string,
		robotImage?: string,
		submitCallback?: () => void | HTMLButtonElement,
		loadExternalStyleSheet?: boolean;
		preventAutoAppend?: boolean;
		preventAutoStart?: boolean;
		scrollAccerlation?: number;
		flowStepCallback?: (dto: FlowDTO, success: () => void, error: () => void) => void, // a optional one catch all method, will be calles on each Tag.ts if set.
	}

	export class ConversationalForm{
		public version: string = "0.9.1";
		private cdnPath: string = "//conversational-form-091-0iznjsw.stackpathdns.com/";

		public static animationsEnabled: boolean = true;

		/**
		 * createId
		 * Id of the instance, to isolate events
		 */
		private _createId: string
		public get createId(): string{
			if(!this._createId){
				this._createId = new Date().getTime().toString();
			}

			return this._createId;
		}

		// instance specific event target
		private _eventTarget: EventDispatcher;
		public get eventTarget(): EventDispatcher{
			if(!this._eventTarget){
				this._eventTarget = new EventDispatcher(this);
			}
			return this._eventTarget;
		}

		public dictionary: Dictionary;
		public el: HTMLElement;

		private context: HTMLElement;
		private formEl: HTMLFormElement;
		private submitCallback: () => void | HTMLButtonElement;
		private onUserAnswerClickedCallback: () => void;
		private tags: Array<ITag | ITagGroup>;
		private flowManager: FlowManager;

		private chatList: ChatList;
		private userInput: UserInput;
		private isDevelopment: boolean = false;
		private loadExternalStyleSheet: boolean = true;
		private preventAutoAppend: boolean = false;
		private preventAutoStart: boolean = false;

		constructor(options: ConversationalFormOptions){
			window.ConversationalForm = this;

			console.log('Conversational Form > version:', this.version);

			window.ConversationalForm[this.createId] = this;

			// set a general step validation callback
			if(options.flowStepCallback)
				FlowManager.generalFlowStepCallback = options.flowStepCallback;
			
			if(document.getElementById("conversational-form-development") || options.loadExternalStyleSheet == false){
				this.loadExternalStyleSheet = false;
			}

			if(!isNaN(options.scrollAccerlation))
				ScrollController.accerlation = options.scrollAccerlation;
			
			this.preventAutoStart = options.preventAutoStart;
			this.preventAutoAppend = options.preventAutoAppend;

			if(!options.formEl)
				throw new Error("Conversational Form error, the formEl needs to be defined.");

			this.formEl = options.formEl;
			this.formEl.setAttribute("cf-create-id", this.createId);

			this.submitCallback = options.submitCallback;

			if(this.formEl.getAttribute("cf-no-animation") == "")
				ConversationalForm.animationsEnabled = false;

			if(this.formEl.getAttribute("cf-prevent-autofocus") == "")
				UserInput.preventAutoFocus = true;

			this.dictionary = new Dictionary({
				data: options.dictionaryData,
				robotData: options.dictionaryRobot,
				userImage: options.userImage,
				robotImage: options.robotImage,
			});

			// emoji.. fork and set your own values..

			this.context = options.context ? options.context : document.body;
			this.tags = options.tags;

			this.init();
		}

		public init(): ConversationalForm{
			Helpers.setEmojiLib();

			if(this.loadExternalStyleSheet){
				// not in development/examples, so inject production css
				const head: HTMLHeadElement = document.head || document.getElementsByTagName("head")[0];
				const style: HTMLStyleElement = document.createElement("link");
				const githubMasterUrl: string = this.cdnPath + "conversational-form.min.css";
				style.type = "text/css";
				style.media = "all";
				style.setAttribute("rel", "stylesheet");
				style.setAttribute("href", githubMasterUrl);
				head.appendChild(style);

			}else{
				// expect styles to be in the document
				this.isDevelopment = true;
			}

			// set context position to relative, else we break out of the box
			const position: string = window.getComputedStyle(this.context).getPropertyValue("position").toLowerCase();
			if(["fixed", "absolute", "relative"].indexOf(position) == -1){
				this.context.style.position = "relative";
			}















			// if tags are not defined then we will try and build some tags our selves..
			if(!this.tags || this.tags.length == 0){
				this.tags = [];

				let fields: Array<HTMLInputElement | HTMLSelectElement | HTMLButtonElement> = [].slice.call(this.formEl.querySelectorAll("input, select, button, textarea"), 0);

				for (var i = 0; i < fields.length; i++) {
					const element = fields[i];
					if(Tag.isTagValid(element)){
						// ignore hidden tags
						this.tags.push(Tag.createTag(element));
					}
				}
			}else{
				// tags are manually setup and passed as options.tags.
			}

			// remove invalid tags if they've sneaked in.. this could happen if tags are setup manually as we don't encurage to use static Tag.isTagValid
			const indexesToRemove: Array<ITag> = [];
			for(var i = 0; i < this.tags.length; i++){
				const element = this.tags[i];
				if(!element || !Tag.isTagValid(element.domElement)){
					indexesToRemove.push(element);
				}
			}

			for (var i = 0; i < indexesToRemove.length; i++) {
				var tag: ITag = indexesToRemove[i];
				this.tags.splice(this.tags.indexOf(tag), 1);
			}

			if(!this.tags || this.tags.length == 0){
				console.warn("Conversational Form: No tags found or registered.");
			}

			//let's start the conversation
			this.setupTagGroups();
			this.setupUI();

			return this;
		}

		/**
		* @name updateDictionaryValue
		* set a dictionary value at "runtime"
		*	id: string, id of the value to update
		*	type: string, "human" || "robot"
		*	value: string, value to be inserted
		*/
		public updateDictionaryValue(id:string, type: string, value: string){
			Dictionary.set(id, type, value);

			if(["robot-image", "user-image"].indexOf(id) != -1){
				this.chatList.updateThumbnail(id == "robot-image", value);
			}
		}

		public getFormData(serialized: boolean = false): FormData | any{
			if(serialized){
				const serialized: any = {}
				for(var i = 0; i < this.tags.length; i++){
					const element = this.tags[i];
					if(element.name && element.value)
						serialized[element.name] = element.value
				}

				return serialized
			}else{
				var formData: FormData = new FormData(this.formEl);
				return formData;
			}
		}

		public addRobotChatResponse(response: string){
			this.chatList.createResponse(true, null, response);
		}

		public addUserChatResponse(response: string){
			// add a "fake" user response..
			this.chatList.createResponse(false, null, response);
		}

		public stop(optionalStoppingMessage: string = ""){
			this.flowManager.stop();
			if(optionalStoppingMessage != "")
				this.chatList.createResponse(true, null, optionalStoppingMessage);
			
			this.userInput.onFlowStopped();
		}

		public start(){
			this.userInput.disabled = false;
			this.userInput.visible = true;

			this.flowManager.start();
		}

		public getTag(nameOrIndex: string | number): ITag{
			if(typeof nameOrIndex == "number"){
				return this.tags[nameOrIndex];
			}else{
				// TODO: fix so you can get a tag by its name attribute
				return null;
			}
		}

		private setupTagGroups(){
			// make groups, from input tag[type=radio | type=checkbox]
			// groups are used to bind logic like radio-button or checkbox dependencies
			var groups: any = [];
			for(var i = 0; i < this.tags.length; i++){
				const tag = this.tags[i];
				if(tag.type == "radio" || tag.type == "checkbox"){
					if(!groups[tag.name])
						groups[tag.name] = [];
					
					console.log((<any>this.constructor).name, 'tag.name]:', tag.name);
					groups[tag.name].push(tag);
				}
			}

			if(Object.keys(groups).length > 0){
				for (let group in groups){
					if(groups[group].length > 0){
						// always build groupd when radio or checkbox
						const tagGroup: TagGroup = new TagGroup({
							elements: groups[group]
						});

						// remove the tags as they are now apart of a group
						for(var i = 0; i < groups[group].length; i++){
							let tagToBeRemoved: InputTag = groups[group][i];
							if(i == 0)// add the group at same index as the the first tag to be removed
								this.tags.splice(this.tags.indexOf(tagToBeRemoved), 1, tagGroup);
							else
								this.tags.splice(this.tags.indexOf(tagToBeRemoved), 1);
						}
					}
				}
			}
		}

		private setupUI(){
			console.log('Conversational Form > start > mapped DOM tags:', this.tags);
			console.log('----------------------------------------------');

			// start the flow
			this.flowManager = new FlowManager({
				cfReference: this,
				eventTarget: this.eventTarget,
				tags: this.tags
			});

			this.el = document.createElement("div");
			this.el.id = "conversational-form";
			this.el.className = "conversational-form";

			if(ConversationalForm.animationsEnabled)
				this.el.classList.add("conversational-form--enable-animation");

			// add conversational form to context
			if(!this.preventAutoAppend)
				this.context.appendChild(this.el);
			
			//hide until stylesheet is rendered
			this.el.style.visibility = "hidden";

			var innerWrap = document.createElement("div");
			innerWrap.className = "conversational-form-inner";
			this.el.appendChild(innerWrap);

			// Conversational Form UI
			this.chatList = new ChatList({
				eventTarget: this.eventTarget
			});
			innerWrap.appendChild(this.chatList.el);

			this.userInput = new UserInput({
				eventTarget: this.eventTarget,
				cfReference: this
			});

			innerWrap.appendChild(this.userInput.el);

			this.onUserAnswerClickedCallback = this.onUserAnswerClicked.bind(this);
			this.eventTarget.addEventListener(ChatResponseEvents.USER_ANSWER_CLICKED, this.onUserAnswerClickedCallback, false);

			this.el.classList.add("conversational-form--show")
			
			if(!this.preventAutoStart)
				this.flowManager.start();

			if(!this.tags || this.tags.length == 0){
				// no tags, so just so the input
				this.userInput.visible = true;
			}
		}

		/**
		* @name onUserAnswerClicked
		* on user ChatReponse clicked
		*/
		private onUserAnswerClicked(event: CustomEvent): void {
			const tag: ITag | ITagGroup = event.detail;
			this.flowManager.editTag(tag);
		}

		/**
		* @name remapTagsAndStartFrom
		* index: number, what index to start from
		* setCurrentTagValue: boolean, usually this method is called when wanting to loop or skip over questions, therefore it might be usefull to set the valie of the current tag before changing index.
		*/
		public remapTagsAndStartFrom(index: number = 0, setCurrentTagValue: boolean = false){
			if(setCurrentTagValue){
				this.chatList.setCurrentUserResponse(this.userInput.getFlowDTO());
			}
			// possibility to start the form flow over from {index}
			for(var i = 0; i < this.tags.length; i++){
				const tag: ITag | ITagGroup = this.tags[i];
				tag.refresh();
			}

			this.flowManager.startFrom(index);
		}

		/**
		* @name focus
		* Sets focus on Conversational Form
		*/
		public focus(){
			if(this.userInput)
				this.userInput.setFocusOnInput();
		}

		public doSubmitForm(){
			this.el.classList.add("done");

			this.userInput.reset();

			if(this.submitCallback){
				// remove should be called in the submitCallback
				this.submitCallback();
			}else{
				// this.formEl.submit();
				// doing classic .submit wont trigger onsubmit if that is present on form element
				// as described here: http://wayback.archive.org/web/20090323062817/http://blogs.vertigosoftware.com/snyholm/archive/2006/09/27/3788.aspx
				// so we mimic a click.
				var button: HTMLButtonElement = this.formEl.ownerDocument.createElement('input');
				button.style.display = 'none';
				button.type = 'submit';
				this.formEl.appendChild(button);
				button.click();
				this.formEl.removeChild(button);

				// remove conversational
				this.remove();
			}
		}

		public remove(){
			if(this.onUserAnswerClickedCallback){
				this.eventTarget.removeEventListener(ChatResponseEvents.USER_ANSWER_CLICKED, this.onUserAnswerClickedCallback, false);
				this.onUserAnswerClickedCallback = null;
			}

			if(this.flowManager)
				this.flowManager.dealloc();
			if(this.userInput)
				this.userInput.dealloc();
			if(this.chatList)
				this.chatList.dealloc();

			this.dictionary = null;
			this.flowManager = null;
			this.userInput = null;
			this.chatList = null;
			this.context = null;
			this.formEl = null;
			this.tags = null;

			this.submitCallback = null;
			this.el.parentNode.removeChild(this.el);
			this.el = null;

			window.ConversationalForm[this.createId] = null;
		}

		// to illustrate the event flow of the app
		public static ILLUSTRATE_APP_FLOW: boolean = true;
		public static illustrateFlow(classRef: any, type: string, eventType: string, detail: any = null){
			// ConversationalForm.illustrateFlow(this, "dispatch", FlowEvents.USER_INPUT_INVALID, event.detail);
			// ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);

			if(ConversationalForm.ILLUSTRATE_APP_FLOW && navigator.appName != 'Netscape'){
				const highlight: string = "font-weight: 900; background: pink; color: black; padding: 0px 5px;";
				console.log("%c** event flow: %c" + eventType + "%c flow type: %c" + type + "%c from: %c"+(<any> classRef.constructor).name, "font-weight: 900;",highlight, "font-weight: 400;", highlight, "font-weight: 400;", highlight);
				if(detail)
					console.log("** event flow detail:", detail);
			}
		}

		private static hasAutoInstantiated: boolean = false;
		public static autoStartTheConversation() {
			if(ConversationalForm.hasAutoInstantiated)
				return;

			// auto start the conversation
			const formElements: NodeListOf<Element> = document.querySelectorAll("form[cf-form]") || document.querySelectorAll("form[cf-form-element]");
			const formContexts: NodeListOf<Element> = document.querySelectorAll("*[cf-context]");

			if(formElements && formElements.length > 0){
				for (let i = 0; i < formElements.length; i++) {
					let form: HTMLFormElement = <HTMLFormElement>formElements[i];
					let context: HTMLFormElement = <HTMLFormElement>formContexts[i];
					new cf.ConversationalForm({
						formEl: form,
						context: context
					});
				}

				ConversationalForm.hasAutoInstantiated = true;
			}
		}
	}

}

if(document.readyState == "complete"){
	// if document alread instantiated, usually this happens if Conversational Form is injected through JS
	cf.ConversationalForm.autoStartTheConversation();
}else{
	// await for when document is ready
	window.addEventListener("load", () =>{
		cf.ConversationalForm.autoStartTheConversation();
	}, false);
}