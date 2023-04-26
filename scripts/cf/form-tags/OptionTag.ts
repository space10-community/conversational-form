import { FlowDTO } from '../logic/FlowManager'
import { Helpers } from '../logic/Helpers'
import { Tag } from './Tag'

export class OptionTag extends Tag {
  public get type(): string {
    return 'option'
  }

  public get label(): string {
    if (this.formless) {
      return super.getLabel()
    }
    return Helpers.getInnerTextOfElement(this.domElement)
  }

  public get selected(): boolean {
    return this.domElement.hasAttribute('selected')
    // return (<HTMLOptionElement> this.domElement).selected;
  }

  public set selected(value: boolean) {
    (this.domElement as HTMLOptionElement).selected = value
    if (value) {
      this.domElement.setAttribute('selected', 'selected')
    } else {
      this.domElement.removeAttribute('selected')
    }
  }

  public setTagValueAndIsValid(value: FlowDTO): boolean {
    const isValid = true
    // OBS: No need to set any validation og value for this tag type ..
    // .. it is atm. only used to create pseudo elements in the OptionsList

    return isValid
  }
}
