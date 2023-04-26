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

/* eslint-disable class-methods-use-this */
import { ConversationalForm } from '../../ConversationalForm'
import { Button } from './Button'
import { IControlElementOptions } from './ControlElement'

// interface

export interface IOptionButtonOptions extends IControlElementOptions {
  isMultiChoice: boolean
}

export const OptionButtonEvents = {
  CLICK: 'cf-option-button-click'
}

// class
export class OptionButton extends Button {
  private isMultiChoice = false

  public get type(): string {
    return 'OptionButton'
  }

  public get selected(): boolean {
    return this.el.hasAttribute('selected')
  }

  public set selected(value: boolean) {
    if (value) {
      this.el.setAttribute('selected', 'selected')
    } else {
      this.el.removeAttribute('selected')
    }
  }

  protected setData(options: IOptionButtonOptions): void {
    this.isMultiChoice = options.isMultiChoice
    super.setData(options)
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onClick(event: MouseEvent): void {
    ConversationalForm.illustrateFlow(this, 'dispatch', OptionButtonEvents.CLICK, this)
    this.eventTarget.dispatchEvent(
      new CustomEvent(OptionButtonEvents.CLICK, {
        detail: this
      })
    )
  }

  // override
  public getTemplate(): string {
    // be aware that first option element on none multiple select tags will be selected by default

    // select first option only if there is only one option and if it is not multiple choice
    const selected =
      !(this.referenceTag.domElement as HTMLOptionElement).previousSibling &&
      !(this.referenceTag.domElement as HTMLOptionElement).nextSibling &&
      !this.isMultiChoice &&
      (this.referenceTag.domElement as HTMLOptionElement).selected

    let tmpl = `<cf-button class="cf-button ${this.isMultiChoice ? 'cf-checkbox-button' : ''}" ${
      selected ? "selected='selected'" : ''
    }>`

    tmpl += '<div>'
    if (this.isMultiChoice) {
      tmpl += '<cf-checkbox></cf-checkbox>'
    }

    tmpl += this.referenceTag.label
    tmpl += '</div>'

    tmpl += '</cf-button>'

    return tmpl
  }
}
