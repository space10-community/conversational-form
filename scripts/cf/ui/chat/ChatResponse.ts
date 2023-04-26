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

/* eslint-disable prefer-destructuring */
import { ConversationalForm } from '../../ConversationalForm'
import { ITag } from '../../form-tags/Tag'
import { IUserInterfaceOptions } from '../../interfaces/IUserInterfaceOptions'
import { FlowDTO } from '../../logic/FlowManager'
import { Helpers } from '../../logic/Helpers'
import { BasicElement, IBasicElementOptions } from '../BasicElement'
import { ChatList } from './ChatList'

export interface IChatResponseOptions extends IBasicElementOptions {
  response: string
  image: string
  list: ChatList
  isRobotResponse: boolean
  tag?: ITag
  container: HTMLElement
}

export const ChatResponseEvents = {
  USER_ANSWER_CLICKED: 'cf-on-user-answer-clicked'
}

export class ChatResponse extends BasicElement {
  public static list: ChatList

  private static THINKING_MARKUP =
    "<p class='show'><thinking><span>.</span><span>.</span><span>.</span></thinking></p>"

  public isRobotResponse!: boolean

  public response!: string

  public originalResponse!: string // keep track of original response with id pipings

  public parsedResponse!: string

  private uiOptions!: IUserInterfaceOptions

  private textEl!: Element

  private image!: string

  private container: HTMLElement

  private _tag?: ITag

  private readyTimer: any

  private responseLink!: ChatResponse // robot reference from use

  private onReadyCallback!: () => void

  private onClickCallback!: () => void

  public get tag(): ITag | undefined {
    return this._tag
  }

  public get added(): boolean {
    return !!(this.el.parentNode?.parentNode || this.el.parentNode || this.el)
  }

  public get disabled(): boolean {
    return this.el.classList.contains('disabled')
  }

  public set disabled(value: boolean) {
    if (value) {
      this.el.classList.add('disabled')
    } else {
      this.el.classList.remove('disabled')
    }
  }

  /**
   * We depend on scroll in a column-reverse flex container.
   * This is where Edge and Firefox comes up short
   */
  private hasFlexBug(): boolean {
    return !!(
      this.cfReference?.el?.classList.contains('browser-firefox') ||
      this.cfReference?.el?.classList.contains('browser-edge')
    )
  }

  private animateIn() {
    const outer = document.querySelector('scrollable') as HTMLElement
    const inner = document.querySelector('.scrollableInner') as HTMLElement

    if (this.hasFlexBug()) {
      inner.classList.remove('scroll')
    }

    requestAnimationFrame(() => {
      const height = this.el.scrollHeight
      this.el.style.height = '0px'
      requestAnimationFrame(() => {
        this.el.style.height = `${height}px`
        this.el.classList.add('show')

        // Listen for transitionend and set to height:auto
        try {
          const sm = window.getComputedStyle(document.querySelectorAll('p.show')[0])
          const cssAnimationTime: number = +sm.animationDuration.replace('s', '') // format '0.234234xs
          const cssAnimationDelayTime: number = +sm.animationDelay.replace('s', '')
          setTimeout(() => {
            this.el.style.height = 'auto'

            if (this.hasFlexBug() && inner.scrollHeight > outer.offsetHeight) {
              inner.classList.add('scroll')
              inner.scrollTop = inner.scrollHeight
            }
          }, (cssAnimationTime + cssAnimationDelayTime) * 1500)
        } catch (err) {
          // Fallback method. Assuming animations do not take longer than 1000ms
          setTimeout(() => {
            if (this.hasFlexBug() && inner.scrollHeight > outer.offsetHeight) {
              inner.classList.add('scroll')
              inner.scrollTop = inner.scrollHeight
            }
            this.el.style.height = 'auto'
          }, 3000)
        }
      })
    })
  }

  public set visible(value: boolean) {
    // empty
  }

  public get strippedSesponse(): string {
    const html = this.response
    // use browsers native way of stripping
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
  }

  constructor(options: IChatResponseOptions) {
    super(options)
    this.container = options.container

    if (options.cfReference?.uiOptions) {
      this.uiOptions = options.cfReference?.uiOptions
    }

    if (options.tag) {
      this._tag = options.tag
    }
  }

  public whenReady(resolve: () => void): void {
    this.onReadyCallback = resolve
  }

  public setValue(dto?: FlowDTO): void {
    if (!dto) {
      this.setToThinking()
    } else {
      // same same
      this.response = this.originalResponse
      this.originalResponse = dto.text || ''

      this.processResponseAndSetText()

      if (this.responseLink && !this.isRobotResponse) {
        // call robot and update for binding values ->
        this.responseLink.processResponseAndSetText()
      }

      // check for if response type is file upload...
      if (dto && dto.controlElements && dto.controlElements[0]) {
        switch (dto.controlElements[0].type) {
          case 'UploadFileUI':
            this.textEl.classList.add('file-icon')
            break
          default:
            break
        }
      }

      if (!this.isRobotResponse && !this.onClickCallback) {
        // edit
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.onClickCallback = this.onClick.bind(this)
        this.el.addEventListener(Helpers.getMouseEvent('click'), this.onClickCallback, false)
      }
    }
  }

  public show(): void {
    this.visible = true
    this.disabled = false

    if (!this.response) {
      this.setToThinking()
    } else {
      this.checkForEditMode()
    }
  }

  public updateThumbnail(src: string): void {
    const thumbEl = this.el.getElementsByTagName('thumb')[0] as HTMLElement

    if (src.indexOf('text:') === 0) {
      const thumbElSpan = thumbEl.getElementsByTagName('span')[0] as HTMLElement
      thumbElSpan.innerHTML = src.split('text:')[1]
      thumbElSpan.setAttribute('length', src.length.toString())
    } else {
      this.image = src
      thumbEl.style.backgroundImage = `url("${this.image}")`
    }
  }

  public setLinkToOtherReponse(response: ChatResponse): void {
    // link reponse to another one, keeping the update circle complete.
    this.responseLink = response
  }

  public processResponseAndSetText(): void {
    if (!this.originalResponse) {
      return
    }

    let innerResponse: string = this.originalResponse

    if (this._tag && this._tag.type === 'password' && !this.isRobotResponse) {
      let newStr = ''
      for (let i = 0; i < innerResponse.length; i++) {
        newStr += '*'
      }
      innerResponse = newStr
    }

    // if robot, then check linked response for binding values
    if (this.responseLink && this.isRobotResponse) {
      // one way data binding values:
      innerResponse = innerResponse
        .split('{previous-answer}')
        .join(this.responseLink.parsedResponse)
    }

    if (this.isRobotResponse) {
      // Piping, look through IDs, and map values to dynamics
      const reponses: Array<ChatResponse> = ChatResponse.list.getResponses()
      for (let i = 0; i < reponses.length; i++) {
        const response: ChatResponse = reponses[i]
        if (response !== this) {
          if (response.tag) {
            // check for id, standard
            if (response.tag.id) {
              innerResponse = innerResponse
                .split(`{${response.tag.id}}`)
                .join(response.tag.value as string)
            }

            // fallback check for name
            if (response.tag.name) {
              innerResponse = innerResponse
                .split(`{${response.tag.name}}`)
                .join(response.tag.value as string)
            }
          }
        }
      }
    }

    // check if response contains an image as answer
    const responseContains: boolean = innerResponse.indexOf('contains-image') !== -1
    if (responseContains) {
      this.textEl.classList.add('contains-image')
    }
    // now set it
    if (this.isRobotResponse) {
      this.textEl.innerHTML = ''

      // On edit uiOptions are empty, so this mitigates the problem. Not ideal.
      if (!this.uiOptions && this.cfReference?.uiOptions) {
        this.uiOptions = this.cfReference.uiOptions
      }

      const robotInitResponseTime: number = this.uiOptions.robot?.robotResponseTime || 0

      if (robotInitResponseTime !== 0) {
        this.setToThinking()
      }

      // robot response, allow for && for multiple responses
      const chainedResponses: Array<string> = innerResponse.split('&&')

      if (robotInitResponseTime === 0) {
        for (let i = 0; i < chainedResponses.length; i++) {
          const str: string = chainedResponses[i] as string
          this.textEl.innerHTML += `<p>${str}</p>`
        }
        for (let i = 0; i < chainedResponses.length; i++) {
          const timeout =
            chainedResponses.length > 1 && i > 0
              ? robotInitResponseTime + (i + 1) * (this.uiOptions.robot?.chainedResponseTime || 1)
              : 0

          setTimeout(() => {
            this.tryClearThinking()
            const p = this.textEl.getElementsByTagName('p')
            p[i].classList.add('show')
            this.scrollTo()
          }, timeout)
        }
      } else {
        for (let i = 0; i < chainedResponses.length; i++) {
          const revealAfter =
            robotInitResponseTime + i * (this.uiOptions?.robot?.chainedResponseTime || 1)

          const str: string = chainedResponses[i] as string
          setTimeout(() => {
            this.tryClearThinking()
            this.textEl.innerHTML += `<p>${str}</p>`
            const p = this.textEl.getElementsByTagName('p')
            p[i].classList.add('show')
            this.scrollTo()
          }, revealAfter)
        }
      }

      this.readyTimer = setTimeout(() => {
        if (this.onReadyCallback) {
          this.onReadyCallback()
        }

        // reset, as it can be called again
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.onReadyCallback = null

        if (this._tag && this._tag.skipUserInput === true) {
          setTimeout(() => {
            if (this._tag) {
              this._tag.flowManager.nextStep()
              // to avoid nextStep being fired again as this
              // would make the flow jump too far when editing a response
              this._tag.skipUserInput = false
            }
          }, this.uiOptions?.robot?.chainedResponseTime)
        }
      }, robotInitResponseTime + chainedResponses.length * (this.uiOptions?.robot?.chainedResponseTime || 1))
    } else {
      // user response, act normal
      this.tryClearThinking()

      const hasImage = innerResponse.indexOf('<img') > -1
      const imageRegex = new RegExp('<img[^>]*?>', 'g')
      const imageTag = innerResponse.match(imageRegex)
      if (hasImage && imageTag) {
        innerResponse = innerResponse.replace(imageTag[0], '')
        this.textEl.innerHTML = `<p class="hasImage">${imageTag}<span>${innerResponse}</span></p>`
      } else {
        this.textEl.innerHTML = `<p>${innerResponse}</p>`
      }

      const p = this.textEl.getElementsByTagName('p')
      p[p.length - 1].classList.add('show')
      this.scrollTo()
    }

    this.parsedResponse = innerResponse

    // }

    // value set, so add element, if not added
    if (this.uiOptions.robot && this.uiOptions.robot.robotResponseTime === 0) {
      this.addSelf()
    } else {
      setTimeout(() => {
        this.addSelf()
      }, 0)
    }

    // bounce
    this.textEl.removeAttribute('value-added')
    setTimeout(() => {
      this.textEl.setAttribute('value-added', '')
      this.el.classList.add('peak-thumb')
    }, 0)

    this.checkForEditMode()

    // update response
    // remove the double ampersands if present
    this.response = innerResponse.split('&&').join(' ')
  }

  public scrollTo(): void {
    const y: number = this.el.offsetTop
    const h: number = this.el.offsetHeight

    // On edit this.container is empty so this is a fix to reassign it. Not ideal, but...
    if (!this.container && this.el) this.container = this.el

    if (
      this.container &&
      this.container.parentElement &&
      this.container.parentElement.scrollHeight
    ) {
      this.container.parentElement.scrollTop = y + h + this.container.parentElement.scrollHeight
    }
  }

  private checkForEditMode() {
    if (!this.isRobotResponse && !this.el.hasAttribute('thinking')) {
      this.el.classList.add('can-edit')
      this.disabled = false
    }
  }

  private tryClearThinking() {
    if (this.el.hasAttribute('thinking')) {
      this.textEl.innerHTML = ''
      this.el.removeAttribute('thinking')
    }
  }

  private setToThinking() {
    const canShowThinking: boolean =
      (this.isRobotResponse && this.uiOptions?.robot?.robotResponseTime !== 0) ||
      (!this.isRobotResponse &&
        this.cfReference?.uiOptions?.user?.showThinking &&
        !this._tag?.skipUserInput) ||
      false
    if (canShowThinking) {
      this.textEl.innerHTML = ChatResponse.THINKING_MARKUP
      this.el.classList.remove('can-edit')
      this.el.setAttribute('thinking', '')
    }

    if (
      this.cfReference?.uiOptions?.user?.showThinking ||
      this.cfReference?.uiOptions?.user?.showThumb
    ) {
      this.addSelf()
    }
  }

  /**
   * @name addSelf
   * add one self to the chat list
   */
  private addSelf(): void {
    if (this.el.parentNode !== this.container) {
      this.container.appendChild(this.el)
      this.animateIn()
    }
  }

  /**
   * @name onClickCallback
   * click handler for el
   */
  private onClick(event: MouseEvent): void {
    this.setToThinking()

    ConversationalForm.illustrateFlow(
      this,
      'dispatch',
      ChatResponseEvents.USER_ANSWER_CLICKED,
      event
    )
    this.eventTarget.dispatchEvent(
      new CustomEvent(ChatResponseEvents.USER_ANSWER_CLICKED, {
        detail: this._tag
      })
    )
  }

  protected setData(options: IChatResponseOptions): void {
    this.image = options.image
    this.response = options.response
    this.originalResponse = options.response
    this.isRobotResponse = options.isRobotResponse

    super.setData(options)
  }

  protected onElementCreated(): void {
    this.textEl = this.el.getElementsByTagName('text')[0] as Element

    this.updateThumbnail(this.image)

    if (this.isRobotResponse || this.response != null) {
      // Robot is pseudo thinking, can also be user -->
      // , but if addUserChatResponse is called from
      // ConversationalForm, then the value is there, therefore skip ...
      setTimeout(() => {
        this.setValue({ text: this.response } as FlowDTO)
      }, 0)
      // ConversationalForm.animationsEnabled ? Helpers.lerp(Math.random(), 500, 900) : 0);
    } else if (this.cfReference?.uiOptions?.user?.showThumb) {
      this.el.classList.add('peak-thumb')
    }
  }

  public dealloc(): void {
    clearTimeout(this.readyTimer)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.container = null
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.uiOptions = null
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.onReadyCallback = null

    if (this.onClickCallback) {
      this.el.removeEventListener(Helpers.getMouseEvent('click'), this.onClickCallback, false)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.onClickCallback = null
    }

    super.dealloc()
  }

  // template, can be overwritten ...
  public getTemplate(): string {
    return `<cf-chat-response class="${this.isRobotResponse ? 'robot' : 'user'}">
        <thumb><span></span></thumb>
        <text></text>
      </cf-chat-response>`
  }
}
