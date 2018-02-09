// Docs version 1.0.0

interface Window {
	conversationalFormDocs: any;
}

// declare module cf{
// 	
// }

// interface cf{
// 	ConversationalForm: any;
// }

// export type ConversationalForm = any;
// interface ConversationalForm = any;
// declare var ConversationalForm: any;
class ConversationalForm {}

class ConversationalFormDocs{
	private static instance: ConversationalFormDocs

	private cf: any;
	/**
	* 
	* @type HTMLElement
	*/
	private el: HTMLElement;
	private introTimer: any = 0;
	private h1writer: H1Writer;
	constructor(){
		this.el = <HTMLElement> document.querySelector("main.content");

		const isDevelopment: boolean = document.getElementById("conversational-form-development") !== null;
		if(isDevelopment)
			this.el.classList.add("development");

		this.h1writer = new H1Writer({
			el: document.getElementById("writer")
		})

		const isMenuVisible = window.getComputedStyle(document.getElementById("small-screen-menu")).getPropertyValue("display") != "none";
		if(isMenuVisible)
			this.introFlow1();
		else
			this.introFlow2();
	}

	/**
	* @name introFlow1
	* flow for small screens
	*/
	private introFlow1(): void {
		const isDevelopment: boolean = document.getElementById("conversational-form-development") !== null;

		this.introTimer = setTimeout(() => {
			this.toggleMenuState();
			this.h1writer.start();

			this.introTimer = setTimeout(() => {
				this.toggleConversation()
			}, isDevelopment ? 0 : 2500);
		}, isDevelopment ? 0 : 500);
	}

	/**
	* @name introFlow2
	* flow for larger screens
	*/
	private introFlow2(): void {
		const isDevelopment: boolean = document.getElementById("conversational-form-development") !== null;

		this.h1writer.start();

		this.introTimer = setTimeout(() => {
			document.getElementById("info").classList.add('show');

			this.introTimer = setTimeout(() => {

				document.querySelector("section[role='form']").classList.add('show');
				document.getElementById("cf-toggle-btn").classList.add('show');

				this.introTimer = setTimeout(() => {
					this.toggleConversation()
				}, isDevelopment ? 0 : 1500);
			}, isDevelopment ? 0 : 3000);
		}, isDevelopment ? 0 : 1500);
	}

	public toggleMenuState(){
		const open = this.el.classList.toggle('menu-toggle', !this.el.classList.contains('menu-toggle'));
		
		if(open){
			this.el.classList.remove('cf-toggle');
		}

		return false;
	}

	public toggleConversation(){
		clearTimeout(this.introTimer);

		if(!this.el.classList.contains('cf-toggle')){

			if(!this.cf){
				const formEl: HTMLFormElement = <HTMLFormElement> document.getElementById("cf-form");

				let microphoneInput: any = {};
				var dispatcher: any = new (<any> window).cf.EventDispatcher(),
					synth: any = null,
					recognition: any = null,
					msg: any = null,
					finalTranscript: string = "";

				const isVoiceForm: boolean = window.location.pathname.toLowerCase().indexOf("index-voice") !== -1;
				if(this.canUseMicrophone() && isVoiceForm){
					microphoneInput = {
						init: () => {
							// init is called one time, when the custom input is instantiated.

							// load voices \o/
							synth = window.speechSynthesis;
							msg = new (<any> window).SpeechSynthesisUtterance();
							
							const setVoice = () => {
								if(typeof synth === 'undefined') {
									return;
								}

								var voices = synth.getVoices();
								for (let i = 0; i < voices.length; i++) {
									let element = voices[i];
									if(element.name.toLowerCase() == "alex"){
										msg.voice = element;
										msg.lang = msg.voice.lang; // change language here
									}
								}
							}

							setVoice();
							if (typeof synth !== 'undefined' && synth.onvoiceschanged !== undefined) {
								synth.onvoiceschanged = setVoice;
							}

							// here we want to control the Voice input availability, so we don't end up with speech overlapping voice-input
							msg.onstart = (event: any) => {
								// on message end, so deactivate input
								console.log("voice: deactivate 1")
								this.cf.userInput.deactivate();
							}

							msg.onend = (event: any) => {
								// on message end, so reactivate input
								this.cf.userInput.reactivate();
							}

							// setup events to speak robot response
							dispatcher.addEventListener((<any> window).cf.ChatListEvents.CHATLIST_UPDATED, (event: any) => {
								if(event.detail.currentResponse.isRobotResponse){
									// https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance
									// msg.text = event.detail.currentResponse.response
									msg.text = event.detail.currentResponse.strippedSesponse//<-- no html tags
									synth.speak(msg);
								}
							}, false);

							// do other init stuff, like connect with external APIs ...
						},
						// set awaiting callback, as we will await the speak in this example
						awaitingCallback: true,
						cancelInput: (event: any) => {
							console.log("voice: CANCEL")
							finalTranscript = null;
							if(recognition){
								recognition.onend = null;
								recognition.onerror = null;
								recognition.stop();
							}
						},
						input: (resolve: any, reject: any, mediaStream: any) => {
							console.log("voice: INPUT")
							// input is called when user is interacting with the CF input button (UserVoiceInput)

							// connect to Speech API (ex. Google Cloud Speech), Watson (https://github.com/watson-developer-cloud/speech-javascript-sdk) or use Web Speech API (like below), resolve with the text returned..
							// using Promise pattern -> https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
								// if API fails use reject(result.toString())
								// if API succedes use resolve(result.toString())
							
							if(recognition)
								recognition.stop();

							recognition = new (<any> window).SpeechRecognition(),
								finalTranscript = '';

							recognition.continuous = false; // react only on single input
							recognition.interimResults = false; // we don't care about interim, only final.
							
							// recognition.onstart = function() {}
							recognition.onresult = (event: any) => {
								// var interimTranscript = "";
								for (var i = event.resultIndex; i < event.results.length; ++i) {
									if (event.results[i].isFinal) {
										finalTranscript += event.results[i][0].transcript;
									}
								}
							}

							recognition.onerror = (event: any) => {
								reject(event.error);
							}

							recognition.onend = (event: any) => {
								if(finalTranscript && finalTranscript !== ""){
									resolve(finalTranscript);
								}
							}

							recognition.start();
						}
					}

					// insert yes no if user wants to enroll with Voice
					// 	var fieldset = document.createElement("fieldset");
					// 	fieldset.setAttribute("cf-questions", "Want to try microphone?");

					// 	let checkYes: HTMLInputElement = document.createElement("input");
					// 	checkYes.setAttribute("type", "checkbox");
					// 	checkYes.setAttribute("cf-label", "Yes!");
					// 	fieldset.appendChild(checkYes);

					// 	let checkNo: HTMLInputElement = document.createElement("input");
					// 	checkNo.setAttribute("type", "checkbox");
					// 	checkNo.setAttribute("cf-label", "No");
					// 	fieldset.appendChild(checkNo);
					// 	formEl.insertBefore(fieldset, formEl.children[0]);
					
					// no choice, just do it

					// remove e-mail field because it is impossible to fill out the e-mail with the voice
					const emailInput: HTMLInputElement = <HTMLInputElement> formEl.querySelector("input[type='email']");
					if(emailInput && emailInput.parentNode)
						emailInput.parentNode.removeChild(emailInput);
				}

				const submitForm = (successCallback: () => void = null) => {
					const xhr: XMLHttpRequest = new XMLHttpRequest();
					xhr.addEventListener("load", () =>{
						this.cf.addRobotChatResponse("We received your submission 🙌");
						if(successCallback)
							successCallback();
					});
					xhr.open('POST', document.getElementById("cf-form").getAttribute("action"));
					xhr.setRequestHeader("accept", "application/javascript");
					xhr.setRequestHeader("Content-Type", "application/json");
					xhr.send(JSON.stringify(this.cf.getFormData(true)));
				}

				this.cf = new (<any> window).cf.ConversationalForm({
					formEl: formEl,

					eventDispatcher: dispatcher,
					// add the custom input (microphone)
					microphoneInput: microphoneInput,

					context: document.getElementById("cf-context"),
					robotImage: "data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iMjBweCIgaGVpZ2h0PSIyMHB4IiB2aWV3Qm94PSIwIDAgMjAgMjAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8ZyBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNzY0LjAwMDAwMCwgLTUzMC4wMDAwMDApIiBmaWxsPSIjMjIyMjIyIj4KICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzUzLjAwMDAwMCwgNTE5LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHJlY3QgeD0iMTEiIHk9IjExIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiPjwvcmVjdD4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+",
					userImage: "data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iMjBweCIgaGVpZ2h0PSIxNnB4IiB2aWV3Qm94PSIwIDAgMjAgMTYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8ZyBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTM3MS4wMDAwMDAsIC02MTAuMDAwMDAwKSIgZmlsbD0iI0ZGRkZGRiI+CiAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEyNzQuMDAwMDAwLCA1OTkuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8cG9seWdvbiBwb2ludHM9IjEwNyAxMSAxMTcgMjcgOTcgMjciPjwvcG9seWdvbj4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+",
					submitCallback: () => {
						if(!isVoiceForm){
							submitForm();
						}
					},
					flowStepCallback: (dto: any, success: () => void, error: () => void,) => {
						console.log('flowStepCallback', dto);
						if(dto.tag && dto.tag.name == "repeat-voice"){
							if(dto.tag.value[0] !== "no"){
								location.reload();
							}else{
								this.cf.addRobotChatResponse("No problem. Talk soon");
								this.cf.doSubmitForm();
							}
						}else if(dto.tag && dto.tag.domElement){
							if(dto.tag.domElement.getAttribute("name") == "repeat"){
								location.reload();
							}else if(dto.tag.domElement.getAttribute("name") == "submit-form"){
								submitForm(success);
							}else{
								success()
							}
						}else{
							success()
						}
					}
				});
			}

			this.cf.focus();

			setTimeout(() =>{
				this.el.classList.remove('menu-toggle');
				this.el.classList.add('cf-toggle')
			}, 10);
		}else{
			this.el.classList.remove('cf-toggle');
		}


		return false;
	}

	private canUseMicrophone(): boolean{
		let canUse: boolean = true;
		try{
			(<any> window).SpeechRecognition = (<any> window).SpeechRecognition || (<any> window).webkitSpeechRecognition;
		}catch(e){
			//console.log("Example support range: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition#Browser_compatibility");
			canUse = false;
		}

		try{
			(<any> window).SpeechSynthesisUtterance = (<any> window).webkitSpeechSynthesisUtterance ||
			(<any> window).mozSpeechSynthesisUtterance ||
			(<any> window).msSpeechSynthesisUtterance ||
			(<any> window).oSpeechSynthesisUtterance ||
			(<any> window).SpeechSynthesisUtterance;
		}catch(e){
			//console.log("Example support range: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance#Browser_compatibility")
			canUse = false;
		}

		return canUse;
	}

	public static start(){
		if(!ConversationalFormDocs.instance)
			window.conversationalFormDocs = new ConversationalFormDocs();
	}
}

class H1Writer{
	private progress: number = 0;
	private progressTarget: number = 0;
	private str: string = "";
	private strs: Array<string> = ["...", "TBD"];

	/**
	* 
	* @type HTMLElement
	*/
	private el: HTMLElement;
	private rAF: number;
	private step: number = 0;
	constructor(options: any){
		this.el = options.el
		this.strs[1] = this.el.innerHTML;
		this.el.innerHTML = "";
		this.el.classList.add("show");
	}

	public start(){
		this.progress = 0;
		this.progressTarget = 1;
		this.str = this.strs[this.step];
		this.render()
	}

	private nextStep(){
		if(this.progressTarget == 0){
			this.step++;
		}

		this.str = this.strs[this.step];
		this.progressTarget = this.progressTarget == 0 ? 1 : 0;
		this.render()
	}

	private render(){
		this.progress += (this.progressTarget - this.progress) * (this.step == 0 ? 0.15 : 0.09);
		const out: string = this.str.substr(0, Math.round(this.progress * this.str.length));

		this.el.innerHTML = out;

		if(Math.abs(this.progress - this.progressTarget) <= 0.01){
			cancelAnimationFrame(this.rAF);
			if(this.step < 1){
				setTimeout(() => {
					this.nextStep();
				}, 500);
			}
		}
		else
			this.rAF = window.requestAnimationFrame(() => this.render());
	}
}

if(document.readyState == "complete"){
	// if document alread instantiated, usually this happens if Conversational Form is injected through JS
	ConversationalFormDocs.start();
}else{
	// await for when document is ready
	window.addEventListener("load", () =>{
		ConversationalFormDocs.start();
	}, false);
}








// var dispatcher = new cf.EventDispatcher(),
// 	synth = null,
// 	recognition = null,
// 	msg = null,
// 	SpeechSynthesisUtterance = null,
// 	SpeechRecognition = null;

// // here we use https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
// // you can use what ever API you want, ex.: Google Cloud Speech API -> https://cloud.google.com/speech/

// // here we create our input
// if(SpeechSynthesisUtterance && SpeechRecognition){

// var conversationalForm = window.cf.ConversationalForm.startTheConversation({
// 	formEl: document.getElementById("form"),
// 	context: document.getElementById("cf-context"),
// 	eventDispatcher: dispatcher,

// 	// add the custom input (microphone)
// 	microphoneInput: microphoneInput,

// 	submitCallback: function(){
// 		// remove Conversational Form
// 		console.log("voice: Form submitted...", conversationalForm.getFormData(true));
// 		alert("You made it! Check console for data")
// 	}
// });

// if(!SpeechRecognition){
// 	conversationalForm.addRobotChatResponse("SpeechRecognition not supported, so <strong>no</strong> Microphone here.");
// }

// if(!SpeechSynthesisUtterance){
// 	conversationalForm.addRobotChatResponse("SpeechSynthesisUtterance not supported, so <strong>no</strong> Microphone here.");
// }