// namespace
namespace cf {
	// interface

	// class
	export class Helpers {
		public static lerp(norm: number, min: number, max: number): number {
			return (max - min) * norm + min;
		}

		public static norm(value: number, min: number, max: number): number {
			return (value - min) / (max - min);
		}
	}
}
