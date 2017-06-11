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
		
		/**
		* awaitingCallback
		* @type string
		* able to set awaiting state, so user can call external apis keeping the flow in check
		*/
		awaitingCallback?:boolean;

		/**
		* template
		* @type string
		* overwrite Conversational Form templates with your own markup.. optional, for cf.UserInputTypes.VOICE and cf.UserInputTypes.TEXT, there are default templates
		*/
		template?:string;
		init?():void;
		input?(resolve: any, reject: any):void;
	}
}