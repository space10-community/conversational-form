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

import { Button } from './Button'

// interface

// class
export class RadioButton extends Button {
  public get type(): string {
    return 'RadioButton'
  }

  public get checked(): boolean {
    const _checked: boolean =
      this.el.hasAttribute('checked') &&
      this.el.getAttribute('checked') === 'checked'
    return _checked
  }

  public set checked(value: boolean) {
    if (!value) {
      this.el.removeAttribute('checked')
      this.referenceTag.domElement?.removeAttribute('checked')
      ;(this.referenceTag.domElement as HTMLInputElement).checked = false
    } else {
      this.el.setAttribute('checked', 'checked')
      this.referenceTag.domElement?.setAttribute('checked', 'checked')
      ;(this.referenceTag.domElement as HTMLInputElement).checked = true
    }
  }

  protected onClick(event: MouseEvent): void {
    this.checked = true // checked always true like native radio buttons
    super.onClick(event)
  }

  // override
  public getTemplate(): string {
    const isChecked = !!(
      (this.referenceTag.domElement as HTMLInputElement).checked ||
      this.referenceTag.domElement?.hasAttribute('checked')
    )

    return `<cf-radio-button class="cf-button" ${
      isChecked ? 'checked=checked' : ''
    }>
        <div>
          <cf-radio></cf-radio>
          <span>${this.referenceTag.label}</span>
        </div>
      </cf-radio-button>
      `
  }
}
