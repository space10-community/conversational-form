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
		/**
		* awaitingCallback
		* @type string
		* able to set awaiting state, so user can call external apis keeping the flow in check
		*/
		awaitingCallback?:boolean;

		// optional way of cancelling input
		cancelInput?():void;

		init?():void;
		input?(resolve: any, reject: any, mediaStream: MediaStream):void;
	}
}