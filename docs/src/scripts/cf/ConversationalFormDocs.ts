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
	constructor(){
		this.el = document.getElementById("conversational-form-docs");

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
		this.introTimer = setTimeout(() => {
			this.toggleMenuState();

			this.introTimer = setTimeout(() => {
				this.toggleConversation()
			}, 2500);
		}, 500);
	}

	/**
	* @name introFlow2
	* flow for larger screens
	*/
	private introFlow2(): void {
		this.introTimer = setTimeout(() => {
			document.getElementById("info").classList.add('show');

			this.introTimer = setTimeout(() => {
				document.getElementById("form").classList.add('show');
				document.getElementById("cf-toggle-btn").classList.add('show');

				this.introTimer = setTimeout(() => {
					this.toggleConversation()
				}, 1500);
			}, 1500);
		}, 500);
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

		const open = this.el.classList.toggle('cf-toggle', !this.el.classList.contains('cf-toggle'));

		if(open){
			this.el.classList.remove('menu-toggle');

			if(!this.cf){
				this.cf = new (<any> window).cf.ConversationalForm({
					formEl: document.getElementById("cf-form"),
					context: document.getElementById("cf-context"),
					robotImage: "data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iMjBweCIgaGVpZ2h0PSIyMHB4IiB2aWV3Qm94PSIwIDAgMjAgMjAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8ZyBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNzY0LjAwMDAwMCwgLTUzMC4wMDAwMDApIiBmaWxsPSIjMjIyMjIyIj4KICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzUzLjAwMDAwMCwgNTE5LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHJlY3QgeD0iMTEiIHk9IjExIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiPjwvcmVjdD4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+",
					userImage: "data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iMjBweCIgaGVpZ2h0PSIxNnB4IiB2aWV3Qm94PSIwIDAgMjAgMTYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8ZyBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTM3MS4wMDAwMDAsIC02MTAuMDAwMDAwKSIgZmlsbD0iI0ZGRkZGRiI+CiAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEyNzQuMDAwMDAwLCA1OTkuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8cG9seWdvbiBwb2ludHM9IjEwNyAxMSAxMTcgMjcgOTcgMjciPjwvcG9seWdvbj4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+"
				});
			}
		}

		return false;
	}

	public static start(){
		if(!ConversationalFormDocs.instance)
			window.conversationalFormDocs = new ConversationalFormDocs();
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