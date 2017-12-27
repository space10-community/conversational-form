// namespace
namespace cf {
	// interface

	export interface TouchVector2d{
		x: number,
		y: number,
		touches: Array<any>,
	}

	// class
	export class Helpers {
		public static lerp(norm: number, min: number, max: number): number {
			return (max - min) * norm + min;
		}

		public static norm(value: number, min: number, max: number): number {
			return (value - min) / (max - min);
		}

		public static getXYFromMouseTouchEvent (event: Event | MouseEvent | TouchEvent): TouchVector2d {
			var touches: Array<any> = null;
			if((<any> event).originalEvent)
				touches = (<any> event).originalEvent.touches || (<any> event).originalEvent.changedTouches;
			else if((<TouchEvent> event).changedTouches)
				touches = <any> (<TouchEvent> event).changedTouches;

			if(touches){
				return {x: touches[0].pageX, y: touches[0].pageY, touches: touches[0]};
			}else{
				return {x: (<MouseEvent> event).pageX, y: (<MouseEvent> event).pageY, touches: null};
			}
		}

		public static getInnerTextOfElement(element: Element): string {
			const tmp = document.createElement("DIV");
			tmp.innerHTML = element.innerHTML;
			// return 
			let text: string = tmp.textContent || tmp.innerText || "";
			// text = String(text).replace('\t','');
			text = String(text).replace(/^\s+|\s+$/g, '');
			
			return text;
		}

		public static getMouseEvent(eventString: string): string{
			let mappings: any = [];
			mappings["click"] = "ontouchstart" in window ? "touchstart" : "click";
			mappings["mousedown"] = "ontouchstart" in window ? "touchstart" : "mousedown";
			mappings["mouseup"] = "ontouchstart" in window ? "touchend" : "mouseup";
			mappings["mousemove"] = "ontouchstart" in window ? "touchmove" : "mousemove";

			return <string> mappings[eventString];
		}

		public static isInternetExlorer(){
			var ua = window.navigator.userAgent;
			var msie = ua.indexOf("MSIE ");
			return msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./);
		}

		public static caniuse = {
			fileReader: () => {
				if((<any>window).File && (<any>window).FileReader && (<any>window).FileList && window.Blob)
					return true;
				
				return false;
			}
		}

		public static getValuesOfBars(str: string): Array<string>{

			let strs: Array<string> = str.split("||");
			
			// TODO: remove single |
			// fallback to the standard
			if(strs.length <= 1)
				strs = str.split("|");
			
			return strs;
		}

		public static setTransform(el: any, transformString: string){
			el.style["-webkit-transform"] = transformString;
			el.style["-moz-transform"] = transformString;
			el.style["-ms-transform"] = transformString;
			el.style["transform"] = transformString;
		}

		// deep extends and object, from: https://andrewdupont.net/2009/08/28/deep-extending-objects-in-javascript/
		public static extendObject (destination: any, source: any) : any{
			for (var property in source) {
				if (source[property] && source[property].constructor &&
					source[property].constructor === Object) {
						destination[property] = destination[property] || {};
						arguments.callee(destination[property], source[property]);
				} else {
					destination[property] = source[property];
				}
			}
			return destination;
		};
	}
}
