import { ButtonTag } from './ButtonTag'
import { CfRobotMessageTag } from './CfRobotMessageTag'
import { InputTag } from './InputTag'
import { OptionTag } from './OptionTag'
import { SelectTag } from './SelectTag'
import { ITag, Tag } from './Tag'

/** This function being in any of the Tag related files breaks vite */
export const createTag = (
  element: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement
): ITag | null => {
  if (Tag.isTagValid(element)) {
    // ignore hidden tags
    if (element.tagName.toLowerCase() === 'input') {
      return new InputTag({
        domElement: element
      })
    } if (element.tagName.toLowerCase() === 'textarea') {
      return new InputTag({
        domElement: element
      })
    } if (element.tagName.toLowerCase() === 'select') {
      return new SelectTag({
        domElement: element
      })
    } if (element.tagName.toLowerCase() === 'button') {
      return new ButtonTag({
        domElement: element
      })
    } if (element.tagName.toLowerCase() === 'option') {
      return new OptionTag({
        domElement: element
      })
    } if (element.tagName.toLowerCase() === 'cf-robot-message') {
      return new CfRobotMessageTag({
        domElement: element
      })
    }
  }
  // console.warn("Tag is not valid!: "+ element);
  return null
}
