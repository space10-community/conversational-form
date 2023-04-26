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
import { ITagOptions, Tag } from './Tag'

export class InputTag extends Tag {
  constructor(options: ITagOptions) {
    super(options)

    if (this.type === 'text') {
      // empty
    } else if (this.type === 'email') {
      // empty
    } else if (this.type === 'tel') {
      // empty
    } else if (this.type === 'checkbox') {
      // empty
    } else if (this.type === 'radio') {
      // empty
    } else if (this.type === 'password') {
      // empty
    } else if (this.type === 'file') {
      // check InputFileTag.ts
    }
  }

  protected findAndSetQuestions(): void {
    super.findAndSetQuestions()

    // special use cases for <input> tag add here...
  }

  protected findAndSetLabel(): void {
    super.findAndSetLabel()

    if (!this._label) {
      // special use cases for <input> tag add here...
    }
  }

  public setTagValueAndIsValid(value: FlowDTO): boolean {
    if (this.type === 'checkbox') {
      // checkbox is always true..
      return true
    }
    return super.setTagValueAndIsValid(value)
  }

  public dealloc(): void {
    super.dealloc()
  }
}
