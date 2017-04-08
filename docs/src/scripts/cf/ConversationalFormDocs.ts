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

			if(!this.cf){
				this.cf = new (<any> window).cf.ConversationalForm({
					formEl: document.getElementById("cf-form"),
					context: document.getElementById("cf-context"),
					robotImage: "data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iMjBweCIgaGVpZ2h0PSIyMHB4IiB2aWV3Qm94PSIwIDAgMjAgMjAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8ZyBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNzY0LjAwMDAwMCwgLTUzMC4wMDAwMDApIiBmaWxsPSIjMjIyMjIyIj4KICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzUzLjAwMDAwMCwgNTE5LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHJlY3QgeD0iMTEiIHk9IjExIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiPjwvcmVjdD4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+",
					userImage: "data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iMjBweCIgaGVpZ2h0PSIxNnB4IiB2aWV3Qm94PSIwIDAgMjAgMTYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8ZyBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTM3MS4wMDAwMDAsIC02MTAuMDAwMDAwKSIgZmlsbD0iI0ZGRkZGRiI+CiAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEyNzQuMDAwMDAwLCA1OTkuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8cG9seWdvbiBwb2ludHM9IjEwNyAxMSAxMTcgMjcgOTcgMjciPjwvcG9seWdvbj4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+",
					submitCallback: () => {
						
					},
					flowStepCallback: (dto: any, success: () => void, error: () => void,) => {
						if(dto.tag.domElement){
							if(dto.tag.domElement.getAttribute("name") == "repeat"){
								location.reload();
							}else if(dto.tag.domElement.getAttribute("name") == "submit-form"){
								const xhr: XMLHttpRequest = new XMLHttpRequest();
								xhr.addEventListener("load", () =>{
									this.cf.addRobotChatResponse("We received your submission 🙌");
									success();
								});
								xhr.open('POST', document.getElementById("cf-form").getAttribute("action"));
								xhr.setRequestHeader("accept", "application/javascript");
								xhr.setRequestHeader("Content-Type", "application/json");
								xhr.send(JSON.stringify(this.cf.getFormData(true)));
							}else{
								success()
							}
						}else{
							success()
						}
					}
				});
			}

			if(this.cf.focus)
				this.cf.focus()

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