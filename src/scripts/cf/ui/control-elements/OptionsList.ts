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
/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
import { ConversationalForm } from '../../ConversationalForm'
import { SelectTag } from '../../form-tags/SelectTag'
import { ITag } from '../../form-tags/Tag'
import { EventDispatcher } from '../../logic/EventDispatcher'
import { ControlElementEvents } from './ControlElement'
import {
  IOptionButtonOptions,
  OptionButton,
  OptionButtonEvents
} from './OptionButton'

// interface

export interface IOptionsListOptions {
  context: HTMLElement
  eventTarget: EventDispatcher
  referenceTag: ITag
}

// class
// builds x OptionsButton from the registered SelectTag
export class OptionsList {
  public elements?: OptionButton[]

  private eventTarget: EventDispatcher

  private context: HTMLElement

  private multiChoice?: boolean

  private referenceTag: ITag

  private onOptionButtonClickCallback: (e?: any) => void

  public get type(): string {
    return 'OptionsList'
  }

  constructor(options: IOptionsListOptions) {
    this.context = options.context
    this.eventTarget = options.eventTarget
    this.referenceTag = options.referenceTag

    // check for multi choice select tag
    this.multiChoice = this.referenceTag?.domElement?.hasAttribute('multiple')

    this.onOptionButtonClickCallback = this.onOptionButtonClick.bind(this)
    this.eventTarget.addEventListener(
      OptionButtonEvents.CLICK,
      this.onOptionButtonClickCallback,
      false
    )

    this.createElements()
  }

  public getValue(): Array<OptionButton> {
    const arr: Array<OptionButton> = []

    if (!this.elements) {
      return arr
    }

    for (let i = 0; i < this.elements.length; i++) {
      const element: OptionButton = this.elements[i] as OptionButton
      if (!this.multiChoice && element.selected) {
        arr.push(element)
        return arr
      }
      if (this.multiChoice && element.selected) {
        arr.push(element)
      }
    }

    return arr
  }

  private onOptionButtonClick(event: CustomEvent) {
    // if mutiple... then dont remove selection on other buttons
    if (!this.multiChoice) {
      // only one is selectable at the time.

      if (!this.elements) {
        return
      }

      for (let i = 0; i < this.elements.length; i++) {
        const element: OptionButton = this.elements[i] as OptionButton
        if (element !== event.detail) {
          element.selected = false
        } else {
          element.selected = true
        }
      }

      ConversationalForm.illustrateFlow(
        this,
        'dispatch',
        ControlElementEvents.SUBMIT_VALUE,
        this.referenceTag
      )
      this.eventTarget.dispatchEvent(
        new CustomEvent(ControlElementEvents.SUBMIT_VALUE, {
          detail: event.detail as OptionButton
        })
      )
    } else {
      // eslint-disable-next-line no-param-reassign, prettier/prettier
      ;(event.detail as OptionButton).selected = !(event.detail as OptionButton)
        .selected
    }
  }

  private createElements() {
    this.elements = []
    const { optionTags } = this.referenceTag as SelectTag
    optionTags.forEach((tag) => {
      const btn: OptionButton = new OptionButton({
        referenceTag: tag,
        isMultiChoice: (this.referenceTag as SelectTag).multipleChoice,
        eventTarget: this.eventTarget
      } as IOptionButtonOptions)

      this.elements?.push(btn)

      this.context.appendChild(btn.el)
    })
  }

  public dealloc(): void {
    this.eventTarget.removeEventListener(
      OptionButtonEvents.CLICK,
      this.onOptionButtonClickCallback,
      false
    )
    // @ts-ignore
    this.onOptionButtonClickCallback = null

    while (this.elements && this.elements.length > 0) {
      this.elements.pop()?.dealloc()
    }

    // @ts-ignore
    this.elements = null
  }
}
