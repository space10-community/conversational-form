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
/* eslint-disable class-methods-use-this */
import { ConversationalForm } from '../../ConversationalForm'
import { ITag, Tag } from '../../form-tags/Tag'
import { Helpers } from '../../logic/Helpers'
import {
  BasicElement,
  IBasicElement,
  IBasicElementOptions
} from '../BasicElement'

// interface
export interface ControlElementVector {
  height: number
  width: number
  x: number
  y: number
  centerX?: number
  centerY?: number
  el: IControlElement
}

export interface IControlElementOptions extends IBasicElementOptions {
  referenceTag: ITag
}

export interface IControlElement extends IBasicElement {
  el: HTMLElement
  referenceTag: ITag
  type: string
  value: string
  positionVector: ControlElementVector
  tabIndex: number
  visible: boolean
  focus: boolean
  highlight: boolean
  partOfSeveralChoices: boolean
  hasImage(): boolean
  calcPosition(): void
  dealloc(): void
}

export const ControlElementEvents = {
  SUBMIT_VALUE: 'cf-basic-element-submit',
  PROGRESS_CHANGE: 'cf-basic-element-progress', // busy, ready
  ON_FOCUS: 'cf-basic-element-on-focus', // busy, ready
  ON_LOADED: 'cf-basic-element-on-loaded' // busy, loaded
}

export const ControlElementProgressStates = {
  BUSY: 'cf-control-element-progress-BUSY',
  READY: 'cf-control-element-progress-READY'
}

// class
export class ControlElement extends BasicElement implements IControlElement {
  public el!: HTMLElement

  public referenceTag!: ITag

  private animateInTimer = 0

  private _partOfSeveralChoices = false

  private _positionVector!: ControlElementVector

  private _focus = false

  private onFocusCallback: (e?: any) => void

  private onBlurCallback: (e?: any) => void

  public get type(): string {
    return 'ControlElement'
  }

  public set partOfSeveralChoices(value: boolean) {
    this._partOfSeveralChoices = value
  }

  public get partOfSeveralChoices(): boolean {
    return this._partOfSeveralChoices
  }

  public get value(): string {
    // value is for the chat response -->
    const hasTagImage: boolean = (this.referenceTag as Tag).hasImage
    let str: string
    if (hasTagImage && !this.partOfSeveralChoices) {
      // eslint-disable-next-line max-len
      // const image: string = hasTagImage ? "<img src='" + this.referenceTag.domElement.getAttribute("cf-image") + "'/>" : "";
      const image = hasTagImage
        ? `<img src="${this.referenceTag?.domElement?.getAttribute(
            'cf-image'
          )}"/>`
        : ''
      // str = "<div class='contains-image'>"
      // str += image;
      // str += "<span>" + Helpers.getInnerTextOfElement(this.el) + "</span>";
      // str += "</div>";
      str = image + Helpers.getInnerTextOfElement(this.el)
    } else {
      // str = "<div><span>" + Helpers.getInnerTextOfElement(this.el) + "</span></div>";
      str = Helpers.getInnerTextOfElement(this.el)
    }

    return str
  }

  public get positionVector(): ControlElementVector {
    return this._positionVector
  }

  public set tabIndex(value: number) {
    this.el.tabIndex = value
  }

  public get highlight(): boolean {
    return this.el.classList.contains('highlight')
  }

  public set highlight(value: boolean) {
    if (value) {
      this.el.classList.add('highlight')
    } else {
      this.el.classList.remove('highlight')
    }
  }

  public get focus(): boolean {
    return this._focus
  }

  public set focus(value: boolean) {
    this._focus = value
    if (this._focus) {
      this.el.focus()
    } else {
      this.el.blur()
    }
  }

  public get visible(): boolean {
    return !this.el.classList.contains('hide')
  }

  public set visible(value: boolean) {
    if (value) {
      this.el.classList.remove('hide')
    } else {
      this.el.classList.add('hide')
      this.tabIndex = -1
      this.highlight = false
    }
  }

  constructor(options: IBasicElementOptions) {
    super(options)

    this.onFocusCallback = this.onFocus.bind(this)
    this.el.addEventListener('focus', this.onFocusCallback, false)
    this.onBlurCallback = this.onBlur.bind(this)
    this.el.addEventListener('blur', this.onBlurCallback, false)

    if (this.referenceTag.disabled) {
      this.el.setAttribute('disabled', 'disabled')
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onBlur(_event: Event) {
    this._focus = false
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onFocus(_event: Event) {
    this._focus = true
    ConversationalForm.illustrateFlow(
      this,
      'dispatch',
      ControlElementEvents.ON_FOCUS,
      this.referenceTag
    )
    this.eventTarget.dispatchEvent(
      new CustomEvent(ControlElementEvents.ON_FOCUS, {
        detail: this.positionVector
      })
    )
  }

  /**
   * @name hasImage
   * if control element contains an image element
   */
  public hasImage(): boolean {
    return false
  }

  public calcPosition(): void {
    const mr: number = parseInt(
      window.getComputedStyle(this.el).getPropertyValue('margin-right'),
      10
    )
    // try not to do this to often, re-paint whammy!
    this._positionVector = {
      height: this.el.offsetHeight,
      width: this.el.offsetWidth + mr,
      x: this.el.offsetLeft,
      y: this.el.offsetTop,
      el: this
    } as ControlElementVector

    this._positionVector.centerX =
      this._positionVector.x + this._positionVector.width * 0.5
    this._positionVector.centerY =
      this._positionVector.y + this._positionVector.height * 0.5
  }

  protected setData(options: IControlElementOptions): void {
    this.referenceTag = options.referenceTag
    super.setData(options)
  }

  public animateIn(): void {
    clearTimeout(this.animateInTimer)
    this.el.classList.add('animate-in')
  }

  public animateOut(): void {
    this.el.classList.add('animate-out')
  }

  public onChoose(): void {
    ConversationalForm.illustrateFlow(
      this,
      'dispatch',
      ControlElementEvents.SUBMIT_VALUE,
      this.referenceTag
    )
    this.eventTarget.dispatchEvent(
      new CustomEvent(ControlElementEvents.SUBMIT_VALUE, {
        detail: this
      })
    )
  }

  public dealloc(): void {
    this.el.removeEventListener('blur', this.onBlurCallback, false)
    // @ts-ignore
    this.onBlurCallback = null

    this.el.removeEventListener('focus', this.onFocusCallback, false)
    // @ts-ignore
    this.onFocusCallback = null

    super.dealloc()
  }
}
