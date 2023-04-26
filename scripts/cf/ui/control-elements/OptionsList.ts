/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
import { ConversationalForm } from '../../ConversationalForm'
import { OptionTag } from '../../form-tags/OptionTag'
import { SelectTag } from '../../form-tags/SelectTag'
import { ITag } from '../../form-tags/Tag'
import { EventDispatcher } from '../../logic/EventDispatcher'
import { ControlElementEvents } from './ControlElement'
import { IOptionButtonOptions, OptionButton, OptionButtonEvents } from './OptionButton'

// interface

export interface IOptionsListOptions {
  context: HTMLElement;
  eventTarget: EventDispatcher;
  referenceTag: ITag;
}

// class
// builds x OptionsButton from the registered SelectTag
export class OptionsList {
  public elements?: OptionButton[];

  private eventTarget: EventDispatcher;

  private context: HTMLElement;

  private multiChoice?: boolean;

  private referenceTag: ITag;

  private onOptionButtonClickCallback: (e?: any) => void;

  public get type(): string {
    return 'OptionsList'
  }

  constructor(options: IOptionsListOptions) {
    this.context = options.context
    this.eventTarget = options.eventTarget
    this.referenceTag = options.referenceTag

    // check for multi choice select tag
    this.multiChoice = this.referenceTag?.domElement?.hasAttribute('multiple')

    this.onOptionButtonClickCallback = this.onOptionButtonClick.bind(this)
    this.eventTarget.addEventListener(
      OptionButtonEvents.CLICK, this.onOptionButtonClickCallback, false
    )

    this.createElements()
  }

  public getValue(): Array<OptionButton> {
    const arr: Array<OptionButton> = []

    if (!this.elements) {
      return arr
    }

    for (let i = 0; i < this.elements.length; i++) {
      const element: OptionButton = this.elements[i] as OptionButton
      if (!this.multiChoice && element.selected) {
        arr.push(element)
        return arr
      } if (this.multiChoice && element.selected) {
        arr.push(element)
      }
    }

    return arr
  }

  private onOptionButtonClick(event: CustomEvent) {
    // if mutiple... then dont remove selection on other buttons
    if (!this.multiChoice) {
      // only one is selectable at the time.

      if (!this.elements) {
        return
      }

      for (let i = 0; i < this.elements.length; i++) {
        const element: OptionButton = this.elements[i] as OptionButton
        if (element !== event.detail) {
          element.selected = false
        } else {
          element.selected = true
        }
      }

      ConversationalForm.illustrateFlow(this, 'dispatch', ControlElementEvents.SUBMIT_VALUE, this.referenceTag)
      this.eventTarget.dispatchEvent(new CustomEvent(ControlElementEvents.SUBMIT_VALUE, {
        detail: event.detail as OptionButton
      }))
    } else {
      // eslint-disable-next-line no-param-reassign
      (event.detail as OptionButton).selected = !(event.detail as OptionButton).selected
    }
  }

  private createElements() {
    this.elements = []
    const { optionTags } = this.referenceTag as SelectTag
    for (let i = 0; i < optionTags.length; i++) {
      const tag: OptionTag = optionTags[i]

      const btn: OptionButton = new OptionButton({
        referenceTag: tag,
        isMultiChoice: (this.referenceTag as SelectTag).multipleChoice,
        eventTarget: this.eventTarget
      } as IOptionButtonOptions)

      this.elements.push(btn)

      this.context.appendChild(btn.el)
    }
  }

  public dealloc(): void {
    this.eventTarget.removeEventListener(
      OptionButtonEvents.CLICK, this.onOptionButtonClickCallback, false
    )
    // @ts-ignore
    this.onOptionButtonClickCallback = null

    while (this.elements && this.elements.length > 0) {
      this.elements.pop()?.dealloc()
    }

    // @ts-ignore
    this.elements = null
  }
}
