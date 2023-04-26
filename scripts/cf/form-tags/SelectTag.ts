/* eslint-disable no-console */
import { FlowDTO } from '../logic/FlowManager'
import { OptionButton } from '../ui/control-elements/OptionButton'
import { OptionTag } from './OptionTag'
import {
  ITag, ITagOptions, Tag
} from './Tag'
import { createTag } from './TagHelpers'

export class SelectTag extends Tag {
  public optionTags: Array<OptionTag>;

  private _values!: Array<string>;

  public get type(): string {
    return 'select'
  }

  public get name(): string {
    const name = this.domElement && this.domElement.hasAttribute('name') ? this.domElement.getAttribute('name') : this.optionTags[0].name

    return name || ''
  }

  public get value(): string | Array<string> {
    return this._values
  }

  public get multipleChoice(): boolean {
    return this.domElement.hasAttribute('multiple')
  }

  constructor(options: ITagOptions) {
    super(options)

    // build the option tags
    this.optionTags = []
    const domOptionTags = this.domElement.getElementsByTagName('option')

    for (let i = 0; i < domOptionTags.length; i++) {
      const element: HTMLOptionElement = domOptionTags[i] as HTMLOptionElement
      const tag: OptionTag = createTag(element) as OptionTag

      if (tag) {
        this.optionTags.push(tag)
      } else {
        console.warn(this.constructor.name, 'option tag invalid:', tag)
      }
    }
  }

  public setTagValueAndIsValid(dto: FlowDTO): boolean {
    let isValid = false

    // select tag values are set via selected attribute on option tag
    const numberOptionButtonsVisible: Array<OptionButton> = []
    this._values = []

    if (dto.controlElements) {
      // TODO: Refactor this so it is less dependant on controlElements
      for (let i = 0; i < this.optionTags.length; i++) {
        const tag = this.optionTags[i] as OptionTag

        for (let j = 0; j < dto.controlElements.length; j++) {
          const controllerElement: OptionButton = dto.controlElements[j] as OptionButton
          if (controllerElement.referenceTag === tag) {
            // tag match found, so set value
            tag.selected = controllerElement.selected

            // check for minimum one selected
            if (!isValid && tag.selected) { isValid = true }

            if (tag.selected) { this._values.push(tag.value as string) }

            if (controllerElement.visible) { numberOptionButtonsVisible.push(controllerElement) }
          }
        }
      }
    } else {
      let wasSelected = false
      // for when we don't have any control elements, then we just try and map values
      for (let i = 0; i < this.optionTags.length; i++) {
        const tag = this.optionTags[i] as ITag
        const v1: string = tag.value.toString().toLowerCase()
        const v2: string = dto.text?.toString()?.toLowerCase() || ''
        // brute force checking...
        if (v1.indexOf(v2) !== -1 || v2.indexOf(v1) !== -1) {
          // check the original tag
          this._values.push(tag.value as string);
          (tag.domElement as HTMLInputElement).checked = true
          wasSelected = true
        }
      }

      isValid = wasSelected
    }

    // special case 1, only one optiontag visible from a filter
    if (!isValid && numberOptionButtonsVisible.length === 1) {
      const element: OptionButton = numberOptionButtonsVisible[0]
      const tag = this.optionTags[this.optionTags.indexOf(element.referenceTag as OptionTag)]
      element.selected = true
      tag.selected = true
      isValid = true

      if (tag.selected) { this._values.push(tag.value as string) }
    }

    return isValid
  }
}
