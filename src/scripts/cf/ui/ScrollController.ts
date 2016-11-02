/// <reference path="../logic/Helpers.ts"/>

// namespace
namespace cf {
	export interface IScrollControllerOptions{
		interactionListener: HTMLElement;
		listToScroll: HTMLElement;
		listNavButtons: NodeListOf<Element>;

	}
	export class ScrollController{
		private interactionListener: HTMLElement;
		private listToScroll: HTMLElement;
		private listWidth: number = 0;
		private listNavButtons: NodeListOf<Element>;

		private rAF: number;
		private visibleAreaWidth: number = 0;
		private max: number = 0;

		private onListNavButtonsClickCallback: () => void;
		private documentLeaveCallback: () => void;
		private onInteractStartCallback: () => void;
		private onInteractEndCallback: () => void;
		private onInteractMoveCallback: () => void;

		private interacting: boolean = false;
		private x: number = 0;
		private startX: number = 0;
		private startXTarget: number = 0;
		private mouseSpeed: number = 0;
		private mouseSpeedTarget: number = 0;
		private direction: number = 0;
		private directionTarget: number = 0;
		private inputAccerlation: number = 0;
		private inputAccerlationTarget: number = 0;

		constructor(options: IScrollControllerOptions){
			this.interactionListener = options.interactionListener;
			this.listToScroll = options.listToScroll;
			this.listNavButtons = options.listNavButtons;

			this.onListNavButtonsClickCallback = this.onListNavButtonsClick.bind(this);
			this.listNavButtons[0].addEventListener("click", this.onListNavButtonsClickCallback, false);
			this.listNavButtons[1].addEventListener("click", this.onListNavButtonsClickCallback, false);

			this.documentLeaveCallback = this.documentLeave.bind(this);
			this.onInteractStartCallback = this.onInteractStart.bind(this);
			this.onInteractEndCallback = this.onInteractEnd.bind(this);
			this.onInteractMoveCallback = this.onInteractMove.bind(this);

			document.addEventListener("mouseleave", this.documentLeaveCallback, false);
			document.addEventListener(Helpers.getMouseEvent("mouseup"), this.documentLeaveCallback, false);
			this.interactionListener.addEventListener(Helpers.getMouseEvent("mousedown"), this.onInteractStartCallback, false);
			this.interactionListener.addEventListener(Helpers.getMouseEvent("mouseup"), this.onInteractEndCallback, false);
			this.interactionListener.addEventListener(Helpers.getMouseEvent("mousemove"), this.onInteractMoveCallback, false);
		}

		private onListNavButtonsClick(event: MouseEvent){
			const dirClick: string = (<HTMLElement> event.currentTarget).getAttribute("direction");
			this.pushDirection(dirClick == "next" ? -1 : 1);
		}

		private documentLeave(event: MouseEvent | TouchEvent){
			this.onInteractEnd(event);
		}

		private onInteractStart(event: MouseEvent | TouchEvent){
			const vector: TouchVector2d = Helpers.getXYFromMouseTouchEvent(event);

			this.interacting = true;
			this.startX = vector.x;
			this.startXTarget = this.startX;
			this.inputAccerlation = 0;

			this.render();
		}

		private onInteractEnd(event: MouseEvent | TouchEvent){
			this.interacting = false;
		}

		private onInteractMove(event: MouseEvent | TouchEvent){
			if(this.interacting){
				const vector: TouchVector2d = Helpers.getXYFromMouseTouchEvent(event);
				const newAcc: number = vector.x - this.startX;
				
				const magnifier: number = 6.2;
				this.inputAccerlationTarget = newAcc * magnifier;
				
				this.directionTarget = this.inputAccerlationTarget < 0 ? -1 : 1;
				this.startXTarget = vector.x;
			}
		}

		private render(){
			if(this.rAF)
				cancelAnimationFrame(this.rAF);


			// normalise startX
			this.startX += (this.startXTarget - this.startX) * 0.2;

			// animate accerlaration
			this.inputAccerlation += (this.inputAccerlationTarget - this.inputAccerlation) * (this.interacting ? 0.2 : 0.05);
			const accDamping: number = 0.25;
			this.inputAccerlationTarget *= accDamping;

			// animate directions
			this.direction += (this.directionTarget - this.direction) * 0.2;

			// extra extra
			this.mouseSpeed += (this.mouseSpeedTarget - this.mouseSpeed) * 0.2;
			this.direction += this.mouseSpeed;
			
			// animate x
			this.x += this.inputAccerlation * 0.05;

			// bounce back when over
			if(this.x > 0)
				this.x += (0 - this.x) * 0.3;

			
			if(this.x < this.max)
				this.x += (this.max - this.x) * 0.3;

			// toggle visibility on nav arrows
			if(this.x >= 0 && !this.listNavButtons[0].classList.contains("hide"))
				this.listNavButtons[0].classList.add("hide");

			if(this.x < 0 && this.listNavButtons[0].classList.contains("hide"))
				this.listNavButtons[0].classList.remove("hide");

			if(this.x <= this.max && !this.listNavButtons[1].classList.contains("hide"))
				this.listNavButtons[1].classList.add("hide");

			if(this.x > this.max && this.listNavButtons[1].classList.contains("hide"))
				this.listNavButtons[1].classList.remove("hide");

			// set css transforms
			const xx: number = this.x;
			(<any> this.listToScroll).style["-webkit-transform"] = "translateX("+xx+"px)";
			(<any> this.listToScroll).style["-moz-transform"] = "translateX("+xx+"px)";
			(<any> this.listToScroll).style["-ms-transform"] = "translateX("+xx+"px)";
			(<any> this.listToScroll).style["transform"] = "translateX("+xx+"px)";

			// cycle render
			this.rAF = window.requestAnimationFrame(() => this.render());
		}

		public pushDirection(dir: number){
			this.inputAccerlationTarget += (5000) * dir;
			this.render();
		}

		public remove(){
			this.listNavButtons[0].removeEventListener("click", this.onListNavButtonsClickCallback, false);
			this.listNavButtons[1].removeEventListener("click", this.onListNavButtonsClickCallback, false);
			this.onListNavButtonsClickCallback = null;

			document.removeEventListener("mouseleave", this.documentLeaveCallback, false);
			this.interactionListener.removeEventListener(Helpers.getMouseEvent("mousedown"), this.onInteractStartCallback, false);
			this.interactionListener.removeEventListener(Helpers.getMouseEvent("mouseup"), this.onInteractEndCallback, false);
			this.interactionListener.removeEventListener(Helpers.getMouseEvent("mousemove"), this.onInteractMoveCallback, false);

			this.documentLeaveCallback = null;
			this.onInteractStartCallback = null;
			this.onInteractEndCallback = null;
			this.onInteractMoveCallback = null;
		}

		public reset(){
			this.interacting = false;
			this.startX = 0;
			this.startXTarget = this.startX;
			this.inputAccerlation = 0;
			this.x = 20; // overflow bounce.. could be made nicer
			this.render();
			this.listNavButtons[0].classList.add("hide");
			this.listNavButtons[1].classList.add("hide");
		}

		public resize(listWidth: number, visibleAreaWidth: number){
			this.visibleAreaWidth = visibleAreaWidth;
			this.listWidth = Math.max(visibleAreaWidth, listWidth);
			this.max = (this.listWidth - this.visibleAreaWidth) * -1;
		}
	}
} 