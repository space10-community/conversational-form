/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable max-len */
/* eslint-disable class-methods-use-this */
// interface

import { IUserInput } from '../../interfaces/IUserInput'
import { EventDispatcher } from '../../logic/EventDispatcher'
import { FlowDTO, FlowEvents } from '../../logic/FlowManager'
import { MicrophoneBridge, MicrophoneBridgeEvent } from '../../logic/MicrophoneBridge'

export interface UserInputSubmitButtonOptions {
  eventTarget: EventDispatcher;
}

export const UserInputSubmitButtonEvents = {
  CHANGE: 'userinput-submit-button-change-value'
}

// class
export class UserInputSubmitButton {
  private onClickCallback: (e?: any) => void;

  private eventTarget: EventDispatcher;

  private mic!: MicrophoneBridge;

  private _active = true;

  private onMicrophoneTerminalErrorCallback: (e?: any) => void;

  public el: HTMLElement;

  public set typing(value: boolean) {
    if (value) {
      this.el.classList.add('typing')
      this.loading = false
      if (this.mic) {
        this.mic.cancel()
      }
    } else {
      this.el.classList.remove('typing')
      if (this.mic) {
        this.mic.callInput()
      }
    }
  }

  public get typing(): boolean {
    return this.el.classList.contains('typing')
  }

  public set active(value: boolean) {
    this._active = value
    if (this.mic) {
      this.mic.active = value
    }
  }

  public get active(): boolean {
    return this._active
  }

  public set loading(value: boolean) {
    if (value) { this.el.classList.add('loading') } else { this.el.classList.remove('loading') }
  }

  public get loading(): boolean {
    return this.el.classList.contains('loading')
  }

  constructor(options: UserInputSubmitButtonOptions) {
    this.eventTarget = options.eventTarget

    const template: HTMLTemplateElement = document.createElement('template')
    template.innerHTML = this.getTemplate()
    this.el = template.firstChild as HTMLElement || template.content.firstChild as HTMLElement

    this.onClickCallback = this.onClick.bind(this)
    this.el.addEventListener('click', this.onClickCallback, false)

    this.onMicrophoneTerminalErrorCallback = this.onMicrophoneTerminalError.bind(this)
    this.eventTarget.addEventListener(MicrophoneBridgeEvent.TERMNIAL_ERROR, this.onMicrophoneTerminalErrorCallback, false)
  }

  public addMicrophone(microphoneObj: IUserInput): void {
    this.el.classList.add('microphone-interface')
    const template: HTMLTemplateElement = document.createElement('template')
    template.innerHTML = `<div class="cf-input-icons cf-microphone">
        <div class="cf-icon-audio"></div>
        <cf-icon-audio-eq></cf-icon-audio-eq>
      </div>`
    const mic: HTMLElement = template.firstChild as HTMLElement || template.content.firstChild as HTMLElement

    this.mic = new MicrophoneBridge({
      el: mic,
      button: this,
      eventTarget: this.eventTarget,
      microphoneObj
    })

    this.el.appendChild(mic)
  }

  public reset(): void {
    if (this.mic && !this.typing) {
      // if microphone and not typing
      this.mic.callInput()
    }
  }

  public getTemplate(): string {
    return `<cf-input-button class="cf-input-button">
            <div class="cf-input-icons">
              <div class="cf-icon-progress"></div>
              <div class="cf-icon-attachment"></div>
            </div>
          </cf-input-button>`
  }

  protected onMicrophoneTerminalError(event: CustomEvent): void {
    if (this.mic) {
      this.mic.dealloc()
      // @ts-ignore
      this.mic = null
      this.el.removeChild(this.el.getElementsByClassName('cf-microphone')[0])

      this.el.classList.remove('microphone-interface')
      this.loading = false

      this.eventTarget.dispatchEvent(new CustomEvent(FlowEvents.USER_INPUT_INVALID, {
        detail: {
          errorText: event.detail
        } as FlowDTO // UserTextInput value
      }))
    }
  }

  private onClick(event: MouseEvent) {
    const isMicVisible: boolean = this.mic && !this.typing
    if (isMicVisible) {
      this.mic.callInput()
    } else {
      this.eventTarget.dispatchEvent(new CustomEvent(UserInputSubmitButtonEvents.CHANGE))
    }
  }

  /**
  * @name click
  * force click on button
  */
  public click(): void {
    this.el.click()
  }

  /**
  * @name dealloc
  * remove instance
  */
  public dealloc(): void {
    this.eventTarget.removeEventListener(
      MicrophoneBridgeEvent.TERMNIAL_ERROR, this.onMicrophoneTerminalErrorCallback, false
    )
    // @ts-ignore
    this.onMicrophoneTerminalErrorCallback = null

    if (this.mic) {
      this.mic.dealloc()
    }
    // @ts-ignore
    this.mic = null

    this.el.removeEventListener('click', this.onClickCallback, false)
    // @ts-ignore
    this.onClickCallback = null
    // @ts-ignore
    this.el = null
    // @ts-ignore
    this.eventTarget = null
  }
}
