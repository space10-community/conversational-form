/// <reference path="ui/UserInput.ts"/>
/// <reference path="ui/chat/ChatList.ts"/>
/// <reference path="logic/FlowManager.ts"/>
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
		scrollAccerlation?: number;
		flowStepCallback?: (dto: FlowDTO, success: () => void, error: () => void) => void, // a optional one catch all method, will be set on each Tag.ts
	}

	export class ConversationalForm{
		public static animationsEnabled: boolean = true;

		public dictionary: Dictionary;

		private el: HTMLElement;
		private context: HTMLElement;
		private formEl: HTMLFormElement;
		private submitCallback: () => void | HTMLButtonElement;
		private tags: Array<ITag | ITagGroup>;
		private flowManager: FlowManager;

		private chatList: ChatList;
		private userInput: UserInput;
		private isDevelopment: boolean = false;
		private loadExternalStyleSheet: boolean = true;
		private preventAutoAppend: boolean = false;

		constructor(options: ConversationalFormOptions){
			if(!window.ConversationalForm)
				window.ConversationalForm = this;

			// set a general step validation callback
			if(options.flowStepCallback)
				FlowManager.generalFlowStepCallback = options.flowStepCallback;
			
			if(document.getElementById("conversational-form-development") || options.loadExternalStyleSheet == false){
				this.loadExternalStyleSheet = false;
			}

			if(!isNaN(options.scrollAccerlation))
				ScrollController.accerlation = options.scrollAccerlation;

			if(options.preventAutoAppend == true)
				this.preventAutoAppend = true;

			if(!options.formEl)
				throw new Error("Conversational Form error, the formEl needs to be defined.");

			this.formEl = options.formEl;
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
			Helpers.setEmojiLib();

			this.context = options.context ? options.context : document.body;
			this.tags = options.tags;

			this.init();
		}

		public init(): ConversationalForm{
			if(this.loadExternalStyleSheet){
				// not in development/examples, so inject production css
				const head: HTMLHeadElement = document.head || document.getElementsByTagName("head")[0];
				const style: HTMLStyleElement = document.createElement("link");
				const githubMasterUrl: string = "https://cdn.rawgit.com/space10-community/conversational-form/master/dist/conversational-form.min.css";
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

			//let's start the conversation
			this.setupTagGroups();
			this.setupUI();

			return this;
		}

		public addRobotChatResponse(response: string){
			this.chatList.createResponse(true, null, response);
		}

		public stop(optionalStoppingMessage: string = ""){
			this.flowManager.stop();
			if(optionalStoppingMessage != "")
				this.chatList.createResponse(true, null, optionalStoppingMessage);
			
			this.userInput.disabled = true;
			this.userInput.visible = false;
		}

		public start(){
			this.flowManager.start();
			
			this.userInput.disabled = false;
			this.userInput.visible = true;
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
				cuiReference: this,
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

			// Conversational Form UI
			this.chatList = new ChatList({});
			this.el.appendChild(this.chatList.el);

			this.userInput = new UserInput({});
			this.el.appendChild(this.userInput.el);

			setTimeout(() => {
				this.el.classList.add("conversational-form--show")
				this.flowManager.start();
			}, 0);

			// s10context.addEventListener('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
			// 	e.preventDefault();
			// 	e.stopPropagation();
			// 	console.log(e);
			// })
		}

		public remapTagsAndStartFrom(index: number = 0){
			// possibility to start the form flow over from {index}
			for(var i = 0; i < this.tags.length; i++){
				const tag: ITag | ITagGroup = this.tags[i];
				tag.refresh();
			}

			this.flowManager.startFrom(index);
		}

		public doSubmitForm(){
			this.el.classList.add("done");

			if(this.submitCallback){
				// remove should be called in the submitCallback
				this.submitCallback();
			}else{
				this.formEl.submit();
				this.remove();
			}
		}

		public remove(){
			this.flowManager.dealloc();
			this.userInput.dealloc();
			this.chatList.dealloc();

			this.dictionary = null;
			this.flowManager = null;
			this.userInput = null;
			this.chatList = null;
			this.el.parentNode.removeChild(this.el);
			this.el = null;
			this.context = null;
			this.formEl = null;
			this.submitCallback = null;
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
	}
}


// check for a form element with attribute:

window.addEventListener("load", () =>{
	const formEl: HTMLFormElement = <HTMLFormElement> document.querySelector("form[cf-form]") || <HTMLFormElement> document.querySelector("form[cf-form-element]");
	const contextEl: HTMLFormElement = <HTMLFormElement> document.querySelector("*[cf-context]");

	if(formEl && !window.ConversationalForm){
		window.ConversationalForm = new cf.ConversationalForm({
			formEl: formEl,
			context: contextEl
		});
	}
}, false);