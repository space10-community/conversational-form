// namespace
namespace cf {
	// default options interface for optional parameters for the UI of Conversational Form
	export const UserInterfaceDefaultOptions: IUserInterfaceOptions = {
		controlElementsInAnimationDelay: 250,
		robot: {
			robotResponseTime: 0,
			chainedResponseTime: 500
		},
		user: {
			showThinking: false,
			showThumb: false
		}
	}

	// general interface for user input, like the default UserTextInput
	export interface IUserInterfaceOptions{
		// the in-animation delay of control elements (checkbox, radio option), while user response is awaiting
		controlElementsInAnimationDelay?: number;
		
		// robot bobble
		robot?:{
			// show thinking dots for robot, defaults to 0
			robotResponseTime?: number;

			// the delay inbetween chained robot responses
			chainedResponseTime?: number;
		},
		
		// user bobble
		user?:{
			// to show thinking state or not, defaults to false;
			showThinking?: boolean
			
			// to show user thumbnail, defaults to false
			showThumb?: boolean
		}
		
		// text input
		input?:{

		}
	}
}