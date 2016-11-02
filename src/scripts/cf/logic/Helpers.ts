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
				touches = Array <any> ((<TouchEvent> event).changedTouches);

			if(touches){
				return {x: touches[0].pageX, y: touches[0].pageY, touches: touches[0]};
			}else{
				return {x: (<MouseEvent> event).pageX, y: (<MouseEvent> event).pageY, touches: null};
			}
		};
	}
}
