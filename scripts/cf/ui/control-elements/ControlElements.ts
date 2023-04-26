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
/* eslint-disable no-case-declarations */
/* eslint-disable default-case */
/* eslint-disable max-len */
/* eslint-disable no-plusplus */
import { ConversationalForm } from '../../ConversationalForm'
import { Dictionary } from '../../data/Dictionary'
import { ITag } from '../../form-tags/Tag'
import { EventDispatcher } from '../../logic/EventDispatcher'
import { FlowDTO, FlowEvents } from '../../logic/FlowManager'
import { ChatListEvents } from '../chat/ChatList'
import { UserInputEvents } from '../inputs/UserInputElement'
import { InputKeyChangeDTO, UserTextInput } from '../inputs/UserTextInput'
import { ScrollController } from '../ScrollController'
import { CheckboxButton } from './CheckboxButton'
import {
  ControlElement, ControlElementEvents, ControlElementVector, IControlElement
} from './ControlElement'
import { OptionsList } from './OptionsList'
import { RadioButton } from './RadioButton'
import { UploadFileUI } from './UploadFileUI'

export const ControlElementsEvents = {
  ON_RESIZE: 'cf-on-control-elements-resize',
  CHANGED: 'cf-on-control-elements-changed'
}
export interface ControlElementsDTO {
  height: number;
}

export interface IControlElementsOptions {
  el: HTMLElement;
  cfReference: ConversationalForm;
  infoEl: HTMLElement;
  eventTarget: EventDispatcher;
}

export class ControlElements {
  private cfReference: ConversationalForm;

  private elements!: Array<IControlElement | OptionsList>;

  private eventTarget: EventDispatcher;

  private el: HTMLElement;

  private list: HTMLElement;

  private infoElement: HTMLElement;

  private currentControlElement?: IControlElement;

  private animateInFromResponseTimer: any;

  private ignoreKeyboardInput = false;

  private rowIndex = -1;

  private columnIndex = 0;

  private tableableRows?: Array<Array<IControlElement>>;

  private userInputUpdateCallback: (e?: any) => void;

  private onChatReponsesUpdatedCallback: (e?: any) => void;

  private onUserInputKeyChangeCallback: (e?: any) => void;

  private onElementFocusCallback: (e?: any) => void;

  private onScrollCallback: (e?: any) => void;

  private onElementLoadedCallback: (e?: any) => void;

  private onResizeCallback: (e?: any) => void;

  private elementWidth = 0;

  private filterListNumberOfVisible = 0;

  private listScrollController: ScrollController;

  private listWidth = 0;

  public get active(): boolean {
    return !!this.elements && this.elements.length > 0
  }

  public get focus(): boolean {
    if (!this.elements) { return false }

    const elements: Array<IControlElement> = this.getElements()
    for (let i = 0; i < elements.length; i++) {
      const element: ControlElement = elements[i] as ControlElement
      if (element.focus) {
        return true
      }
    }

    return false
  }

  public get highlighted(): boolean {
    if (!this.elements) { return false }

    const elements: Array<IControlElement> = this.getElements()
    for (let i = 0; i < elements.length; i++) {
      const element: ControlElement = elements[i] as ControlElement
      if (element.highlight) {
        return true
      }
    }

    return false
  }

  public set disabled(value: boolean) {
    if (value) { this.list.classList.add('disabled') } else { this.list.classList.remove('disabled') }
  }

  public get length(): number {
    const elements: Array<IControlElement> = this.getElements()
    return elements.length
  }

  constructor(options: IControlElementsOptions) {
    this.el = options.el
    this.eventTarget = options.eventTarget
    this.cfReference = options.cfReference

    this.list = this.el.getElementsByTagName('cf-list')[0] as HTMLElement
    this.infoElement = options.infoEl

    this.onScrollCallback = this.onScroll.bind(this)
    this.el.addEventListener('scroll', this.onScrollCallback, false)

    this.onResizeCallback = this.onResize.bind(this)
    window.addEventListener('resize', this.onResizeCallback, false)

    this.onElementFocusCallback = this.onElementFocus.bind(this)
    this.eventTarget.addEventListener(ControlElementEvents.ON_FOCUS, this.onElementFocusCallback, false)

    this.onElementLoadedCallback = this.onElementLoaded.bind(this)
    this.eventTarget.addEventListener(ControlElementEvents.ON_LOADED, this.onElementLoadedCallback, false)

    this.onChatReponsesUpdatedCallback = this.onChatReponsesUpdated.bind(this)
    this.eventTarget.addEventListener(ChatListEvents.CHATLIST_UPDATED, this.onChatReponsesUpdatedCallback, false)

    this.onUserInputKeyChangeCallback = this.onUserInputKeyChange.bind(this)
    this.eventTarget.addEventListener(UserInputEvents.KEY_CHANGE, this.onUserInputKeyChangeCallback, false)

    // user input update
    this.userInputUpdateCallback = this.onUserInputUpdate.bind(this)
    this.eventTarget.addEventListener(FlowEvents.USER_INPUT_UPDATE, this.userInputUpdateCallback, false)

    this.listScrollController = new ScrollController({
      interactionListener: this.el,
      listToScroll: this.list,
      eventTarget: this.eventTarget,
      // @ts-ignore
      listNavButtons: this.el.getElementsByTagName('cf-list-button')
    })
  }

  private onScroll(event: Event) {
    // some times the tabbing will result in el scroll, reset this.
    this.el.scrollLeft = 0
  }

  /**
  * @name onElementLoaded
  * when element is loaded, usally image loaded.
  */
  private onElementLoaded(event: CustomEvent) {
    this.onResize()
  }

  private onElementFocus(event: CustomEvent) {
    const vector = event.detail as ControlElementVector
    let x: number = (vector.x + vector.width < this.elementWidth ? 0 : vector.x - vector.width)
    x *= -1

    this.updateRowColIndexFromVector(vector)

    this.listScrollController.setScroll(x, 0)
  }

  private updateRowColIndexFromVector(vector: ControlElementVector) {
    if (!this.tableableRows) {
      return
    }

    for (let i = 0; i < this.tableableRows.length; i++) {
      const items = this.tableableRows[i]

      if (items) {
        for (let j = 0; j < items.length; j++) {
          const item: IControlElement = items[j]
          if (item === vector.el) {
            this.rowIndex = i
            this.columnIndex = j
            break
          }
        }
      }
    }
  }

  private onChatReponsesUpdated(event: CustomEvent) {
    clearTimeout(this.animateInFromResponseTimer)

    // only show when user response
    if (!(event.detail as any).currentResponse.isRobotResponse) {
      this.animateInFromResponseTimer = setTimeout(() => {
        this.animateElementsIn()
      }, this.cfReference.uiOptions.controlElementsInAnimationDelay)
    }
  }

  private onListChanged() {
    requestAnimationFrame(() => {
      ConversationalForm.illustrateFlow(this, 'dispatch', ControlElementsEvents.CHANGED)
      this.eventTarget.dispatchEvent(new CustomEvent(ControlElementsEvents.CHANGED))
    })
  }

  private onUserInputKeyChange(event: CustomEvent) {
    if (this.ignoreKeyboardInput) {
      this.ignoreKeyboardInput = false
      return
    }

    const dto: InputKeyChangeDTO = event.detail
    const userInput = dto.dto.input

    if (this.active) {
      const isNavKey: boolean = [
        Dictionary.keyCodes.left,
        Dictionary.keyCodes.right,
        Dictionary.keyCodes.down,
        Dictionary.keyCodes.up
      ].indexOf(dto.keyCode) !== -1
      const shouldFilter: boolean = dto.inputFieldActive && !isNavKey

      if (shouldFilter) {
        // input field is active, so we should filter..
        // @ts-ignore
        const inputValue: string = (dto.input as UserTextInput)?.getInputValue()
        this.filterElementsFrom(inputValue)
      } else {
        if (dto.keyCode === Dictionary.keyCodes.left) {
          this.columnIndex--
        } else if (dto.keyCode === Dictionary.keyCodes.right) {
          this.columnIndex++
        } else if (dto.keyCode === Dictionary.keyCodes.down) {
          this.updateRowIndex(1)
        } else if (dto.keyCode === Dictionary.keyCodes.up) {
          this.updateRowIndex(-1)
        } else if (dto.keyCode === Dictionary.keyCodes.enter || dto.keyCode === Dictionary.keyCodes.space) {
          if (this.tableableRows?.[this.rowIndex] && this.tableableRows[this.rowIndex][this.columnIndex]) {
            this.tableableRows?.[this.rowIndex][this.columnIndex].el.click()
          } else if (this.tableableRows?.[0] && this.tableableRows[0].length === 1) {
            // this is when only one element in a filter, then we click it!
            this.tableableRows?.[0][0]?.el?.click()
          }
        }

        if (!this.validateRowColIndexes()) {
          userInput?.setFocusOnInput()
        }
      }
    }

    if (!userInput?.active && this.validateRowColIndexes() && this.tableableRows && (this.rowIndex === 0 || this.rowIndex === 1)) {
      this.tableableRows[this.rowIndex][this.columnIndex].focus = true
    } else if (!userInput?.active) {
      userInput?.setFocusOnInput()
    }
  }

  private validateRowColIndexes(): boolean {
    // const maxRowIndex: number = (this.el.classList.contains('two-row') ? 1 : 0)
    const row = this.tableableRows?.[this.rowIndex]

    if (this.rowIndex !== -1 && row) {
      // columnIndex is only valid if rowIndex is valid
      if (this.columnIndex < 0) {
        this.columnIndex = row.length - 1
      }

      if (this.columnIndex > (row.length || 0) - 1) {
        this.columnIndex = 0
      }

      return true
    }
    this.resetTabList()
    return false
  }

  private updateRowIndex(direction: number) {
    const oldRowIndex: number = this.rowIndex
    this.rowIndex += direction

    if (this.tableableRows?.[this.rowIndex]) {
      // when row index is changed we need to find the closest column element, we cannot expect them to be indexly aligned
      const centerX = (this.tableableRows[oldRowIndex] ? this.tableableRows[oldRowIndex][this.columnIndex].positionVector.centerX : 0) || 0

      const items: Array<IControlElement> = this.tableableRows[this.rowIndex]
      let currentDistance = 10000000000000
      for (let i = 0; i < items.length; i++) {
        const element: IControlElement = items[i] as IControlElement

        if (currentDistance > Math.abs(centerX - (element.positionVector.centerX || 0))) {
          currentDistance = Math.abs(centerX - (element.positionVector.centerX || 0))
          this.columnIndex = i
        }
      }
    }
  }

  private resetTabList() {
    this.rowIndex = -1
    this.columnIndex = -1
  }

  private onUserInputUpdate(event: CustomEvent) {
    this.el.classList.remove('animate-in')
    this.infoElement.classList.remove('show')

    if (this.elements) {
      const elements: Array<IControlElement> = this.getElements()
      for (let i = 0; i < elements.length; i++) {
        const element: ControlElement = elements[i] as ControlElement
        element.animateOut()
      }
    }
  }

  private filterElementsFrom(value: string) {
    const inputValuesLowerCase: Array<string> = value.toLowerCase().split(' ')
    if (inputValuesLowerCase.indexOf('') !== -1) { inputValuesLowerCase.splice(inputValuesLowerCase.indexOf(''), 1) }

    const elements: Array<IControlElement> = this.getElements()
    if (elements.length > 1) {
      // the type is not strong with this one..
      const itemsVisible: Array<ControlElement> = []
      for (let i = 0; i < elements.length; i++) {
        const element: ControlElement = elements[i] as ControlElement
        element.highlight = false
        let elementVisibility = true

        // check for all words of input
        for (let j = 0; j < inputValuesLowerCase.length; j++) {
          const inputWord: string = inputValuesLowerCase[j]
          if (elementVisibility) {
            elementVisibility = element.value.toLowerCase().indexOf(inputWord) !== -1
          }
        }

        // set element visibility.
        element.visible = elementVisibility
        if (elementVisibility && element.visible) { itemsVisible.push(element) }
      }

      // set feedback text for filter..
      this.infoElement.innerHTML = itemsVisible.length === 0 ? Dictionary.get('input-no-filter').split('{input-value}').join(value) : ''
      if (itemsVisible.length === 0) {
        this.infoElement.classList.add('show')
      } else {
        this.infoElement.classList.remove('show')
      }

      // crude way of checking if list has changed...
      const hasListChanged: boolean = this.filterListNumberOfVisible !== itemsVisible.length
      if (hasListChanged) {
        this.animateElementsIn()
      }

      this.filterListNumberOfVisible = itemsVisible.length

      // highlight first item
      if (value !== '' && this.filterListNumberOfVisible > 0) { itemsVisible[0].highlight = true }
    }
  }

  public clickOnHighlighted(): void {
    const elements: Array<IControlElement> = this.getElements()
    for (let i = 0; i < elements.length; i++) {
      const element: ControlElement = elements[i] as ControlElement
      if (element.highlight) {
        element.el.click()
        break
      }
    }
  }

  public animateElementsIn(): void {
    if (this.elements?.length > 0) {
      this.resize()
      // this.el.style.transition = 'height 0.35s ease-out 0.2s';
      this.list.style.height = '0px'
      setTimeout(() => {
        this.list.style.height = `${this.list.scrollHeight}px`
        const elements: Array<IControlElement> = this.getElements()

        setTimeout(() => {
          if (elements.length > 0) {
            if (!this.el.classList.contains('animate-in')) { this.el.classList.add('animate-in') }

            for (let i = 0; i < elements.length; i++) {
              const element: ControlElement = elements[i] as ControlElement
              element.animateIn()
            }
          }

          document.querySelector('.scrollableInner')?.classList?.remove('scroll')

          // Check if chatlist is scrolled to the bottom - if not we need to do it manually (pertains to Chrome)
          const scrollContainer = document.querySelector('scrollable')
          if (scrollContainer && scrollContainer.scrollTop < scrollContainer.scrollHeight) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight
          }
        }, 300)
      }, 200)
    }
  }

  private getElements(): IControlElement[] {
    if (this.elements && this.elements.length > 0 && this.elements[0].type === 'OptionsList') {
      return (this.elements[0] as OptionsList).elements as IControlElement[]
    }

    return this.elements as IControlElement[]
  }

  /**
  * @name buildTabableRows
  * build the tabable array index
  */
  private buildTabableRows(): void {
    this.tableableRows = []
    this.resetTabList()

    const elements: Array<IControlElement> = this.getElements()

    if (this.el.classList.contains('two-row')) {
      // two rows
      this.tableableRows[0] = []
      this.tableableRows[1] = []

      for (let i = 0; i < elements.length; i++) {
        const element: IControlElement = elements[i] as IControlElement
        if (element.visible) {
          // crude way of checking if element is top row or bottom row..
          if (element.positionVector.y < 30) { this.tableableRows[0].push(element) } else { this.tableableRows[1].push(element) }
        }
      }
    } else {
      // single row
      this.tableableRows[0] = []

      for (let i = 0; i < elements.length; i++) {
        const element: IControlElement = elements[i] as IControlElement
        if (element.visible) { this.tableableRows[0].push(element) }
      }
    }
  }

  public resetAfterErrorMessage(): void {
    // @ts-ignore
    this.currentControlElement = null
    this.disabled = false
  }

  public focusFrom(angle: string): void {
    if (!this.tableableRows) { return }

    this.columnIndex = 0
    if (angle === 'bottom') {
      this.rowIndex = this.el.classList.contains('two-row') ? 1 : 0
    } else if (angle === 'top') {
      this.rowIndex = 0
    }

    if (this.tableableRows[this.rowIndex] && this.tableableRows[this.rowIndex][this.columnIndex]) {
      this.ignoreKeyboardInput = true
      if (!this.cfReference.options.preventAutoFocus) {
        this.tableableRows[this.rowIndex][this.columnIndex].focus = true
      }
    } else {
      this.resetTabList()
    }
  }

  public updateStateOnElementsFromTag(tag: ITag): void {
    for (let index = 0; index < this.elements.length; index++) {
      const element: any = this.elements[index]

      if (element.referenceTag === tag) {
        this.updateStateOnElements(element)
        break
      }
    }
  }

  public updateStateOnElements(controlElement: IControlElement): void {
    this.currentControlElement = controlElement

    if (this.currentControlElement.type === 'RadioButton') {
      // uncheck other radio buttons...
      const elements: Array<IControlElement> = this.getElements()
      for (let i = 0; i < elements.length; i++) {
        const element: RadioButton = elements[i] as RadioButton
        if (element !== controlElement) {
          element.checked = false
        } else {
          element.checked = true
        }
      }
    } else if (this.currentControlElement.type === 'CheckboxButton') {
      // change only the changed input
      const elements: Array<IControlElement> = this.getElements()
      for (let i = 0; i < elements.length; i++) {
        const element: CheckboxButton = elements[i] as CheckboxButton
        if (element === controlElement) {
          const isChecked: boolean = (element.referenceTag.domElement as HTMLInputElement).checked
          element.checked = isChecked
        }
      }
    }
  }

  public reset(): void {
    this.infoElement.classList.remove('show')

    this.el.classList.remove('one-row')
    this.el.classList.remove('two-row')

    // this.el.style.transition = 'height 0.35s ease-out 0.2s';
    this.list.style.height = '0px'
  }

  public getElement(index: number): IControlElement | OptionsList {
    return this.elements[index]
  }

  public getDTO(): FlowDTO {
    const dto: FlowDTO = {
      text: undefined,
      controlElements: []
    }

    // generate text value for ChatReponse
    if (this.elements && this.elements.length > 0) {
      const values: Array<string> = []

      switch (this.elements[0].type) {
        case 'CheckboxButton':
          let numChecked = 0// check if more than 1 is checked.
          for (let i = 0; i < this.elements.length; i++) {
            const element = this.elements[i] as CheckboxButton
            if (element.checked) {
              if (numChecked++ > 1) { break }
            }
          }

          for (let i = 0; i < this.elements.length; i++) {
            const element = this.elements[i] as CheckboxButton
            if (element.checked) {
              if (numChecked > 1) { element.partOfSeveralChoices = true }

              values.push(element.value)
            }

            dto.controlElements?.push(element)
          }

          dto.text = Dictionary.parseAndGetMultiValueString(values)

          break

        case 'RadioButton':
          for (let i = 0; i < this.elements.length; i++) {
            const element = this.elements[i] as RadioButton

            if (element.checked) {
              dto.text = element.value
            }

            dto.controlElements?.push(element)
          }

          break
        case 'OptionsList':
          const element: OptionsList = this.elements[0] as OptionsList
          dto.controlElements = element.getValue()

          if (dto.controlElements && dto.controlElements[0]) {
            for (let i = 0; i < dto.controlElements?.length; i++) {
              // const element: IControlElement = <IControlElement>dto.controlElements[i]
              values.push(dto.controlElements[i].value)
            }
          }

          // after value is created then set to all elements
          dto.controlElements = element.elements
          dto.text = Dictionary.parseAndGetMultiValueString(values)
          break
        case 'UploadFileUI':
          dto.text = (this.elements[0] as UploadFileUI).getFilesAsString()// Dictionary.parseAndGetMultiValueString(values);
          dto.controlElements?.push(this.elements[0] as UploadFileUI)
          break
      }
    }

    return dto
  }

  public clearTagsAndReset(): void {
    this.reset()

    if (this.elements) {
      while (this.elements?.length > 0) {
        this.elements.pop()?.dealloc()
      }
    }

    this.list.innerHTML = ''

    this.onListChanged()
  }

  public buildTags(tags: Array<ITag>): void {
    this.disabled = false

    // eslint-disable-next-line max-len
    // const topList: HTMLUListElement = (this.el.parentNode as HTMLUListElement).getElementsByTagName('ul')[0]
    // eslint-disable-next-line max-len
    // const bottomList: HTMLUListElement = (this.el.parentNode as HTMLUListElement).getElementsByTagName('ul')[1]

    // remove old elements
    this.clearTagsAndReset()

    this.elements = []

    for (let i = 0; i < tags.length; i++) {
      const tag: ITag = tags[i]

      switch (tag.type) {
        case 'radio':
          this.elements.push(new RadioButton({
            referenceTag: tag,
            eventTarget: this.eventTarget
          }))
          break
        case 'checkbox':
          this.elements.push(new CheckboxButton({
            referenceTag: tag,
            eventTarget: this.eventTarget
          }))

          break
        case 'select':
          this.elements.push(new OptionsList({
            referenceTag: tag,
            context: this.list,
            eventTarget: this.eventTarget
          }))
          break
        case 'input':
        default:
          if (tag.type === 'file') {
            this.elements.push(new UploadFileUI({
              referenceTag: tag,
              eventTarget: this.eventTarget
            }))
          }
          // nothing to add.
          break
      }

      if (tag.type !== 'select' && this.elements.length > 0) {
        const element: IControlElement = this.elements[this.elements.length - 1] as IControlElement
        this.list.appendChild(element.el)
      }
    }

    const isElementsOptionsList: boolean = this.elements[0] && this.elements[0].type === 'OptionsList'
    if (isElementsOptionsList) {
      this.filterListNumberOfVisible = (this.elements[0] as OptionsList)?.elements?.length || 0
    } else {
      this.filterListNumberOfVisible = tags.length
    }

    new Promise((resolve: any, reject: any) => this.resize(resolve, reject)).then(() => {
      const h: number = this.list.offsetHeight
      // this.el.classList.contains("one-row") ? 52 :
      // this.el.classList.contains("two-row") ? 102 : 0;

      const controlElementsAddedDTO: ControlElementsDTO = {
        height: h
      }

      this.onListChanged()

      ConversationalForm.illustrateFlow(this, 'dispatch', UserInputEvents.CONTROL_ELEMENTS_ADDED, controlElementsAddedDTO)
      this.eventTarget.dispatchEvent(new CustomEvent(UserInputEvents.CONTROL_ELEMENTS_ADDED, {
        detail: controlElementsAddedDTO
      }))
    })
  }

  private onResize(event?: Event) {
    this.resize()
  }

  public resize(resolve?: () => void, reject?: () => void): void {
    // scrollbar things
    // Element.offsetWidth - Element.clientWidth
    this.list.style.width = '100%'
    this.el.classList.remove('resized')
    this.el.classList.remove('one-row')
    this.el.classList.remove('two-row')
    this.elementWidth = 0

    this.listWidth = 0
    const elements: Array<IControlElement> = this.getElements()

    if (elements && elements.length > 0) {
      const listWidthValues: Array<number> = []
      const listWidthValues2: Array<IControlElement> = []
      let containsElementWithImage = false
      for (let i = 0; i < elements.length; i++) {
        const element: IControlElement = elements[i] as IControlElement
        if (element.visible) {
          element.calcPosition()
          this.listWidth += element.positionVector.width
          listWidthValues.push(element.positionVector.x + element.positionVector.width)
          listWidthValues2.push(element)
        }

        if (element.hasImage()) { containsElementWithImage = true }
      }

      let elOffsetWidth: number = this.el.offsetWidth
      let isListWidthOverElementWidth: boolean = this.listWidth > elOffsetWidth
      if (isListWidthOverElementWidth && !containsElementWithImage) {
        this.el.classList.add('two-row')
        this.listWidth = Math.max(elOffsetWidth, Math.round((listWidthValues[Math.floor(listWidthValues.length / 2)]) + 50))
        this.list.style.width = `${this.listWidth}px`
      } else {
        this.el.classList.add('one-row')
      }

      // recalc after LIST classes has been added
      for (let i = 0; i < elements.length; i++) {
        const element: IControlElement = elements[i] as IControlElement
        if (element.visible) {
          element.calcPosition()
        }
      }

      // check again after classes are set.
      elOffsetWidth = this.el.offsetWidth
      isListWidthOverElementWidth = this.listWidth > elOffsetWidth

      // sort the list so we can set tabIndex properly
      const elementsCopyForSorting: Array<IControlElement> = elements.slice()
      const tabIndexFilteredElements: Array<IControlElement> = elementsCopyForSorting.sort((a: IControlElement, b: IControlElement) => {
        const aOverB: boolean = a.positionVector.y > b.positionVector.y
        // eslint-disable-next-line no-nested-ternary
        return a.positionVector.x === b.positionVector.x ? (aOverB ? 1 : -1) : a.positionVector.x < b.positionVector.x ? -1 : 1
      })

      let tabIndex = 0
      for (let i = 0; i < tabIndexFilteredElements.length; i++) {
        const element: IControlElement = tabIndexFilteredElements[i] as IControlElement
        if (element.visible) {
          // tabindex 1 are the UserTextInput element
          element.tabIndex = 2 + (tabIndex++)
        } else {
          element.tabIndex = -1
        }
      }

      // toggle nav button visiblity
      if (isListWidthOverElementWidth) {
        this.el.classList.remove('hide-nav-buttons')
      } else {
        this.el.classList.add('hide-nav-buttons')
      }

      this.elementWidth = elOffsetWidth

      // resize scroll
      this.listScrollController.resize(this.listWidth, this.elementWidth)

      this.el.classList.add('resized')

      this.eventTarget.dispatchEvent(new CustomEvent(ControlElementsEvents.ON_RESIZE))

      if (resolve) {
        // only build when there is something to resolve
        this.buildTabableRows()
        resolve()
      }
    }
  }

  public dealloc(): void {
    // @ts-ignore
    this.currentControlElement = null
    // @ts-ignore
    this.tableableRows = null

    window.removeEventListener('resize', this.onResizeCallback, false)
    // @ts-ignore
    this.onResizeCallback = null

    this.el.removeEventListener('scroll', this.onScrollCallback, false)
    // @ts-ignore
    this.onScrollCallback = null

    this.eventTarget.removeEventListener(ControlElementEvents.ON_FOCUS, this.onElementFocusCallback, false)
    // @ts-ignore
    this.onElementFocusCallback = null

    this.eventTarget.removeEventListener(ChatListEvents.CHATLIST_UPDATED, this.onChatReponsesUpdatedCallback, false)
    // @ts-ignore
    this.onChatReponsesUpdatedCallback = null

    this.eventTarget.removeEventListener(UserInputEvents.KEY_CHANGE, this.onUserInputKeyChangeCallback, false)
    // @ts-ignore
    this.onUserInputKeyChangeCallback = null

    this.eventTarget.removeEventListener(FlowEvents.USER_INPUT_UPDATE, this.userInputUpdateCallback, false)
    // @ts-ignore
    this.userInputUpdateCallback = null

    this.eventTarget.removeEventListener(ControlElementEvents.ON_LOADED, this.onElementLoadedCallback, false)
    // @ts-ignore
    this.onElementLoadedCallback = null

    this.listScrollController.dealloc()
  }
}
