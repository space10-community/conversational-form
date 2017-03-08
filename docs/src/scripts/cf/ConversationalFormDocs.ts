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
		constructor(){
			this.el = document.getElementById("conversational-form-docs");
			setTimeout(() => {
				document.getElementById("form").classList.add('show');
			}, 2000);
		}

		public toggleMenuState(){
			const open = this.el.classList.toggle('menu-toggle', !this.el.classList.contains('menu-toggle'));
			
			if(open){
				this.el.classList.remove('cf-toggle');
			}

			return false;
		}

		public toggleConversation(){
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