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

import { ConversationalForm } from '../ConversationalForm'

export class EventDispatcher implements EventTarget {
  private target: DocumentFragment;

  private _cf: ConversationalForm;

  public get cf(): ConversationalForm {
    return this._cf
  }

  public set cf(value: ConversationalForm) {
    this._cf = value
  }

  constructor(cfRef: ConversationalForm) {
    this._cf = cfRef
    this.target = document.createDocumentFragment()
  }

  public addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    useCapture?: boolean
  ): void {
    return this.target.addEventListener(type, listener, useCapture)
  }

  public dispatchEvent(event: Event | CustomEvent): boolean {
    return this.target.dispatchEvent(event)
  }

  public removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    useCapture?: boolean
  ): void {
    this.target.removeEventListener(type, listener, useCapture)
  }
}
