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
