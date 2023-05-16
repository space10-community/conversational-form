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
import { EventDispatcher } from '../logic/EventDispatcher'
import { FlowEvents } from '../logic/FlowManager'
import { IBasicElementOptions } from './BasicElement'

// interface

// class
export class ProgressBar {
  private flowUpdateCallback: (e?: any) => void

  public el: HTMLElement

  private bar: HTMLElement

  private eventTarget: EventDispatcher

  constructor(options: IBasicElementOptions) {
    this.flowUpdateCallback = this.onFlowUpdate.bind(this)
    this.eventTarget = options.eventTarget
    this.eventTarget.addEventListener(
      FlowEvents.FLOW_UPDATE,
      this.flowUpdateCallback,
      false
    )
    this.eventTarget.addEventListener(
      FlowEvents.FORM_SUBMIT,
      () => this.setWidth(100),
      false
    )

    this.el = document.createElement('div')
    this.el.className = 'cf-progressBar'

    this.bar = document.createElement('div')
    this.bar.className = 'bar'
    this.el.appendChild(this.bar)

    setTimeout(() => this.init(), 800)
  }

  private init() {
    this.el.classList.add('show')
  }

  private onFlowUpdate(event: CustomEvent) {
    this.setWidth((event.detail.step / event.detail.maxSteps) * 100)
  }

  private setWidth(percentage: number) {
    this.bar.style.width = `${percentage}%`
  }

  public dealloc(): void {
    this.eventTarget.removeEventListener(
      FlowEvents.FLOW_UPDATE,
      this.flowUpdateCallback,
      false
    )
    // @ts-ignore
    this.flowUpdateCallback = null
  }
}
