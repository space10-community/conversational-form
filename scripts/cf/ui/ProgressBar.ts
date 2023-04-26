/* eslint-disable @typescript-eslint/ban-ts-comment */
import { EventDispatcher } from '../logic/EventDispatcher'
import { FlowEvents } from '../logic/FlowManager'
import { IBasicElementOptions } from './BasicElement'

// interface

// class
export class ProgressBar {
  private flowUpdateCallback: (e?: any) => void;

  public el: HTMLElement;

  private bar: HTMLElement;

  private eventTarget: EventDispatcher;

  constructor(options: IBasicElementOptions) {
    this.flowUpdateCallback = this.onFlowUpdate.bind(this)
    this.eventTarget = options.eventTarget
    this.eventTarget.addEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false)
    this.eventTarget.addEventListener(FlowEvents.FORM_SUBMIT, () => this.setWidth(100), false)

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
    this.eventTarget.removeEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false)
    // @ts-ignore
    this.flowUpdateCallback = null
  }
}
