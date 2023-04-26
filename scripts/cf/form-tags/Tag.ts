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

/* eslint-disable no-console */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-plusplus */
/* eslint-disable max-len */
// basic tag from form logic
// types:
// radio
// text
// email
// tel
// password
// checkbox
// radio
// select
// button

import { ConversationalForm } from '../ConversationalForm'
import { Dictionary } from '../data/Dictionary'
import { EventDispatcher } from '../logic/EventDispatcher'
import { FlowDTO, FlowManager } from '../logic/FlowManager'
import { Helpers } from '../logic/Helpers'
import { TagsParser } from '../parsing/TagsParser'
import { OptionTag } from './OptionTag'

export interface ITag {
  domElement?: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement | null
  type: string
  name: string
  id: string
  label: string
  question: string
  errorMessage: string
  setTagValueAndIsValid(dto: FlowDTO): boolean
  dealloc(): void
  refresh(): void
  reset(): void
  value: string | Array<string>
  inputPlaceholder?: string
  required: boolean
  defaultValue: string | number
  disabled: boolean
  skipUserInput: boolean
  eventTarget: EventDispatcher
  flowManager: FlowManager
  hasConditions(): boolean
  hasConditionsFor(tagName: string): boolean
  checkConditionalAndIsValid(): boolean

  validationCallback?(
    dto: FlowDTO,
    success: () => void,
    error: (optionalErrorMessage?: string) => void
  ): void
}

export const TagEvents = {
  ORIGINAL_ELEMENT_CHANGED: 'cf-tag-dom-element-changed'
}

export interface TagChangeDTO {
  tag: ITag
  value: string
}

export interface ConditionalValue {
  key: string
  conditionals: Array<string | RegExp>
}

export interface ITagOptions {
  domElement?: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement | null
  questions?: Array<string>
  label?: string
  validationCallback?: (dto: FlowDTO, success: () => void, error: () => void) => void // can be set through cf-validation attribute
}

// class
export class Tag implements ITag {
  private errorMessages!: Array<string>

  private pattern?: RegExp | null

  private changeCallback?: (() => void) | null

  private conditionalTags!: Array<ConditionalValue>

  // input placeholder text, this is for the UserTextInput and not the tag it self.
  protected _inputPlaceholder!: string

  protected _eventTarget!: EventDispatcher

  protected _label!: string

  protected questions?: Array<string> | null // can also be set through cf-questions attribute.

  public flowManager!: FlowManager

  public domElement: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement

  public optionTags?: OptionTag[]

  public defaultValue!: string | number

  public initialDefaultValue: string | number

  public validationCallback?: (
    dto: FlowDTO,
    success: () => void,
    error: (optionalErrorMessage?: string) => void
  ) => void // can be set through cf-validation attribute, get's called from FlowManager

  public skipUserInput: boolean // Used by cf-robot-message which has no input and is just a robot message

  public get type(): string {
    return this.domElement.getAttribute('type') || this.domElement?.tagName.toLowerCase() || ''
  }

  public get name(): string {
    return this.domElement.getAttribute('name') as string
  }

  public get id(): string {
    return this.domElement.getAttribute('id') as string
  }

  public get inputPlaceholder(): string {
    return this._inputPlaceholder
  }

  public get formless(): boolean {
    return TagsParser.isElementFormless(this.domElement)
  }

  public get label(): string {
    return this.getLabel()
  }

  public get value(): string | Array<string> {
    return this.domElement.value || (this.initialDefaultValue as string)
  }

  public get hasImage(): boolean {
    return this.domElement.hasAttribute('cf-image')
  }

  public get rows(): number {
    return this.domElement.hasAttribute('rows')
      ? Number.parseInt(this.domElement.getAttribute('rows') || '0', 10)
      : 0
  }

  public get disabled(): boolean {
    // a tag is disabled if its conditions are not meet, also if it contains the disabled attribute
    return (
      !this.checkConditionalAndIsValid() ||
      (this.domElement.getAttribute('disabled') !== undefined &&
        this.domElement.getAttribute('disabled') !== null)
    )
  }

  public get required(): boolean {
    return (
      !!this.domElement.getAttribute('required') || this.domElement.getAttribute('required') === ''
    )
  }

  public get question(): string {
    // if questions are empty, then fall back to dictionary, every time
    if (!this.questions || this.questions.length === 0)
      return Dictionary.getRobotResponse(this.type)
    return this.questions[Math.floor(Math.random() * this.questions.length)]
  }

  public set eventTarget(value: EventDispatcher) {
    this._eventTarget = value
  }

  public get errorMessage(): string {
    if (!this.errorMessages) {
      // custom tag error messages
      if (this.domElement.getAttribute('cf-error')) {
        this.errorMessages = Helpers.getValuesOfBars(
          this.domElement.getAttribute('cf-error') as string
        )
      } else if (
        this.domElement.parentNode &&
        (this.domElement.parentNode as HTMLElement).getAttribute('cf-error')
      ) {
        this.errorMessages = Helpers.getValuesOfBars(
          (this.domElement.parentNode as HTMLElement).getAttribute('cf-error') as string
        )
      } else if (this.required) {
        this.errorMessages = [Dictionary.get('input-placeholder-required')]
      } else if (this.type === 'file')
        this.errorMessages = [Dictionary.get('input-placeholder-file-error')]
      else {
        this.errorMessages = [Dictionary.get('input-placeholder-error')]
      }
    }

    return this.errorMessages[Math.floor(Math.random() * this.errorMessages.length)]
  }

  constructor(options: ITagOptions) {
    this.domElement = options.domElement as typeof this.domElement
    this.initialDefaultValue = ''

    this.changeCallback = this.onDomElementChange.bind(this)
    this.domElement.addEventListener(
      'change',
      this.changeCallback as EventListenerOrEventListenerObject,
      false
    )

    // remove tabIndex from the dom element.. danger zone... should we or should we not...
    this.domElement.tabIndex = -1

    this.skipUserInput = false

    // questions array
    if (options.questions) {
      this.questions = options.questions
    }

    // custom tag validation - must be a method on window to avoid unsafe eval() calls
    if (this.domElement.getAttribute('cf-validation')) {
      const fn = (window as any)[this.domElement.getAttribute('cf-validation') || 0]
      this.validationCallback = fn
    }

    // reg ex pattern is set on the Tag, so use it in our validation
    if (this.domElement.getAttribute('pattern')) {
      try {
        this.pattern = new RegExp(this.domElement.getAttribute('pattern') as string)
      } catch (error) {
        // TODO: RegExp passed could be invalid, but throwing an error crashes the
        // chat, should probably he handed some other way
        if (!ConversationalForm.suppressLog) {
          console.error(error)
        }
      }
    }

    if (this.type !== 'group' && ConversationalForm.illustrateAppFlow) {
      if (!ConversationalForm.suppressLog) {
        console.log('Conversational Form > Tag registered:', this.type, this)
      }
    }

    this.refresh()
  }

  public dealloc(): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    /** @ts-ignore */
    this.domElement.removeEventListener('change', this.changeCallback, false)
    this.changeCallback = null
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    /** @ts-ignore */
    this.domElement = null
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    /** @ts-ignore */
    this.defaultValue = null
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    /** @ts-ignore */
    this.errorMessages = null
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    /** @ts-ignore */
    this.pattern = null
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    /** @ts-ignore */
    this._label = null
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    /** @ts-ignore */
    this.validationCallback = null
    this.questions = null
  }

  public static testConditions(tagValue: string | string[], condition: ConditionalValue): boolean {
    const testValue = (value: string, conditional: string | RegExp): boolean => {
      if (typeof conditional === 'object') {
        // regex
        return (conditional as RegExp).test(value)
      }

      // string comparisson
      return tagValue === conditional
    }

    if (typeof tagValue === 'string') {
      // tag value is a string
      const value: string = tagValue as string
      let isValid = false
      for (let i = 0; i < condition.conditionals.length; i++) {
        const conditional: string | RegExp = condition.conditionals[i]
        isValid = testValue(value, conditional)

        if (isValid) break
      }
      return isValid
    }
    if (!tagValue) {
      return false
    }
    // tag value is an array
    let isValid = false
    for (let i = 0; i < condition.conditionals.length; i++) {
      const conditional: string | RegExp = condition.conditionals[i]
      if (typeof tagValue !== 'string') {
        for (let j = 0; j < tagValue.length; j++) {
          isValid = testValue(tagValue[j] as string, conditional)
          if (isValid) break
        }
      } else {
        // string comparisson
        isValid = testValue((tagValue as string[]).toString(), conditional)
      }

      if (isValid) break
    }

    return isValid

    // arrays need to be the same
  }

  public static isTagValid(element: HTMLElement): boolean {
    if (element.getAttribute('type') === 'hidden') return false

    if (element.getAttribute('type') === 'submit') return false

    // ignore buttons, we submit the form automatially
    if (element.getAttribute('type') === 'button') return false

    if (element.style) {
      // element style can be null if markup is created from DOMParser
      if (element.style.display === 'none') return false

      if (element.style.visibility === 'hidden') return false
    }

    const isTagFormless: boolean = TagsParser.isElementFormless(element)

    const innerText: string = Helpers.getInnerTextOfElement(element)
    if (
      element.tagName.toLowerCase() === 'option' &&
      ((!isTagFormless && innerText === '') || innerText === ' ')
    ) {
      return false
    }

    if (element.tagName.toLowerCase() === 'select' || element.tagName.toLowerCase() === 'option')
      return true
    if (isTagFormless) {
      return true
    }
    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length)
  }

  public reset(): void {
    this.refresh()

    // reset to initial value.
    this.defaultValue = ''
    this.domElement.value = this.initialDefaultValue.toString()
  }

  public refresh(): void {
    // default value of Tag, check every refresh
    this.defaultValue = ''

    this.questions = null
    this.findAndSetQuestions()
    this.findConditionalAttributes()
    this.flowManager?.tagRefreshCallback?.(this)
  }

  public hasConditionsFor(tagName: string): boolean {
    if (!this.hasConditions()) {
      return false
    }

    for (let i = 0; i < this.conditionalTags.length; i++) {
      const condition: ConditionalValue = this.conditionalTags[i]
      if (`cf-conditional-${tagName.toLowerCase()}` === condition.key.toLowerCase()) {
        return true
      }
    }

    return false
  }

  public hasConditions(): boolean {
    return this.conditionalTags && this.conditionalTags.length > 0
  }

  /**
   * @name checkConditionalAndIsValid
   * checks for conditional logic, see documentaiton (wiki)
   * here we check after cf-conditional{-name}, if we find an attribute we look through tags for value, and ignore the tag if
   */
  public checkConditionalAndIsValid(): boolean {
    // can we tap into disabled
    // if contains attribute, cf-conditional{-name} then check for conditional value across tags
    if (this.hasConditions()) {
      return this.flowManager.areConditionsInFlowFullfilled(this, this.conditionalTags)
    }

    // else return true, as no conditional means uncomplicated and happy tag
    return true
  }

  public setTagValueAndIsValid(dto: FlowDTO): boolean {
    // this sets the value of the tag in the DOM
    // validation
    let isValid = true
    const valueText: string = dto.text || ''

    if (
      this.domElement.hasAttribute('type') &&
      this.domElement.getAttribute('type') === 'email' &&
      !this.pattern &&
      valueText.length > 0
    ) {
      this.pattern =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    } else if (
      // When NOT required: Reset in the event user already typed something, and now they clear their input and want to submit nothing ==> remove pattern previously applied
      this.domElement.hasAttribute('type') &&
      this.domElement.getAttribute('type') === 'email' &&
      this.pattern &&
      valueText.length === 0 &&
      !this.required
    ) {
      this.pattern = null
    }

    if (this.pattern) {
      isValid = this.pattern.test(valueText)
    }

    if (valueText === '' && this.required) {
      isValid = false
    }

    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-minlength
    const min: number = parseInt(this.domElement.getAttribute('minlength') || '0', 10) || -1

    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-maxlength
    const max: number = parseInt(this.domElement.getAttribute('maxlength') || '0', 10) || -1

    if (min !== -1 && valueText.length < min) {
      isValid = false
    }

    if (max !== -1 && valueText.length > max) {
      isValid = false
    }

    const isMaxMinValueValid = this.validateMaxMinValue(valueText)
    if (!isMaxMinValueValid) isValid = false

    if (isValid) {
      // we cannot set the dom element value when type is file
      if (this.type !== 'file') {
        this.domElement.value = valueText
      }
    }

    return isValid
  }

  /**
   * Validates value against tag max and min attributes
   *
   * @private
   * @param {string} value
   * @returns {boolean}
   * @memberof Tag
   */
  private validateMaxMinValue(value: string): boolean {
    if (!value) return true

    const parsedValue: number = parseInt(value, 10)
    const minValue: number = parseInt(this.domElement.getAttribute('min') || '0', 10) || -1
    const maxValue: number = parseInt(this.domElement.getAttribute('max') || '0', 10) || -1
    if (minValue !== -1 && parsedValue < minValue) return false
    if (maxValue !== -1 && parsedValue > maxValue) return false

    return true
  }

  protected getLabel(): string {
    if (!this._label) {
      this.findAndSetLabel()
    }

    if (this._label) {
      return this._label
    }

    return Dictionary.getRobotResponse(this.type)
  }

  /**
   * @name findConditionalAttributes
   * look for conditional attributes and map them
   */
  protected findConditionalAttributes(): void {
    const keys: any = this.domElement.attributes
    if (keys.length > 0) {
      this.conditionalTags = []

      for (const key in keys) {
        if (keys.hasOwnProperty(key)) {
          const attr: any = keys[key]
          if (attr && attr.name && attr.name.indexOf('cf-conditional') !== -1) {
            // conditional found
            const _conditionals: Array<string | RegExp> = []

            // TODO: when && use to combine multiple values to complete condition.
            const conditionalsFromAttribute: Array<string> =
              attr.value.indexOf('||') !== -1 ? attr.value.split('||') : attr.value.split('&&')

            for (let i = 0; i < conditionalsFromAttribute.length; i++) {
              const _conditional: string = conditionalsFromAttribute[i]
              try {
                _conditionals.push(new RegExp(_conditional))
              } catch (e) {
                // empty
              }

              _conditionals.push(_conditional)
            }

            this.conditionalTags.push({
              key: attr.name,
              conditionals: _conditionals
            } as ConditionalValue)
          }
        }
      }
    }
  }

  protected findAndSetQuestions(): void {
    if (this.questions) {
      return
    }

    // <label tag with label:for attribute to el:id
    // check for label tag, we only go 2 steps backwards..

    // from standardize markup: http://www.w3schools.com/tags/tag_label.asp

    if (this.domElement.getAttribute('cf-questions')) {
      this.questions = Helpers.getValuesOfBars(
        this.domElement.getAttribute('cf-questions') as string
      )

      if (this.domElement.getAttribute('cf-input-placeholder')) {
        this._inputPlaceholder = this.domElement.getAttribute('cf-input-placeholder') as string
      }
    } else if (
      this.domElement.parentNode &&
      (this.domElement.parentNode as HTMLElement).getAttribute('cf-questions')
    ) {
      // for groups the parentNode can have the cf-questions..
      const parent = this.domElement.parentNode as HTMLElement
      this.questions = Helpers.getValuesOfBars(parent.getAttribute('cf-questions') as string)

      if (parent.getAttribute('cf-input-placeholder')) {
        this._inputPlaceholder = parent.getAttribute('cf-input-placeholder') as string
      }
    } else {
      // questions not set, so find it in the DOM
      // try a broader search using for and id attributes
      const elId = this.domElement.getAttribute('id') as string
      const forLabel = document.querySelector(`label[for='${elId}']`) as HTMLElement

      if (forLabel) {
        this.questions = [Helpers.getInnerTextOfElement(forLabel)]
      }
    }

    if (!this.questions && this.domElement.getAttribute('placeholder')) {
      // check for placeholder attr if questions are still undefined
      this.questions = [this.domElement.getAttribute('placeholder') as string]
    }
  }

  protected findAndSetLabel(): void {
    // find label..
    if (this.domElement.getAttribute('cf-label') && !this._label) {
      this._label = this.domElement.getAttribute('cf-label') || ''
    } else {
      const parentDomNode: Node | null = this.domElement.parentNode

      if (parentDomNode) {
        // step backwards and check for label tag.
        let labelTags: HTMLElement[] | HTMLCollectionOf<HTMLLabelElement> =
          (parentDomNode as HTMLElement).tagName.toLowerCase() === 'label'
            ? [parentDomNode as HTMLElement]
            : (parentDomNode as HTMLElement).getElementsByTagName('label')

        if (labelTags.length === 0) {
          // check for innerText
          const innerText: string = Helpers.getInnerTextOfElement(parentDomNode as any)
          if (innerText && innerText.length > 0) {
            labelTags = [parentDomNode as HTMLLabelElement]
          }
        } else if (labelTags.length > 0) {
          // check for "for" attribute
          for (let i = 0; i < labelTags.length; i++) {
            const label = labelTags[i]
            if (label.getAttribute('for') === this.id) {
              this._label = Helpers.getInnerTextOfElement(label)
            }
          }
        }

        if (!this._label && labelTags[0]) {
          this._label = Helpers.getInnerTextOfElement(labelTags[0])
        }
      }
    }
  }

  /**
   * @name onDomElementChange
   * on dom element value change event, ex. w. browser autocomplete mode
   */
  private onDomElementChange(): void {
    this._eventTarget.dispatchEvent(
      new CustomEvent(TagEvents.ORIGINAL_ELEMENT_CHANGED, {
        detail: {
          value: this.value,
          tag: this
        } as TagChangeDTO
      })
    )
  }
}
