/// <reference path="../logic/FlowManager.ts"/>

// namespace
namespace cf {
	// interface

	export const UserInputTypes = {
		VOICE: "voice",
		VR_GESTURE: "vr-gesture", // <-- future..
		TEXT: "text" // <-- default
	}
	// interface that custom inputs will be checked against
	export interface IUserInput{
		type:string;
		init?():void;
		input?(resolve: any, reject: any):void;
	}
}