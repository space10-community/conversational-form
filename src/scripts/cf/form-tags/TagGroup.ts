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
import { Dictionary } from '../data/Dictionary'
import { EventDispatcher } from '../logic/EventDispatcher'
import { FlowDTO, FlowManager } from '../logic/FlowManager'
import { ITag } from './Tag'
import { Helpers } from '../logic/Helpers'
import { RadioButton } from '../ui/control-elements/RadioButton'
import { CheckboxButton } from '../ui/control-elements/CheckboxButton'
import { ConversationalForm } from '../ConversationalForm'

// group tags together, this is done automatically by looking through
// InputTags with type radio or checkbox and same name attribute.
// single choice logic for Radio Button, <input type="radio", where name is the same
// multi choice logic for Checkboxes, <input type="checkbox", where name is the same

export interface ITagGroupOptions {
  elements: Array<ITag>
  fieldset?: HTMLFieldSetElement
}

export interface ITagGroup extends ITag {
  elements: Array<ITag>
  activeElements: Array<ITag>
  getGroupTagType: () => string
  refresh(): void
  dealloc(): void
  required: boolean
  disabled: boolean
  skipUserInput: boolean
  flowManager: FlowManager
  inputPlaceholder?: string
}

// class
export class TagGroup implements ITagGroup {
  private onInputKeyChangeCallback?: () => void | null

  private _values!: Array<string>

  // can also be set through `fieldset` cf-questions="..."` attribute.
  private questions!: Array<string>

  /**
   * Array checked/choosen ITag's
   */
  private _activeElements!: Array<ITag>

  private _eventTarget!: EventDispatcher

  private _fieldset?: HTMLFieldSetElement | null

  protected _inputPlaceholder!: string

  public skipUserInput: boolean

  // event target..
  // not getting set... as taggroup differs from tag
  public defaultValue!: string

  public elements: Array<ITag>

  public get required(): boolean {
    this.elements.forEach((element) => {
      if (element.required) {
        return true
      }
    })

    return false
  }

  public set eventTarget(value: EventDispatcher) {
    this._eventTarget = value
    for (let i = 0; i < this.elements.length; i++) {
      const tag: ITag = this.elements[i] as ITag
      tag.eventTarget = value
    }
  }

  public set flowManager(value: FlowManager) {
    for (let i = 0; i < this.elements.length; i++) {
      const tag: ITag = this.elements[i] as ITag
      tag.flowManager = value
    }
  }

  public get type(): string {
    return 'group'
  }

  public get label(): string {
    return ''
  }

  public get name(): string {
    const name =
      this._fieldset && this._fieldset.hasAttribute('name')
        ? this._fieldset.getAttribute('name')
        : this.elements[0]?.name
    return name || ''
  }

  public get id(): string {
    return this._fieldset && this._fieldset.id
      ? this._fieldset.id
      : (this.elements[0]?.id as string)
  }

  public get question(): string {
    // check if elements have the questions, else fallback
    if (this.questions && this.questions.length > 0) {
      return this.questions[
        Math.floor(Math.random() * this.questions.length)
      ] as string
    }
    if (this.elements[0] && this.elements[0].question) {
      const tagQuestion: string = this.elements[0].question
      return tagQuestion
    }
    // fallback to robot response from dictionary
    const robotReponse: string = Dictionary.getRobotResponse(
      this.getGroupTagType()
    )
    return robotReponse
  }

  public get activeElements(): Array<ITag> {
    return this._activeElements
  }

  public get value(): Array<string> {
    // TODO: fix value???
    return this._values ? this._values : ['']
  }

  public get disabled(): boolean {
    let allShouldBedisabled = 0
    this.elements.forEach((element) => {
      if (element.disabled) {
        allShouldBedisabled++
      }
    })

    return allShouldBedisabled === this.elements.length
  }

  public get errorMessage(): string {
    let errorMessage = Dictionary.get('input-placeholder-error')

    this.elements.forEach((element) => {
      errorMessage = element.errorMessage
    })

    return errorMessage
  }

  public get inputPlaceholder(): string {
    return this._inputPlaceholder
  }

  constructor(options: ITagGroupOptions) {
    this.elements = options.elements
    // set wrapping element
    this._fieldset = options.fieldset
    if (this._fieldset && this._fieldset.getAttribute('cf-questions')) {
      this.questions = Helpers.getValuesOfBars(
        this._fieldset.getAttribute('cf-questions') as string
      )
    }
    if (this._fieldset && this._fieldset.getAttribute('cf-input-placeholder')) {
      this._inputPlaceholder = this._fieldset.getAttribute(
        'cf-input-placeholder'
      ) as string
    }

    if (ConversationalForm.illustrateAppFlow) {
      if (!ConversationalForm.suppressLog) {
        console.log(
          'Conversational Form > TagGroup registered:',
          this.elements[0]?.type,
          this
        )
      }
    }

    this.skipUserInput = false
  }

  public dealloc(): void {
    for (let i = 0; i < this.elements.length; i++) {
      const element: ITag = this.elements[i] as ITag
      element.dealloc()
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements = null
  }

  public refresh(): void {
    this.elements.forEach((element) => {
      element.refresh()
    })
  }

  public reset(): void {
    this._values = []
    this.elements.forEach((element) => {
      element.reset()
    })
  }

  public getGroupTagType(): string {
    return this.elements[0]?.type || ''
  }

  public hasConditionsFor(tagName: string): boolean {
    for (let i = 0; i < this.elements.length; i++) {
      const element = this.elements[i]
      if (element?.hasConditionsFor(tagName)) {
        return true
      }
    }

    return false
  }

  public hasConditions(): boolean {
    for (let i = 0; i < this.elements.length; i++) {
      const element = this.elements[i]
      if (element?.hasConditions()) {
        return true
      }
    }

    return false
  }

  /**
   * @name checkConditionalAndIsValid
   * checks for conditional logic, see documentaiton (wiki)
   * here we check after cf-conditional{-name} on group tags
   */
  public checkConditionalAndIsValid(): boolean {
    // can we tap into disabled
    // if contains attribute, cf-conditional{-name} then check for conditional value across tags
    for (let i = 0; i < this.elements.length; i++) {
      const element = this.elements[i]
      element?.checkConditionalAndIsValid()
    }

    // else return true, as no conditional means happy tag
    return true
  }

  public setTagValueAndIsValid(dto: FlowDTO): boolean {
    let isValid = false

    const groupType: string = this.elements[0]?.type || ''
    this._values = []
    this._activeElements = []

    let wasRadioButtonChecked = false
    const numberRadioButtonsVisible: RadioButton[] = []

    switch (groupType) {
      case 'radio':
        if (dto.controlElements) {
          // TODO: Refactor this so it is less dependant on controlElements
          for (let i = 0; i < dto.controlElements?.length; i++) {
            const element: RadioButton = dto.controlElements[i] as RadioButton
            const tag: ITag = this.elements[
              this.elements.indexOf(element.referenceTag)
            ] as ITag
            numberRadioButtonsVisible.push(element)

            if (tag === element.referenceTag) {
              if (element.checked) {
                this._values.push(tag.value as string)
                this._activeElements.push(tag)
              }
              // a radio button was checked
              if (!wasRadioButtonChecked && element.checked) {
                wasRadioButtonChecked = true
              }
            }
          }
        } else {
          // for when we don't have any control elements, then we just try and map values
          for (let i = 0; i < this.elements.length; i++) {
            const tag: ITag = this.elements[i] as ITag
            const v1: string = tag.value.toString()?.toLowerCase()
            const v2: string = dto.text?.toString()?.toLowerCase() || ''
            // brute force checking...
            if (v1.indexOf(v2) !== -1 || v2.indexOf(v1) !== -1) {
              this._activeElements.push(tag)
              // check the original tag
              this._values.push(tag.value as string)
              ;(tag.domElement as HTMLInputElement).checked = true
              wasRadioButtonChecked = true
            }
          }
        }

        isValid = wasRadioButtonChecked
        break

      case 'checkbox':
        // checkbox is always valid
        isValid = true

        if (dto.controlElements) {
          for (let i = 0; i < dto.controlElements?.length; i++) {
            const element = dto.controlElements[i] as CheckboxButton
            const tag: ITag = this.elements[
              this.elements.indexOf(element.referenceTag)
            ] as ITag
            ;(tag.domElement as HTMLInputElement).checked = element.checked

            if (element.checked) {
              this._values.push(tag.value as string)
              this._activeElements.push(tag)
            }
          }
        }

        if (this.required && this._activeElements.length === 0) {
          // checkbox can be required
          isValid = false
        }

        break
      default:
        break
    }

    return isValid
  }
}
