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

import { ConversationalForm } from '../ConversationalForm'
import { ConditionalValue, ITag, Tag } from '../form-tags/Tag'
import { ITagGroup } from '../form-tags/TagGroup'
import { IControlElement } from '../ui/control-elements/ControlElement'
import { UserInputElement, UserInputEvents } from '../ui/inputs/UserInputElement'
import { EventDispatcher } from './EventDispatcher'

export interface FlowDTO {
  tag?: ITag | ITagGroup,
  text?: string;
  errorText?: string;
  input?: UserInputElement,
  controlElements?: Array<IControlElement>;
}

export type FlowStepCallback = (
  dto: FlowDTO,
  success: () => void,
  error: (optionalErrorMessage?: string) => void
) => void;

export interface FlowManagerOptions {
  cfReference: ConversationalForm;
  eventTarget: EventDispatcher;
  tags: Array<ITag>;
  flowStepCallback?: FlowStepCallback;
}

export const FlowEvents = {
  USER_INPUT_UPDATE: 'cf-flow-user-input-update',
  USER_INPUT_INVALID: 'cf-flow-user-input-invalid',
  FLOW_UPDATE: 'cf-flow-update',
  FORM_SUBMIT: 'cf-form-submit'
}

export class FlowManager {
  private static STEP_TIME = 1000;

  private flowStepCallback?: FlowStepCallback;

  private eventTarget: EventDispatcher;

  private cfReference: ConversationalForm;

  private tags!: Array<ITag | ITagGroup>;

  private stopped = false;

  private maxSteps = 0;

  private step = 0;

  private savedStep = -1;

  private stepTimer = 0;

  tagRefreshCallback?: (tag: Tag) => void

  /**
  * ignore existing tags, usually this is set to true when using startFrom,
  * where you don't want it to check for exisintg tags in the list
  */
  private ignoreExistingTags = false;

  private userInputSubmitCallback: (event: CustomEvent<any>) => void;

  public get currentTag(): ITag | ITagGroup {
    return this.tags[this.step]
  }

  constructor(options: FlowManagerOptions) {
    this.cfReference = options.cfReference
    this.eventTarget = options.eventTarget

    if (options.flowStepCallback) {
      this.flowStepCallback = options.flowStepCallback
    }

    this.setTags(options.tags)

    this.userInputSubmitCallback = this.userInputSubmit.bind(this)

    // TODO: Hacky ts-ignore, CustomEvent vs Event shenanigans
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.eventTarget.addEventListener(UserInputEvents.SUBMIT, this.userInputSubmitCallback, false)
  }

  public userInputSubmit(event: CustomEvent): void {
    ConversationalForm.illustrateFlow(this, 'receive', event.type, event.detail)

    let appDTO: FlowDTO = event.detail
    if (!appDTO.tag) { appDTO.tag = this.currentTag }

    let isTagValid: boolean = this.currentTag.setTagValueAndIsValid(appDTO)
    let hasCheckedForTagSpecificValidation = false
    let hasCheckedForGlobalFlowValidation = false

    const onValidationCallback = () => {
      // check 1
      if (this.currentTag.validationCallback && typeof this.currentTag.validationCallback === 'function') {
        if (!hasCheckedForTagSpecificValidation && isTagValid) {
          hasCheckedForTagSpecificValidation = true
          this.currentTag.validationCallback(appDTO, () => {
            isTagValid = true
            onValidationCallback()
          }, (optionalErrorMessage?: string) => {
            isTagValid = false
            if (optionalErrorMessage) { appDTO.errorText = optionalErrorMessage }
            onValidationCallback()
          })

          return
        }
      }

      // check 2, this.currentTag.required <- required should be handled in the callback.
      if (this.flowStepCallback && typeof this.flowStepCallback === 'function') {
        if (!hasCheckedForGlobalFlowValidation && isTagValid) {
          hasCheckedForGlobalFlowValidation = true
          // use global validationCallback method
          this.flowStepCallback(appDTO, () => {
            isTagValid = true
            onValidationCallback()
          }, (optionalErrorMessage?: string) => {
            isTagValid = false
            if (optionalErrorMessage) { appDTO.errorText = optionalErrorMessage }
            onValidationCallback()
          })

          return
        }
      }

      // go on with the flow
      if (isTagValid) {
        // do the normal flow..
        ConversationalForm.illustrateFlow(this, 'dispatch', FlowEvents.USER_INPUT_UPDATE, appDTO)

        // update to latest DTO because values can be changed in validation flow...
        if (appDTO.input) { appDTO = appDTO.input.getFlowDTO() }

        this.eventTarget.dispatchEvent(new CustomEvent(FlowEvents.USER_INPUT_UPDATE, {
          detail: appDTO // UserTextInput value
        }))

        // goto next step when user has answered
        setTimeout(() => this.nextStep(), ConversationalForm.animationsEnabled ? 250 : 0)
      } else {
        ConversationalForm.illustrateFlow(this, 'dispatch', FlowEvents.USER_INPUT_INVALID, appDTO)

        // Value not valid
        this.eventTarget.dispatchEvent(new CustomEvent(FlowEvents.USER_INPUT_INVALID, {
          detail: appDTO // UserTextInput value
        }))
      }
    }

    // TODO, make into promises when IE is rolling with it..
    onValidationCallback()
  }

  public startFrom(indexOrTag: number | ITag, ignoreExistingTags = false): void {
    if (typeof indexOrTag === 'number') { this.step = indexOrTag } else {
      // find the index..
      this.step = this.tags.indexOf(indexOrTag)
    }

    this.ignoreExistingTags = ignoreExistingTags
    if (!this.ignoreExistingTags) {
      this.editTag(this.tags[this.step])
    } else {
      // validate step, and ask for skipping of current step
      this.showStep()
    }
  }

  /**
  * @name editTag
  * @param tagWithConditions, the tag containing conditions (can contain multiple)
  * @param tagConditions, the conditions of the tag to be checked
  */

  private activeConditions: any;

  public areConditionsInFlowFullfilled(
    tagWithConditions: ITag,
    tagConditions: Array<ConditionalValue>
  ): boolean {
    if (!this.activeConditions) {
      // we don't use this (yet), it's only to keep track of active conditions
      this.activeConditions = []
    }

    let numConditionsFound = 0
    // find out if tagWithConditions fullfills conditions
    for (let i = 0; i < this.tags.length; i++) {
      const tag: ITag | ITagGroup = this.tags[i]
      if (tag !== tagWithConditions) {
        // check if tags are fullfilled
        for (let j = 0; j < tagConditions.length; j++) {
          const tagCondition: ConditionalValue = tagConditions[j]
          // only check tags where tag id or name is defined
          const tagName: string = (tag.name || tag.id || '').toLowerCase()
          if (tagName !== '' && `cf-conditional-${tagName}` === tagCondition.key.toLowerCase()) {
            // key found, so check condition
            const flowTagValue: string | string[] = typeof tag.value === 'string' ? (tag as ITag).value as string : (tag as ITagGroup).value as string[]
            const areConditionsMeet: boolean = Tag.testConditions(flowTagValue, tagCondition)
            if (areConditionsMeet) {
              this.activeConditions[tagName] = tagConditions
              // conditions are meet
              if (++numConditionsFound === tagConditions.length) {
                return true
              }
            }
          }
        }
      }
    }

    return false
  }

  public start(): void {
    this.stopped = false
    this.validateStepAndUpdate()
  }

  public stop(): void {
    this.stopped = true
  }

  public nextStep(): void {
    if (this.stopped) { return }

    if (this.savedStep !== -1) {
      // if you are looking for where the none EDIT tag conditionsl check is done
      // then look at a tags disabled getter

      let foundConditionsToCurrentTag = false
      // this happens when editing a tag..

      // check if any tags has a conditional check for this.currentTag.name
      for (let i = 0; i < this.tags.length; i++) {
        const tag: ITag | ITagGroup = this.tags[i]
        if (tag !== this.currentTag && tag.hasConditions()) {
          // tag has conditions so check if it also has the right conditions
          if (tag.hasConditionsFor(this.currentTag.name)) {
            foundConditionsToCurrentTag = true
            this.step = this.tags.indexOf(this.currentTag)
            break
          }
        }
      }

      // no conditional linking found, so resume flow
      if (!foundConditionsToCurrentTag) {
        this.step = this.savedStep
      }
    }

    this.savedStep = -1// reset saved step

    this.step++

    this.validateStepAndUpdate()
  }

  public previousStep(): void {
    this.step--
    this.validateStepAndUpdate()
  }

  public getStep(): number {
    return this.step
  }

  public addTags(tags: Array<ITag | ITagGroup>, atIndex = -1): Array<ITag | ITagGroup> {
    // used to append new tag
    if (atIndex !== -1 && atIndex < this.tags.length) {
      // const pre: Array<ITag | ITagGroup> = this.tags.slice(0, atIndex)
      const post: Array<ITag | ITagGroup> = this.tags.slice(atIndex, this.tags.length)
      this.tags = this.tags.slice(0, atIndex).concat(tags).concat(post)
    } else {
      this.tags = this.tags.concat(tags)
    }

    this.setTags(this.tags)

    return this.tags
  }

  public dealloc(): void {
    this.eventTarget.removeEventListener(
      UserInputEvents.SUBMIT,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.userInputSubmitCallback,
      false
    )
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.userInputSubmitCallback = null
  }

  /**
  * @name editTag
  * go back in time and edit a tag.
  */
  public editTag(tag: ITag): void {
    this.ignoreExistingTags = false
    this.savedStep = this.step - 1// save step
    this.step = this.tags.indexOf(tag) // === this.currentTag
    this.validateStepAndUpdate()

    if (this.activeConditions && Object.keys(this.activeConditions).length > 0) {
      this.savedStep = -1// don't save step, as we wont return

      // clear chatlist.
      this.cfReference.chatList?.clearFrom(this.step + 1)

      // reset from active tag, brute force
      const editTagIndex: number = this.tags.indexOf(tag)
      for (let i = editTagIndex + 1; i < this.tags.length; i++) {
        this.tags[i].reset()
      }
    }
  }

  private setTags(tags: Array<ITag | ITagGroup>) {
    this.tags = tags

    for (let i = 0; i < this.tags.length; i++) {
      const tag: ITag | ITagGroup = this.tags[i]
      tag.eventTarget = this.eventTarget
      tag.flowManager = this
    }

    this.maxSteps = this.tags.length
  }

  private skipStep() {
    this.nextStep()
  }

  private validateStepAndUpdate() {
    if (this.maxSteps > 0) {
      if (this.step === this.maxSteps) {
        // console.warn("We are at the end..., submit click")
        this.eventTarget.dispatchEvent(new CustomEvent(FlowEvents.FORM_SUBMIT, {}))
        this.cfReference.doSubmitForm()
      } else {
        this.step %= this.maxSteps

        if (this.currentTag?.disabled) {
          // check if current tag has become or is disabled, if it is, then skip step.
          this.skipStep()
        } else {
          this.showStep()
        }
      }
    }
  }

  private showStep() {
    if (this.stopped) { return }

    ConversationalForm.illustrateFlow(this, 'dispatch', FlowEvents.FLOW_UPDATE, this.currentTag)

    this.currentTag?.refresh()

    setTimeout(() => {
      this.eventTarget.dispatchEvent(new CustomEvent(FlowEvents.FLOW_UPDATE, {
        detail: {
          tag: this?.currentTag,
          ignoreExistingTag: this.ignoreExistingTags,
          step: this.step,
          maxSteps: this.maxSteps
        }
      }))
    }, 0)
  }
}
