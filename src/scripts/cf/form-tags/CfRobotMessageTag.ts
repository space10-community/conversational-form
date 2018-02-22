/// <reference path="Tag.ts"/>

// namespace
namespace cf {
	// interface

	// class
	export class CfRobotMessageTag extends Tag {
		constructor(options: ITagOptions){
			super(options);
			this.skipUserInput = true;
		}

		public dealloc(){
			super.dealloc();
		}
	}
}

