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

/* eslint-disable class-methods-use-this */
import { Tag } from '../../form-tags/Tag'
import { ControlElement, ControlElementEvents, IControlElementOptions } from './ControlElement'

export class Button extends ControlElement {
  private imgEl!: HTMLImageElement;

  private clickCallback: () => void;

  private mouseDownCallback: () => void;

  private imageLoadedCallback!: () => void;

  public get type(): string {
    return 'Button'
  }

  constructor(options: IControlElementOptions) {
    super(options)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.clickCallback = this.onClick.bind(this)
    this.el.addEventListener('click', this.clickCallback, false)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.mouseDownCallback = this.onMouseDown.bind(this)
    this.el.addEventListener('mousedown', this.mouseDownCallback, false)

    // image
    this.checkForImage()
  }

  public hasImage(): boolean {
    return (this.referenceTag as Tag).hasImage
  }

  /**
  * @name checkForImage
  * checks if element has cf-image, if it has then change UI
  */
  private checkForImage(): void {
    const hasImage: boolean = this.hasImage()
    if (hasImage) {
      this.el.classList.add('has-image')
      this.imgEl = document.createElement('img')
      this.imageLoadedCallback = this.onImageLoaded.bind(this)
      this.imgEl.classList.add('cf-image')
      this.imgEl.addEventListener('load', this.imageLoadedCallback, false)
      if (this.referenceTag.domElement?.getAttribute('cf-image')) {
        this.imgEl.src = this.referenceTag.domElement.getAttribute('cf-image') as string
      }
      this.el.insertBefore(this.imgEl, this.el.children[0])
    }
  }

  private onImageLoaded() {
    this.imgEl.classList.add('loaded')
    this.eventTarget.dispatchEvent(new CustomEvent(ControlElementEvents.ON_LOADED, {}))
  }

  private onMouseDown(event: MouseEvent) {
    event.preventDefault()
  }

  protected onClick(event: MouseEvent): void {
    this.onChoose()
  }

  public dealloc(): void {
    this.el.removeEventListener('click', this.clickCallback, false)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.clickCallback = null

    if (this.imageLoadedCallback) {
      this.imgEl.removeEventListener('load', this.imageLoadedCallback, false)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.imageLoadedCallback = null
    }

    this.el.removeEventListener('mousedown', this.mouseDownCallback, false)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.mouseDownCallback = null

    super.dealloc()
  }

  // override
  public getTemplate(): string {
    return `<cf-button class="cf-button">
        ${this.referenceTag.label}
      </cf-button>
      `
  }
}
