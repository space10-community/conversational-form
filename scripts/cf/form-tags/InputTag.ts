import { FlowDTO } from '../logic/FlowManager'
import { ITagOptions, Tag } from './Tag'

export class InputTag extends Tag {
  constructor(options: ITagOptions) {
    super(options)

    if (this.type === 'text') {
      // empty
    } else if (this.type === 'email') {
      // empty
    } else if (this.type === 'tel') {
      // empty
    } else if (this.type === 'checkbox') {
      // empty
    } else if (this.type === 'radio') {
      // empty
    } else if (this.type === 'password') {
      // empty
    } else if (this.type === 'file') {
      // check InputFileTag.ts
    }
  }

  protected findAndSetQuestions(): void {
    super.findAndSetQuestions()

    // special use cases for <input> tag add here...
  }

  protected findAndSetLabel(): void {
    super.findAndSetLabel()

    if (!this._label) {
      // special use cases for <input> tag add here...
    }
  }

  public setTagValueAndIsValid(value: FlowDTO): boolean {
    if (this.type === 'checkbox') {
      // checkbox is always true..
      return true
    }
    return super.setTagValueAndIsValid(value)
  }

  public dealloc(): void {
    super.dealloc()
  }
}
