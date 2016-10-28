/// <reference path="ui/UserInput.ts"/>
/// <reference path="ui/chat/ChatList.ts"/>
/// <reference path="logic/FlowManager.ts"/>
/// <reference path="form-tags/Tag.ts"/>
/// <reference path="form-tags/TagGroup.ts"/>
/// <reference path="form-tags/InputTag.ts"/>
/// <reference path="form-tags/SelectTag.ts"/>
/// <reference path="form-tags/ButtonTag.ts"/>
/// <reference path="data/Dictionary.ts"/>

interface Window { space10CUI: any; }

namespace io.space10 {

	// CUI options
	export interface Space10CUIOptions{
		tags?: Array<ITag>,
		formEl: HTMLFormElement,
		context?: HTMLElement,
		dictionaryData?: Object,
		dictionaryAI?: Object,
		userImage?: string,
		submitCallback?: () => void | HTMLButtonElement,
	}

	export class Space10CUI{
		public dictionary: io.space10.Dictionary;

		private context: HTMLElement;
		private formEl: HTMLFormElement;
		private submitCallback: () => void | HTMLButtonElement;
		private tags: Array<ITag | ITagGroup>;
		private flowManager: FlowManager;

		private cuiInput:UserInput;
		private chatList:ChatList;

		constructor(options: Space10CUIOptions){
			console.log("Space10 Conversational User Interface.");

			this.submitCallback = options.submitCallback;
			this.formEl = options.formEl;
			if(options.dictionaryData || options.dictionaryAI){
				this.dictionary = new io.space10.Dictionary({
					data: options.dictionaryData,
					aiQuestions: options.dictionaryAI,
					userImage: options.userImage,
				});
			}else{
				this.dictionary = new io.space10.Dictionary({
					userImage: options.userImage,
				});
			}
			this.context = options.context ? options.context : document.body;
			this.tags = options.tags;

			setTimeout(() => this.init(), 0);
		}

		public init(): io.space10.Space10CUI{
			const configTag: any = document.getElementById("s10-cui");

			if(configTag.getAttribute("development") != undefined){
				console.log("in development...");
			}else{
				console.log("NOT in development...");
				// inject production css...
				const head: HTMLHeadElement = document.head || document.getElementsByTagName("head")[0];
				const style: HTMLStyleElement = document.createElement("style");
				const cdnUrl: string = "http://CDN/GITHUB URL.../";
				style.type = "text/css";
				style.media = "all";
				style.setAttribute("rel", "stylesheet");
				style.setAttribute("href", cdnUrl + "space10-cui-dist.min.css");
				head.appendChild(style);
			}

			// set context position to relative, else we break out of the box
			if(this.context.style.position != "fixed" && this.context.style.position != "absolute" && this.context.style.position != "relative"){
				this.context.style.position = "relative";
			}















			// if tags are not defined then we will try and build some tags our selves..
			if(!this.tags || this.tags.length == 0){
				this.tags = [];

				let fields: Array<HTMLInputElement | HTMLSelectElement | HTMLButtonElement> = [].slice.call(this.formEl.querySelectorAll("input, select, button"), 0);

				for (var i = 0; i < fields.length; i++) {
					const element = fields[i];
					if(Tag.isTagValid(element)){
						// ignore hidden tags
						if(element.tagName.toLowerCase() == "input"){
							this.tags.push(Tag.createTag({
								domElement: element
								// validationCallback
								// questions: Array<String>
							}));
							
						}else if(element.tagName.toLowerCase() == "select"){
							this.tags.push(Tag.createTag({
								domElement: element
								// validationCallback
								// questions: Array<String>
							}));
						}else if(element.tagName.toLowerCase() == "button"){
							this.tags.push(Tag.createTag({
								domElement: element
								// validationCallback
								// questions: Array<String>
							}));
						}
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
					if(groups[group].length > 1){
						// only if more elements with same name..
						const tagGroup: io.space10.TagGroup = new io.space10.TagGroup({
							elements: groups[group]
							// el: element
							// validationCallback
							// questions: Array<String>
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
			console.log('Space10CUI start > these are the mapped DOM tags:', this.tags);
			console.log('----------------------------------------------');

			// start the flow
			this.flowManager = new FlowManager({
				cuiReference: this,
				tags: this.tags,
			});

			var s10context: HTMLElement = document.createElement("div");
			s10context.id = "s10-cui-element";
			s10context.className = "s10-cui";
			this.context.appendChild(s10context);

			this.chatList = new ChatList({});
			s10context.appendChild(this.chatList.el);

			// CUI UI
			this.cuiInput = new UserInput({});
			s10context.appendChild(this.cuiInput.el);

			// var b = new Button({});
			// s10context.appendChild(b.el);
			setTimeout(() =>{
				s10context.classList.add("s10-cui--show")
				this.flowManager.start();
			}, 0);
		}

		public remove(){
			console.log(this, 'remove() Space10 CUI');
		}
	}
}
