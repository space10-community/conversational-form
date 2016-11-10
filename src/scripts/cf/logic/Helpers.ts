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
			var tmp = document.createElement("DIV");
			tmp.innerHTML = element.innerHTML;
			return tmp.textContent || tmp.innerText || "";
		}

		public static getMouseEvent(eventString: string): string{
			let mappings: any = [];
			mappings["mousedown"] = "ontouchstart" in window ? "touchstart" : "mousedown";
			mappings["mouseup"] = "ontouchstart" in window ? "touchend" : "mouseup";
			mappings["mousemove"] = "ontouchstart" in window ? "touchmove" : "mousemove";

			return <string> mappings[eventString];
		}

		public static caniuse = {
			fileReader: () => {
				if((<any>window).File && (<any>window).FileReader && (<any>window).FileList && window.Blob)
					return true;
				
				return false;
			}
		}

		private static emojilib: any = null;
		public static setEmojiLib(lib: string = "emojify", scriptSrc: string = "//cdnjs.cloudflare.com/ajax/libs/emojify.js/1.1.0/js/emojify.min.js"){
			const head: HTMLHeadElement = document.head || document.getElementsByTagName("head")[0];
			
			const script: HTMLScriptElement = document.createElement("script");
			script.type = "text/javascript";
			script.onload = function() {
				// we use https://github.com/Ranks/emojify.js as a standard
				Helpers.emojilib = (<any> window)[lib];
				if(Helpers.emojilib){
					Helpers.emojilib.setConfig({
						img_dir: "https://cdnjs.cloudflare.com/ajax/libs/emojify.js/1.1.0/images/basic/",
					});
				}
			}
			script.setAttribute("src", scriptSrc);
			head.appendChild(script);
		}

		public static emojify(str: string): string{
			if(Helpers.emojilib){
				str = Helpers.emojilib.replace(str);
			}

			return str;
		}

		public static setTransform(el: any, transformString: string){
			el.style["-webkit-transform"] = transformString;
			el.style["-moz-transform"] = transformString;
			el.style["-ms-transform"] = transformString;
			el.style["transform"] = transformString;
		}
	}
}
