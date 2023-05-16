/* eslint-disable @typescript-eslint/no-unused-vars */
/*
Copyright (c) 2013-2018 SPACE10
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
Copyright (c) 2023 YU TECNOLOGIA E CONSULTORIA EM CAPITAL HUMANO LTDA.
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/// <reference types="node" />
/* eslint-disable max-len */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */
import { ConversationalForm } from '../../ConversationalForm'
import { Dictionary } from '../../data/Dictionary'
import { ITag } from '../../form-tags/Tag'
import { ITagGroup } from '../../form-tags/TagGroup'
import { FlowDTO, FlowEvents } from '../../logic/FlowManager'
import { BasicElement, IBasicElementOptions } from '../BasicElement'
import { ControlElementsEvents } from '../control-elements/ControlElements'
import { UserInputElement, UserInputEvents } from '../inputs/UserInputElement'
import { InputKeyChangeDTO } from '../inputs/UserTextInput'
import { ChatResponse } from './ChatResponse'

// interface
export const ChatListEvents = {
  CHATLIST_UPDATED: 'cf-chatlist-updated'
}

// class
export class ChatList extends BasicElement {
  private flowUpdateCallback: (event: CustomEvent<any>) => void

  private userInputUpdateCallback: (event: CustomEvent<any>) => void

  private onInputKeyChangeCallback: (event: CustomEvent<any>) => void

  private onInputHeightChangeCallback: (event: CustomEvent<any>) => void

  private onControlElementsResizedCallback: (event: CustomEvent<any>) => void

  private onControlElementsChangedCallback: (event: CustomEvent<any>) => void

  private currentResponse!: ChatResponse

  private currentUserResponse!: ChatResponse

  private flowDTOFromUserInputUpdate!: FlowDTO

  private responses: Array<ChatResponse>

  private input!: UserInputElement

  constructor(options: IBasicElementOptions) {
    super(options)

    ChatResponse.list = this

    this.responses = []

    // flow update
    this.flowUpdateCallback = this.onFlowUpdate.bind(this)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.eventTarget.addEventListener(
      FlowEvents.FLOW_UPDATE,
      this.flowUpdateCallback as EventListenerOrEventListenerObject | null,
      false
    )

    // user input update
    this.userInputUpdateCallback = this.onUserInputUpdate.bind(this)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.eventTarget.addEventListener(
      FlowEvents.USER_INPUT_UPDATE,
      this.userInputUpdateCallback as EventListenerOrEventListenerObject | null,
      false
    )

    // user input key change
    this.onInputKeyChangeCallback = this.onInputKeyChange.bind(this)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.eventTarget.addEventListener(
      UserInputEvents.KEY_CHANGE,
      this
        .onInputKeyChangeCallback as EventListenerOrEventListenerObject | null,
      false
    )

    // user input height change
    this.onInputHeightChangeCallback = this.onInputHeightChange.bind(this)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.eventTarget.addEventListener(
      UserInputEvents.HEIGHT_CHANGE,
      this
        .onInputHeightChangeCallback as EventListenerOrEventListenerObject | null,
      false
    )

    // on control elements changed
    this.onControlElementsResizedCallback =
      this.onControlElementsResized.bind(this)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.eventTarget.addEventListener(
      ControlElementsEvents.ON_RESIZE,
      this
        .onControlElementsResizedCallback as EventListenerOrEventListenerObject | null,
      false
    )

    this.onControlElementsChangedCallback =
      this.onControlElementsChanged.bind(this)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.eventTarget.addEventListener(
      ControlElementsEvents.CHANGED,
      this
        .onControlElementsChangedCallback as EventListenerOrEventListenerObject | null,
      false
    )
  }

  private onInputHeightChange(event: CustomEvent) {
    const { dto } = event.detail as InputKeyChangeDTO
    ConversationalForm.illustrateFlow(this, 'receive', event.type, dto)

    // this.input.controlElements.el.style.transition = "height 2s ease-out";
    // this.input.controlElements.el.style.height = this.input.controlElements.el.scrollHeight + 'px';

    this.onInputElementChanged()
  }

  private onInputKeyChange(event: CustomEvent) {
    const { dto } = event.detail as InputKeyChangeDTO
    ConversationalForm.illustrateFlow(this, 'receive', event.type, dto)
  }

  private onUserInputUpdate(event: CustomEvent) {
    ConversationalForm.illustrateFlow(this, 'receive', event.type, event.detail)

    if (this.currentUserResponse) {
      const response: FlowDTO = event.detail
      this.setCurrentUserResponse(response)
    }
  }

  public addInput(input: UserInputElement): void {
    this.input = input
  }

  /**
   * @name onControlElementsChanged
   * on control elements change
   */
  private onControlElementsChanged(_event: Event): void {
    this.onInputElementChanged()
  }

  /**
   * @name onControlElementsResized
   * on control elements resize
   */
  private onControlElementsResized(_event: Event): void {
    ConversationalForm.illustrateFlow(
      this,
      'receive',
      ControlElementsEvents.ON_RESIZE
    )
    let responseToScrollTo: ChatResponse = this.currentResponse
    if (responseToScrollTo) {
      if (!responseToScrollTo.added) {
        // element not added yet, so find closest
        for (let i = this.responses.indexOf(responseToScrollTo); i >= 0; i--) {
          const element: ChatResponse = this.responses[i] as ChatResponse
          if (element.added) {
            responseToScrollTo = element
            break
          }
        }
      }

      responseToScrollTo.scrollTo()
    }

    this.onInputElementChanged()
  }

  private onInputElementChanged() {
    // if (!this.cfReference || !this.cfReference.el) return
    // const cfHeight: number = this.cfReference.el.offsetHeight
    // const inputHeight: number = this.input.height
    // const listHeight: number = cfHeight - inputHeight
    // this.el.style.height = listHeight + "px";
  }

  private onFlowUpdate(event: CustomEvent) {
    ConversationalForm.illustrateFlow(this, 'receive', event.type, event.detail)

    const currentTag = event.detail.tag as ITag | ITagGroup

    if (this.currentResponse) {
      this.currentResponse.disabled = false
    }

    if (
      this.containsTagResponse(currentTag) &&
      !event.detail.ignoreExistingTag
    ) {
      // because user maybe have scrolled up and wants to edit

      // tag is already in list, so re-activate it
      // TODO: Artificial response tags are not editable (because currentTag does not exist)
      // this should eventually be allowed using callbacks (onEdit(...))
      this.onUserWantsToEditTag(currentTag)
    } else {
      // robot response
      setTimeout(
        () => {
          const robot: ChatResponse = this.createResponse(
            true,
            currentTag,
            currentTag.question
          )
          robot.whenReady(() => {
            // create user response
            this.currentUserResponse = this.createResponse(false, currentTag)
            robot.scrollTo()
          })

          if (this.currentUserResponse) {
            // linked, but only if we should not ignore existing tag
            this.currentUserResponse.setLinkToOtherReponse(robot)
            robot.setLinkToOtherReponse(this.currentUserResponse)
          }
        },
        this.responses.length === 0 ? 500 : 0
      )
    }
  }

  /**
   * @name containsTagResponse
   * @return boolean
   * check if tag has already been responded to
   */
  private containsTagResponse(tagToChange: ITag): boolean {
    for (let i = 0; i < this.responses.length; i++) {
      const element = this.responses[i] as ChatResponse
      if (
        !element.isRobotResponse &&
        element.tag === tagToChange &&
        !tagToChange.hasConditions()
      ) {
        return true
      }
    }

    return false
  }

  /**
   * @name onUserAnswerClicked
   * on user ChatReponse clicked
   */
  private onUserWantsToEditTag(tagToChange: ITag): void {
    let responseUserWantsToEdit: ChatResponse | undefined
    for (let i = 0; i < this.responses.length; i++) {
      const element: ChatResponse = this.responses[i] as ChatResponse
      if (!element.isRobotResponse && element.tag === tagToChange) {
        // update element thhat user wants to edit
        responseUserWantsToEdit = element
        break
      }
    }

    // reset the current user response
    this.currentUserResponse.processResponseAndSetText()

    if (responseUserWantsToEdit) {
      // remove latest user response, if it
      // is there any, also make sure we don't remove the first one
      if (this.responses.length > 2) {
        if (!this.responses[this.responses.length - 1]?.isRobotResponse) {
          this.responses.pop()?.dealloc()
        }

        // remove latest robot response, it should always be a robot response
        this.responses.pop()?.dealloc()
      }

      this.currentUserResponse = responseUserWantsToEdit

      // TODO: Set user field to thinking?
      // this.currentUserResponse.setToThinking??

      this.currentResponse = this.responses[
        this.responses.length - 1
      ] as ChatResponse

      this.onListUpdate(this.currentUserResponse)
    }
  }

  private updateTimer: number | NodeJS.Timeout = 0

  private onListUpdate(chatResponse: ChatResponse) {
    clearTimeout(this.updateTimer as number)

    this.updateTimer = setTimeout(() => {
      this.eventTarget.dispatchEvent(
        new CustomEvent(ChatListEvents.CHATLIST_UPDATED, {
          detail: this
        })
      )
      chatResponse.show()
    }, 0)
  }

  /**
   * remove responses, this usually happens if a user jumps back to a conditional element
   */
  public clearFrom(index: number): void {
    let i = index
    i *= 2 // double up because of robot responses
    i += i % 2 // round up so we dont remove the user response element

    while (this.responses.length > i) {
      this.responses.pop()?.dealloc()
    }
  }

  /**
   * Update current reponse, is being called automatically from onFlowUpdate
   * but can also, in rare cases, be called when flow is controlled manually.
   * reponse: FlowDTO
   */
  public setCurrentUserResponse(dto: FlowDTO): void {
    this.flowDTOFromUserInputUpdate = dto

    if (!this.flowDTOFromUserInputUpdate.text && dto.tag) {
      if (dto.tag.type === 'group') {
        this.flowDTOFromUserInputUpdate.text = Dictionary.get(
          'user-reponse-missing-group'
        )
      } else if (dto.tag.type !== 'password') {
        this.flowDTOFromUserInputUpdate.text = Dictionary.get(
          'user-reponse-missing'
        )
      }
    }

    this.currentUserResponse.setValue(this.flowDTOFromUserInputUpdate)
  }

  /**
   * returns the submitted responses.
   */
  public getResponses(): Array<ChatResponse> {
    return this.responses
  }

  public updateThumbnail(robot: boolean, img: string): void {
    Dictionary.set(
      robot ? 'robot-image' : 'user-image',
      robot ? 'robot' : 'human',
      img
    )

    const newImage: string = robot
      ? Dictionary.getRobotResponse('robot-image')
      : Dictionary.get('user-image')
    for (let i = 0; i < this.responses.length; i++) {
      const element: ChatResponse = this.responses[i] as ChatResponse
      if (robot && element.isRobotResponse) {
        element.updateThumbnail(newImage)
      } else if (!robot && !element.isRobotResponse) {
        element.updateThumbnail(newImage)
      }
    }
  }

  public createResponse(
    isRobotResponse: boolean,
    currentTag?: ITag,
    value?: string
  ): ChatResponse {
    const scrollable = this.el.querySelector('.scrollableInner') as HTMLElement
    const response: ChatResponse = new ChatResponse({
      // image: null,
      cfReference: this.cfReference,
      list: this,
      tag: currentTag,
      eventTarget: this.eventTarget,
      isRobotResponse,
      response: value || '',
      image: isRobotResponse
        ? Dictionary.getRobotResponse('robot-image')
        : Dictionary.get('user-image'),
      container: scrollable
    })

    this.responses.push(response)

    this.currentResponse = response

    this.onListUpdate(response)

    return response
  }

  public getTemplate(): string {
    return `<cf-chat type='pluto'>
            <scrollable>
              <div class="scrollableInner"></div>
            </scrollable>
          </cf-chat>`
  }

  public dealloc(): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.eventTarget.removeEventListener(
      FlowEvents.FLOW_UPDATE,
      this.flowUpdateCallback as EventListenerOrEventListenerObject | null,
      false
    )
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.flowUpdateCallback = null

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.eventTarget.removeEventListener(
      FlowEvents.USER_INPUT_UPDATE,
      this.userInputUpdateCallback as EventListenerOrEventListenerObject | null,
      false
    )
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.userInputUpdateCallback = null

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.eventTarget.removeEventListener(
      UserInputEvents.KEY_CHANGE,
      this
        .onInputKeyChangeCallback as EventListenerOrEventListenerObject | null,
      false
    )
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.onInputKeyChangeCallback = null
    super.dealloc()
  }
}
