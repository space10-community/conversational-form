/*
* Copyright (c) 2013-2018 SPACE10
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*
* Copyright (c) 2023 YU TECNOLOGIA E CONSULTORIA EM CAPITAL HUMANO LTDA.
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

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
export interface IUserInterfaceOptions {
  // the in-animation delay of control elements (checkbox, radio option),
  // while user response is awaiting
  controlElementsInAnimationDelay?: number;

  // robot bobble
  robot?: {
    // show thinking dots for robot, defaults to 0
    robotResponseTime?: number;

    // the delay inbetween chained robot responses
    chainedResponseTime?: number;
  },

  // user bobble
  user?: {
    // to show thinking state or not, defaults to false;
    showThinking?: boolean

    // to show user thumbnail, defaults to false
    showThumb?: boolean
  }

  // text input
  input?: {

  }
}
