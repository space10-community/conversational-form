import { ITagOptions, Tag } from './Tag'

export class CfRobotMessageTag extends Tag {
  constructor(options: ITagOptions) {
    super(options)
    this.skipUserInput = true
  }

  public dealloc(): void {
    super.dealloc()
  }
}
