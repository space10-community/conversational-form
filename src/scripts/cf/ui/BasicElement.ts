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
import { ConversationalForm } from '../ConversationalForm'
import { EventDispatcher } from '../logic/EventDispatcher'

// interface
export interface IBasicElementOptions {
  eventTarget: EventDispatcher
  cfReference?: ConversationalForm
  // set a custom template
  customTemplate?: string
}

export interface IBasicElement {
  el: HTMLElement
  // template, can be overwritten ...
  getTemplate(): string
  dealloc(): void
}

// class
export class BasicElement implements IBasicElement {
  public el!: HTMLElement

  protected eventTarget: EventDispatcher

  protected cfReference?: ConversationalForm

  // optional value, but this can be used to overwrite the UI of Conversational Interface
  protected customTemplate!: string

  constructor(options: IBasicElementOptions) {
    this.eventTarget = options.eventTarget
    if (options.cfReference) {
      this.cfReference = options.cfReference
    }

    if (options.customTemplate) {
      this.customTemplate = options.customTemplate
    }

    // TODO: remove
    if (!this.eventTarget) {
      throw new Error(`this.eventTarget not set!! : ${this.constructor.name}`)
    }

    this.setData(options)
    this.createElement()
    this.onElementCreated()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected setData(_options: IBasicElementOptions): void {
    // Empty
  }

  protected onElementCreated(): void {
    // Empty
  }

  private createElement(): Element {
    const template: HTMLTemplateElement = document.createElement('template')
    template.innerHTML = this.getTemplate()
    this.el =
      (template.firstChild as HTMLElement) ||
      (template.content.firstChild as HTMLElement)
    return this.el
  }

  // template, should be overwritten ...
  public getTemplate(): string {
    return this.customTemplate || 'should be overwritten...'
  }

  public dealloc(): void {
    // @ts-ignore
    this.el.parentNode.removeChild(this.el)
  }
}
