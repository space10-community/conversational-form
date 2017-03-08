// Docs version 1.0.0

interface Window { conversationalFormDocs: any; }

namespace cf {

	export class ConversationalFormDocs{
		private static instance: ConversationalFormDocs
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
			}

			return false;
		}

		public static start(){
			if(!ConversationalFormDocs.instance)
				window.conversationalFormDocs = new ConversationalFormDocs();
		}
	}
}

if(document.readyState == "complete"){
	// if document alread instantiated, usually this happens if Conversational Form is injected through JS
	cf.ConversationalFormDocs.start();
}else{
	// await for when document is ready
	window.addEventListener("load", () =>{
		cf.ConversationalFormDocs.start();
	}, false);
}