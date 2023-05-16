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

/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable class-methods-use-this */
// Abstract UserInpt element, should be extended when adding a new UI for user input

import { ConversationalForm } from '../../ConversationalForm'
import { ITag } from '../../form-tags/Tag'
import { ITagGroup } from '../../form-tags/TagGroup'
import { IUserInput } from '../../interfaces/IUserInput'
import { IUserInputElement } from '../../interfaces/IUserInputElement'
import { FlowDTO, FlowEvents } from '../../logic/FlowManager'
import { Helpers } from '../../logic/Helpers'
import { BasicElement, IBasicElementOptions } from '../BasicElement'
import { ChatListEvents } from '../chat/ChatList'

// interface
export class UserInputElement
  extends BasicElement
  implements IUserInputElement
{
  public static ERROR_TIME = 2000

  public static preventAutoFocus = false

  public static hideUserInputOnNoneTextInput = false

  public el!: HTMLElement

  protected cfReference!: ConversationalForm

  private onChatReponsesUpdatedCallback: (e?: any) => void

  private windowFocusCallback: (e?: any) => void

  private inputInvalidCallback: (e?: any) => void

  private flowUpdateCallback: (e?: any) => void

  protected _currentTag?: ITag | ITagGroup

  protected _disabled = false

  protected _visible = false

  public get active(): boolean {
    return false
  }

  public get currentTag(): ITag | ITagGroup | undefined {
    return this._currentTag
  }

  public set visible(value: boolean) {
    this._visible = value

    if (!this.el.classList.contains('animate-in') && value) {
      setTimeout(() => {
        this.el.classList.add('animate-in')
      }, 0)
    } else if (this.el.classList.contains('animate-in') && !value) {
      this.el.classList.remove('animate-in')
    }
  }

  public set disabled(value: boolean) {
    const hasChanged: boolean = this._disabled !== value
    if (hasChanged) {
      this._disabled = value
      if (value) {
        this.el.setAttribute('disabled', 'disabled')
      } else {
        this.setFocusOnInput()
        this.el.removeAttribute('disabled')
      }
    }
  }

  public get disabled(): boolean {
    return this._disabled
  }

  public get height(): number {
    let elHeight = 0
    let elMargin = 0
    const el: any = this.el as any
    if (Helpers.isInternetExlorer()) {
      // IE
      elHeight = el.offsetHeight
      elMargin =
        parseInt(el.currentStyle.marginTop, 10) +
        parseInt(el.currentStyle.marginBottom, 10)
      elMargin *= 2
    } else {
      // none-IE
      elHeight = parseInt(
        document.defaultView
          ?.getComputedStyle(el, '')
          ?.getPropertyValue('height') || '0',
        10
      )
      elMargin =
        parseInt(
          document.defaultView
            ?.getComputedStyle(el, '')
            ?.getPropertyValue('margin-top') || '0',
          10
        ) +
        parseInt(
          document.defaultView
            ?.getComputedStyle(el, '')
            ?.getPropertyValue('margin-bottom') || '0',
          10
        )
    }
    return elHeight + elMargin
  }

  constructor(options: IUserInputOptions) {
    super(options)

    this.onChatReponsesUpdatedCallback = this.onChatReponsesUpdated.bind(this)
    this.eventTarget.addEventListener(
      ChatListEvents.CHATLIST_UPDATED,
      this.onChatReponsesUpdatedCallback,
      false
    )

    this.windowFocusCallback = this.windowFocus.bind(this)
    window.addEventListener('focus', this.windowFocusCallback, false)

    this.inputInvalidCallback = this.inputInvalid.bind(this)
    this.eventTarget.addEventListener(
      FlowEvents.USER_INPUT_INVALID,
      this.inputInvalidCallback,
      false
    )

    this.flowUpdateCallback = this.onFlowUpdate.bind(this)
    this.eventTarget.addEventListener(
      FlowEvents.FLOW_UPDATE,
      this.flowUpdateCallback,
      false
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onEnterOrSubmitButtonSubmit(_event?: CustomEvent): void {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected inputInvalid(_event: CustomEvent): void {}

  /**
   * @name deactivate
   * DEactivate the field
   */
  public deactivate(): void {
    this.disabled = true
  }

  /**
   * @name reactivate
   * REactivate the field
   */
  public reactivate(): void {
    this.disabled = false
  }

  public getFlowDTO(): FlowDTO {
    // eslint-disable-next-line prefer-destructuring
    // @ts-ignore
    const value: FlowDTO = this?.inputElement?.value
    return value
  }

  public setFocusOnInput(): void {}

  public onFlowStopped(): void {}

  public reset(): void {}

  public dealloc(): void {
    this.eventTarget.removeEventListener(
      ChatListEvents.CHATLIST_UPDATED,
      this.onChatReponsesUpdatedCallback,
      false
    )
    // @ts-ignore
    this.onChatReponsesUpdatedCallback = null

    this.eventTarget.removeEventListener(
      FlowEvents.USER_INPUT_INVALID,
      this.inputInvalidCallback,
      false
    )
    // @ts-ignore
    this.inputInvalidCallback = null

    window.removeEventListener('focus', this.windowFocusCallback, false)
    // @ts-ignore
    this.windowFocusCallback = null

    this.eventTarget.removeEventListener(
      FlowEvents.FLOW_UPDATE,
      this.flowUpdateCallback,
      false
    )
    // @ts-ignore
    this.flowUpdateCallback = null

    super.dealloc()
  }

  protected onFlowUpdate(event: CustomEvent): void {
    ConversationalForm.illustrateFlow(this, 'receive', event.type, event.detail)

    if (event.detail.tag) {
      this._currentTag = event.detail.tag as ITag | ITagGroup
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected windowFocus(_event: Event): void {}

  private onChatReponsesUpdated(event: CustomEvent) {
    // only show when user response
    if (!(event.detail as any).currentResponse.isRobotResponse) {
      this.visible = true
      this.disabled = false
      this.setFocusOnInput()
    }
  }
}

export interface IUserInputOptions extends IBasicElementOptions {
  cfReference: ConversationalForm
  microphoneInputObj?: IUserInput
}

export const UserInputEvents = {
  SUBMIT: 'cf-input-user-input-submit',
  KEY_CHANGE: 'cf-input-key-change',
  CONTROL_ELEMENTS_ADDED: 'cf-input-control-elements-added',
  HEIGHT_CHANGE: 'cf-input-height-change',
  FOCUS: 'cf-input-focus',
  BLUR: 'cf-input-blur'
}
