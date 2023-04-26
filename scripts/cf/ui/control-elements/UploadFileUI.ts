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

/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
import { ConversationalForm } from '../../ConversationalForm'
import { Dictionary } from '../../data/Dictionary'
import { FlowDTO, FlowEvents } from '../../logic/FlowManager'
import { Helpers } from '../../logic/Helpers'
import { Button } from './Button'
import {
  ControlElementEvents,
  ControlElementProgressStates,
  IControlElementOptions
} from './ControlElement'

// class
export class UploadFileUI extends Button {
  private maxFileSize = 100000000000

  private onDomElementChangeCallback: (e?: any) => void

  private progressBar: HTMLElement

  private loading = false

  private submitTimer: number | NodeJS.Timeout = 0

  private _fileName = ''

  private _readerResult = ''

  private _files!: FileList

  public get value(): string {
    return (this.referenceTag.domElement as HTMLInputElement).value
  }

  public get readerResult(): string {
    return this._readerResult
  }

  public get files(): FileList {
    return this._files
  }

  public get fileName(): string {
    return this._fileName
  }

  public get type(): string {
    return 'UploadFileUI'
  }

  constructor(options: IControlElementOptions) {
    super(options)

    if (Helpers.caniuse.fileReader()) {
      const maxFileSizeStr =
        this.referenceTag.domElement?.getAttribute('cf-max-size') ||
        this.referenceTag.domElement?.getAttribute('max-size')

      if (maxFileSizeStr) {
        const maxFileSize: number = parseInt(maxFileSizeStr, 10)
        this.maxFileSize = maxFileSize
      }

      this.progressBar = this.el.getElementsByTagName(
        'cf-upload-file-progress-bar'
      )[0] as HTMLElement

      this.onDomElementChangeCallback = this.onDomElementChange.bind(this)
      this.referenceTag.domElement?.addEventListener(
        'change',
        this.onDomElementChangeCallback,
        false
      )
    } else {
      throw new Error('Conversational Form Error: No FileReader available for client.')
    }
  }

  public getFilesAsString(): string {
    // value is for the chat response -->
    const icon = document.createElement('span')
    icon.innerHTML = Dictionary.get('icon-type-file') + this.fileName
    return icon.outerHTML
  }

  private onDomElementChange(event: any) {
    if (!ConversationalForm.suppressLog) console.log('...onDomElementChange')

    const reader: FileReader = new FileReader()

    const domFiles = (this.referenceTag.domElement as HTMLInputElement).files

    if (domFiles) {
      this._files = domFiles
    }

    reader.onerror = (errorEvent: any) => {
      if (!ConversationalForm.suppressLog) console.log('onerror', errorEvent)
    }
    reader.onprogress = (progressEvent: ProgressEvent) => {
      if (!ConversationalForm.suppressLog) console.log('onprogress', progressEvent)

      this.progressBar.style.width = `${(event.loaded / event.total) * 100}%`
    }
    reader.onabort = (abortEvent: any) => {
      if (!ConversationalForm.suppressLog) console.log('onabort', abortEvent)
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reader.onloadstart = (loadstartEvent: any) => {
      // check for file size
      const file: File = this.files[0]
      const fileSize: number = file ? file.size : this.maxFileSize + 1
      // if file is undefined then abort ...
      if (fileSize > this.maxFileSize) {
        reader.abort()
        const dto: FlowDTO = {
          errorText: Dictionary.get('input-placeholder-file-size-error')
        }

        ConversationalForm.illustrateFlow(this, 'dispatch', FlowEvents.USER_INPUT_INVALID, dto)
        this.eventTarget.dispatchEvent(
          new CustomEvent(FlowEvents.USER_INPUT_INVALID, {
            detail: dto
          })
        )
      } else {
        // good to go
        this._fileName = file.name
        this.loading = true
        this.animateIn()
        // set text
        let sizeConversion: number = Math.floor(Math.log(fileSize) / Math.log(1024))
        const sizeChart: Array<string> = ['b', 'kb', 'mb', 'gb']
        sizeConversion = Math.min(sizeChart.length - 1, sizeConversion)
        const humanSizeString = `${Number((fileSize / 1024 ** sizeConversion).toFixed(2)) * 1} ${
          sizeChart[sizeConversion]
        }`

        const text = `${file.name} (${humanSizeString})`
        this.el.getElementsByTagName('cf-upload-file-text')[0].innerHTML = text

        this.eventTarget.dispatchEvent(
          new CustomEvent(ControlElementEvents.PROGRESS_CHANGE, {
            detail: ControlElementProgressStates.BUSY
          })
        )
      }
    }

    reader.onload = (onloadEvent: any) => {
      this._readerResult = onloadEvent.target.result
      this.progressBar.classList.add('loaded')
      this.submitTimer = setTimeout(() => {
        this.el.classList.remove('animate-in')
        this.onChoose() // submit the file

        this.eventTarget.dispatchEvent(
          new CustomEvent(ControlElementEvents.PROGRESS_CHANGE, {
            detail: ControlElementProgressStates.READY
          })
        )
      }, 0)
    }

    reader.readAsDataURL(this.files[0])
  }

  public animateIn(): void {
    if (this.loading) {
      super.animateIn()
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onClick(event: MouseEvent): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // super.onClick(event);
  }

  public triggerFileSelect(): void {
    // trigger file prompt
    this.referenceTag.domElement?.click()
  }

  // override
  public dealloc(): void {
    if (this.submitTimer && typeof this.submitTimer !== 'number') {
      clearTimeout(this.submitTimer)
    }

    // @ts-ignore
    this.progressBar = null

    if (this.onDomElementChangeCallback) {
      this.referenceTag.domElement?.removeEventListener(
        'change',
        this.onDomElementChangeCallback,
        false
      )

      // @ts-ignore
      this.onDomElementChangeCallback = null
    }

    super.dealloc()
  }

  public getTemplate(): string {
    return `<cf-upload-file-ui>
        <cf-upload-file-text></cf-upload-file-text>
        <cf-upload-file-progress>
          <cf-upload-file-progress-bar></cf-upload-file-progress-bar>
        </cf-upload-file-progress>
      </cf-upload-file-ui>
      `
  }
}
