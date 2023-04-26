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

import { FlowDTO } from '../logic/FlowManager'
import { Helpers } from '../logic/Helpers'
import { Tag } from './Tag'

export class OptionTag extends Tag {
  public get type(): string {
    return 'option'
  }

  public get label(): string {
    if (this.formless) {
      return super.getLabel()
    }
    return Helpers.getInnerTextOfElement(this.domElement)
  }

  public get selected(): boolean {
    return this.domElement.hasAttribute('selected')
    // return (<HTMLOptionElement> this.domElement).selected;
  }

  public set selected(value: boolean) {
    (this.domElement as HTMLOptionElement).selected = value
    if (value) {
      this.domElement.setAttribute('selected', 'selected')
    } else {
      this.domElement.removeAttribute('selected')
    }
  }

  public setTagValueAndIsValid(value: FlowDTO): boolean {
    const isValid = true
    // OBS: No need to set any validation og value for this tag type ..
    // .. it is atm. only used to create pseudo elements in the OptionsList

    return isValid
  }
}
