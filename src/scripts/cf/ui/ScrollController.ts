/// <reference path="../logic/Helpers.ts"/>
/// <reference path="../logic/EventDispatcher.ts"/>

// namespace
namespace cf {
	export interface IScrollControllerOptions{
		interactionListener: HTMLElement;
		eventTarget: EventDispatcher;
		listToScroll: HTMLElement;
		listNavButtons: NodeListOf<Element>;

	}
	export class ScrollController{
		public static acceleration: number = 0.1;

		private eventTarget: EventDispatcher;
		private interactionListener: HTMLElement;
		private listToScroll: HTMLElement;
		private listWidth: number = 0;
		private prevButton: Element;
		private nextButton: Element;

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
		private xTarget: number = 0;
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
			this.eventTarget = options.eventTarget;
			this.listToScroll = options.listToScroll;
			this.prevButton = options.listNavButtons[0];
			this.nextButton = options.listNavButtons[1];

			this.onListNavButtonsClickCallback = this.onListNavButtonsClick.bind(this);
			this.prevButton.addEventListener("click", this.onListNavButtonsClickCallback, false);
			this.nextButton.addEventListener("click", this.onListNavButtonsClickCallback, false);

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
			this.inputAccerlation += (this.inputAccerlationTarget - this.inputAccerlation) * (this.interacting ? Math.min(ScrollController.acceleration + 0.1, 1) : ScrollController.acceleration);
			const accDamping: number = 0.25;
			this.inputAccerlationTarget *= accDamping;

			// animate directions
			this.direction += (this.directionTarget - this.direction) * 0.2;

			// extra extra
			this.mouseSpeed += (this.mouseSpeedTarget - this.mouseSpeed) * 0.2;
			this.direction += this.mouseSpeed;
			
			// animate x
			this.xTarget += this.inputAccerlation * 0.05;

			// bounce back when over
			if(this.xTarget > 0)
				this.xTarget += (0 - this.xTarget) * Helpers.lerp(ScrollController.acceleration, 0.3, 0.8);

			if(this.xTarget < this.max)
				this.xTarget += (this.max - this.xTarget) * Helpers.lerp(ScrollController.acceleration, 0.3, 0.8);

			this.x += (this.xTarget - this.x) * 0.4;

			// toggle visibility on nav arrows

			const xRounded: number = Math.round(this.x);
			if(xRounded < 0){
				if(!this.prevButton.classList.contains("active"))
					this.prevButton.classList.add("active");
				if(!this.prevButton.classList.contains("cf-gradient"))
					this.prevButton.classList.add("cf-gradient");
			}

			if(xRounded == 0){
				if(this.prevButton.classList.contains("active"))
					this.prevButton.classList.remove("active");
				if(this.prevButton.classList.contains("cf-gradient"))
					this.prevButton.classList.remove("cf-gradient");
			}

			if(xRounded > this.max){
				if(!this.nextButton.classList.contains("active"))
					this.nextButton.classList.add("active");
				if(!this.nextButton.classList.contains("cf-gradient"))
					this.nextButton.classList.add("cf-gradient");
			}

			if(xRounded <= this.max){
				if(this.nextButton.classList.contains("active"))
					this.nextButton.classList.remove("active");
				if(this.nextButton.classList.contains("cf-gradient"))
					this.nextButton.classList.remove("cf-gradient");
			}

			// set css transforms
			const xx: number = this.x;
			Helpers.setTransform(this.listToScroll, "translateX("+xx+"px)");

			// cycle render
			if(this.interacting || (Math.abs(this.x -this.xTarget) > 0.02 && !this.interacting))
				this.rAF = window.requestAnimationFrame(() => this.render());
		}

		public setScroll(x: number, y: number){
			this.xTarget = this.visibleAreaWidth == this.listWidth ? 0 : x;
			this.render();
		}

		public pushDirection(dir: number){
			this.inputAccerlationTarget += (5000) * dir;
			this.render();
		}

		public dealloc(){
			this.prevButton.removeEventListener("click", this.onListNavButtonsClickCallback, false);
			this.nextButton.removeEventListener("click", this.onListNavButtonsClickCallback, false);
			this.onListNavButtonsClickCallback = null;
			this.prevButton = null;
			this.nextButton = null;

			document.removeEventListener("mouseleave", this.documentLeaveCallback, false);
			document.removeEventListener(Helpers.getMouseEvent("mouseup"), this.documentLeaveCallback, false);
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
			this.x = 0;
			this.xTarget = 0;
			Helpers.setTransform(this.listToScroll, "translateX(0px)");
			this.render();
			this.prevButton.classList.remove("active");
			this.nextButton.classList.remove("active");
		}

		public resize(listWidth: number, visibleAreaWidth: number){
			this.reset();
			this.visibleAreaWidth = visibleAreaWidth;
			this.listWidth = Math.max(visibleAreaWidth, listWidth);
			this.max = (this.listWidth - this.visibleAreaWidth) * -1;
			this.render();
		}
	}
} 