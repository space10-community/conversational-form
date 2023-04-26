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

import { ButtonTag } from './ButtonTag'
import { CfRobotMessageTag } from './CfRobotMessageTag'
import { InputTag } from './InputTag'
import { OptionTag } from './OptionTag'
import { SelectTag } from './SelectTag'
import { ITag, Tag } from './Tag'

/** This function being in any of the Tag related files breaks vite */
export const createTag = (
  element: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement
): ITag | null => {
  if (Tag.isTagValid(element)) {
    // ignore hidden tags
    if (element.tagName.toLowerCase() === 'input') {
      return new InputTag({
        domElement: element
      })
    } if (element.tagName.toLowerCase() === 'textarea') {
      return new InputTag({
        domElement: element
      })
    } if (element.tagName.toLowerCase() === 'select') {
      return new SelectTag({
        domElement: element
      })
    } if (element.tagName.toLowerCase() === 'button') {
      return new ButtonTag({
        domElement: element
      })
    } if (element.tagName.toLowerCase() === 'option') {
      return new OptionTag({
        domElement: element
      })
    } if (element.tagName.toLowerCase() === 'cf-robot-message') {
      return new CfRobotMessageTag({
        domElement: element
      })
    }
  }
  // console.warn("Tag is not valid!: "+ element);
  return null
}
