// Docs version 1.0.0

interface Window {
	conversationalFormExamples: any;
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

class ConversationalFormExamples{
	private static instance: ConversationalFormExamples
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

				document.getElementById("form").classList.add('show');
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
			setTimeout(() =>{
				this.el.classList.remove('menu-toggle');
				this.el.classList.add('cf-toggle')
			}, 10);
		}else{
			this.el.classList.remove('cf-toggle');
		}

		return false;
	}

	public static start(){
		if(!ConversationalFormExamples.instance)
			window.conversationalFormExamples = new ConversationalFormExamples();
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
	ConversationalFormExamples.start();
}else{
	// await for when document is ready
	window.addEventListener("load", () =>{
		ConversationalFormExamples.start();
	}, false);
}