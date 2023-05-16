/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */
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

import { Helpers } from '../logic/Helpers'

export interface IKeyCodes {
  left: number
  right: number
  down: number
  up: number
  backspace: number
  enter: number
  space: number
  shift: number
  tab: number
}

export interface IDictionaryOptions {
  data?: Record<string, any>
  robotData?: Record<string, any>
  userImage: string
  robotImage: string
  version: string
}
// class
export class Dictionary {
  private static instance: Dictionary

  private version: string

  constructor(options?: IDictionaryOptions) {
    Dictionary.instance = this

    this.version = options?.version || ''

    // overwrite data if defined
    if (options && options.data) {
      this.data = this.validateAndSetNewData(options.data, this.data)
    }

    // overwrite user image
    if (options?.userImage) {
      this.data['user-image'] = options?.userImage
    }

    // overwrite robot image
    if (options?.robotImage) {
      this.robotData['robot-image'] = options?.robotImage
    }

    // overwrite robot questions if defined
    if (options && options.robotData) {
      this.robotData = this.validateAndSetNewData(
        options.robotData,
        this.robotData
      )
    }
  }

  public static keyCodes: IKeyCodes = {
    left: 37,
    right: 39,
    down: 40,
    up: 38,
    backspace: 8,
    enter: 13,
    space: 32,
    shift: 16,
    tab: 9
  }

  public static get(id: string): string {
    const ins: Dictionary = Dictionary.instance
    let value: string = ins.data[id]

    if (!value) {
      value = ins.data['entry-not-found']
    } else {
      const values: Array<string> = Helpers.getValuesOfBars(value)
      value = values[Math.floor(Math.random() * values.length)] as string
    }

    return value
  }

  /**
   * @name set
   * set a dictionary value
   * id: string, id of the value to update
   * type: string, "human" || "robot"
   * value: string, value to be inserted
   */
  public static set(id: string, type: string, value: string): string {
    const ins: Dictionary = Dictionary.instance
    const obj: any = type === 'robot' ? ins.robotData : ins.data

    obj[id] = value
    return obj[id]
  }

  public static getRobotResponse(tagType: string): string {
    const ins: Dictionary = Dictionary.instance
    let value: string = ins.robotData[tagType]
    if (!value) {
      // value not found, so pick a general one
      const generals: Array<string> = Helpers.getValuesOfBars(
        ins.robotData.general
      )
      value = generals[Math.floor(Math.random() * generals.length)] as string
    } else {
      const values: Array<string> = Helpers.getValuesOfBars(value)
      value = values[Math.floor(Math.random() * values.length)] as string
    }

    return value
  }

  public static parseAndGetMultiValueString(arr: Array<string>): string {
    // check ControlElement.ts for value(s)
    let value = ''
    for (let i = 0; i < arr.length; i++) {
      const str: string = arr[i] as string
      const sym: string =
        arr.length > 1 && i === arr.length - 2
          ? Dictionary.get('user-reponse-and')
          : ', '
      value += str + (i < arr.length - 1 ? sym : '')
    }

    return value
  }

  private validateAndSetNewData(newData: any, originalDataObject: any) {
    for (const key in originalDataObject) {
      if (!newData[key]) {
        console.warn(
          `Conversational Form Dictionary warning, '${key}' value is undefined, mapping '${key}' to default value. See Dictionary.ts for keys.`
        )
        newData[key] = originalDataObject[key]
      }
    }

    return newData
  }

  // can be overwrittenMicrophone error
  protected data: any = {
    'user-image':
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMTAwIiBmaWxsPSIjMzAzMDMwIi8+CjxwYXRoIGQ9Ik0xMDAgNTVMMTM4Ljk3MSAxMjIuNUg2MS4wMjg5TDEwMCA1NVoiIGZpbGw9IiNFNUU2RUEiLz4KPC9zdmc+Cg==',
    'entry-not-found': 'Dictionary item not found.',
    'awaiting-mic-permission': 'Awaiting mic permission',
    'user-audio-reponse-invalid': "I didn't get that, try again.",
    'microphone-terminal-error': 'Audio input not supported',
    'input-placeholder': 'Type your answer here ...',
    'group-placeholder': 'Type to filter ...',
    'select-placeholder': 'Click on the arrow to advance ...',
    'input-placeholder-error': 'Your input is not correct ...',
    'input-placeholder-required': 'Input is required ...',
    'input-placeholder-file-error': 'File upload failed ...',
    'input-placeholder-file-size-error': 'File size too big ...',
    'input-no-filter': 'No results found for ‛{input-value}‛',
    'user-reponse-and': ' and ',
    'user-reponse-missing': 'Missing input ...',
    'user-reponse-missing-group': 'Nothing selected ...',
    general: 'General type1||General type2',
    'icon-type-file':
      "<svg class='cf-icon-file' viewBox='0 0 10 14' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><g stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'><g transform='translate(-756.000000, -549.000000)' fill='#0D83FF'><g transform='translate(736.000000, 127.000000)'><g transform='translate(0.000000, 406.000000)'><polygon points='20 16 26.0030799 16 30 19.99994 30 30 20 30'></polygon></g></g></g></g></svg>"
  }

  // can be overwriten
  protected robotData: any = {
    'robot-image':
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMTAwIiBmaWxsPSIjRTVFNkVBIi8+CjxyZWN0IHg9IjY2IiB5PSI2NiIgd2lkdGg9IjY4IiBoZWlnaHQ9IjY4IiBmaWxsPSIjMzAzMDMwIi8+Cjwvc3ZnPgo=',
    input: 'Please write some text.',
    text: 'Please write some text.',
    textarea: 'Please write some text.',
    checkbox: 'Select as many as you want.',
    name: "What's your name?",
    email: 'Need your e-mail.',
    password: 'Please provide password',
    tel: "What's your phone number?",
    radio: 'I need you to select one of these.',
    select: 'Choose any of these options.',
    file: 'Select a file to upload.',
    general: 'General1||General2||General3..'
  }
}
