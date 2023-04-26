/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/ban-ts-comment */
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

import { Dictionary } from './data/Dictionary'
import { InputTag } from './form-tags/InputTag'
import { ITag, Tag } from './form-tags/Tag'
import { ITagGroup, TagGroup } from './form-tags/TagGroup'
import { createTag } from './form-tags/TagHelpers'
import { IUserInput } from './interfaces/IUserInput'
import { IUserInterfaceOptions, UserInterfaceDefaultOptions } from './interfaces/IUserInterfaceOptions'
import { EventDispatcher } from './logic/EventDispatcher'
import { FlowDTO, FlowManager } from './logic/FlowManager'
import { Helpers } from './logic/Helpers'
import { DataTag, TagsParser } from './parsing/TagsParser'
import { ChatList } from './ui/chat/ChatList'
import { ChatResponseEvents } from './ui/chat/ChatResponse'
import { UserInputElement } from './ui/inputs/UserInputElement'
import { UserTextInput } from './ui/inputs/UserTextInput'
import { ProgressBar } from './ui/ProgressBar'
import { ScrollController } from './ui/ScrollController'

export interface Window { ConversationalForm: any; }

// CUI options
export interface ConversationalFormOptions {
  // HTMLFormElement
  formEl: HTMLFormElement;

  // context (HTMLElement) of where to append the ConversationalForm (see also cf-context attribute)
  context?: HTMLElement;

  // pass in custom tags (when prevent the auto-instantiation of ConversationalForm)
  tags?: Array<ITag>;

  // overwrite the default user Dictionary items
  dictionaryData?: Record<string, any>;

  // overwrite the default robot Dictionary items
  dictionaryRobot?: Record<string, any>;

  // base64 || image url // overwrite user image, without overwritting the user dictionary
  userImage?: string;

  // base64 || image url // overwrite robot image, without overwritting the robot dictionary
  robotImage?: string;

  // custom submit callback if button[type=submit] || form.submit() is not wanted..
  submitCallback?: () => void | HTMLButtonElement;

  // can be set to false to allow for loading and packaging
  // of Conversational Form styles within a larger project.
  loadExternalStyleSheet?: boolean;

  // Theme
  theme?: string;

  // prevent auto appending of Conversational Form, append it yourself.
  preventAutoAppend?: boolean;

  // start the form in your own time, {cf-instance}.start(),
  // exclude cf-form from form tag, see examples: manual-start.html
  preventAutoStart?: boolean;

  // prevents the initial auto focus on UserInput
  preventAutoFocus?: boolean;

  // optional horizontal scroll acceleration value, 0-1
  scrollAcceleration?: number;

  // allow for a global validation method, asyncronous,
  // so a value can be validated through a server, call success || error
  flowStepCallback?: (dto: FlowDTO, success: () => void, error: () => void) => void;

  // optional event dispatcher, has to be an instance of cf.EventDispatcher
  eventDispatcher?: EventDispatcher;

  // optional, set microphone nput, future, add other custom inputs, ex. VR
  microphoneInput?: IUserInput;

  // optional, hide ÜserInputField when radio, checkbox, select input is active
  hideUserInputOnNoneTextInput?: boolean;

  // optional, parameters for the User Interface of
  // Conversational Form, set here to show thinking dots or not,
  // set delay time in-between robot responses
  userInterfaceOptions?: IUserInterfaceOptions;

  // optional, Whenther to suppress console.log, default true
  suppressLog?: boolean;

  // Show progressbar
  showProgressBar?: boolean;

  // Prevent submit on Enter keypress: https://github.com/space10-community/conversational-form/issues/270
  preventSubmitOnEnter?: boolean;

  animationsEnabled?: boolean;

  tagRefreshCallback?: (tag: Tag) => void;
}

export type FormlessTagType = 'text' | 'email' | 'tel' | 'checkbox' | 'radio' | 'password' | 'file' | 'audio' | 'numeric'

export type FormlessTag = {
  tag: 'input' | 'cf-robot-message' | 'select'
  type?: FormlessTagType
  name: string
  id?: string
  multiple?: boolean
  children?: FormlessTagChild[]
  'cf-questions': string
}

export type FormlessTagChild = {
  tag?: 'option'
  value: string | number
  'cf-label'?: string
}

// CUI formless options
export interface ConversationalFormlessOptions {
  options: Partial<ConversationalFormOptions>;
  tags: FormlessTag[];
}

export class ConversationalForm {
  public version = '1.0.2';

  public static animationsEnabled = true;

  public static illustrateAppFlow = true;

  public static suppressLog = true;

  public static showProgressBar = false;

  public static preventSubmitOnEnter = false;

  private cdnPath = 'https://cdn.jsdelivr.net/gh/space10-community/conversational-form@{version}/dist/';

  /**
   * createId
   * Id of the instance, to isolate events
   */
  private _createId?: string

  public get createId(): string {
    if (!this._createId) {
      this._createId = new Date().getTime().toString()
    }

    return this._createId
  }

  // instance specific event target
  private _eventTarget?: EventDispatcher;

  public get eventTarget(): EventDispatcher {
    if (!this._eventTarget) {
      this._eventTarget = new EventDispatcher(this)
    }

    return this._eventTarget
  }

  public dictionary: Dictionary;

  public el?: HTMLElement;

  public chatList?: ChatList;

  public uiOptions: IUserInterfaceOptions;

  public options: ConversationalFormOptions;

  public preventSubmitOnEnter?: boolean;

  private context: HTMLElement;

  private formEl: HTMLFormElement;

  private submitCallback?: (cf: ConversationalForm) => void | HTMLButtonElement;

  private onUserAnswerClickedCallback?: () => void;

  private flowStepCallback?: (dto: FlowDTO, success: () => void, error: () => void) => void;

  private tags: Array<ITag | ITagGroup>;

  private flowManager?: FlowManager;

  private isDevelopment = false;

  private loadExternalStyleSheet = true;

  private theme = 'light';

  private preventAutoAppend: boolean | undefined = false;

  private preventAutoStart: boolean | undefined = false;

  private userInput?: UserTextInput;

  private microphoneInputObj?: IUserInput;

  constructor(options: ConversationalFormOptions) {
    // @ts-ignore
    window.ConversationalForm = this

    this.cdnPath = this.cdnPath.split('{version}').join(this.version)

    if (typeof options.suppressLog === 'boolean') { ConversationalForm.suppressLog = options.suppressLog }

    if (typeof options.showProgressBar === 'boolean') { ConversationalForm.showProgressBar = options.showProgressBar }

    if (typeof options.preventSubmitOnEnter === 'boolean') { this.preventSubmitOnEnter = options.preventSubmitOnEnter }

    if (!ConversationalForm.suppressLog) console.log('Conversational Form > version:', this.version)
    if (!ConversationalForm.suppressLog) console.log('Conversational Form > options:', options)

    // @ts-ignore
    window.ConversationalForm[this.createId] = this

    // possible to create your own event dispatcher, so you can tap into the events of the app
    if (options.eventDispatcher) {
      this._eventTarget = options.eventDispatcher as EventDispatcher
    }

    if (!this.eventTarget.cf) { this.eventTarget.cf = this }

    // set a general step validation callback
    if (options.flowStepCallback) { this.flowStepCallback = options.flowStepCallback }

    // eslint-disable-next-line no-multi-assign
    this.isDevelopment = ConversationalForm.illustrateAppFlow = !!document.getElementById('conversational-form-development')

    if (options.loadExternalStyleSheet === false) {
      this.loadExternalStyleSheet = false
    }

    if (typeof options.theme === 'string') { this.theme = options.theme }

    if (options.scrollAcceleration && !Number.isNaN(options.scrollAcceleration)) {
      ScrollController.acceleration = options.scrollAcceleration
    }

    this.preventAutoStart = options.preventAutoStart
    this.preventAutoAppend = options.preventAutoAppend

    if (!options.formEl) { throw new Error('Conversational Form error, the formEl needs to be defined.') }

    this.formEl = options.formEl
    this.formEl.setAttribute('cf-create-id', this.createId)

    if (options.hideUserInputOnNoneTextInput === true) {
      UserInputElement.hideUserInputOnNoneTextInput = true
    }

    if (options.submitCallback) {
      this.submitCallback = options.submitCallback

      if (typeof this.submitCallback === 'string') {
        // Must be a string on window, rewritten to avoid unsafe eval() calls
        const fn = (window as any)[this.submitCallback]

        if (fn) {
          this.submitCallback = fn
        }
      }
    }

    if (this.formEl.getAttribute('cf-no-animation') === '') { ConversationalForm.animationsEnabled = false }

    if (
      typeof options.animationsEnabled === 'boolean'
      && options.animationsEnabled === false
    ) {
      ConversationalForm.animationsEnabled = false
      this.formEl.setAttribute('cf-no-animation', '')
    }

    if (options.preventAutoFocus || this.formEl.getAttribute('cf-prevent-autofocus') === '') { UserInputElement.preventAutoFocus = true }

    this.dictionary = new Dictionary({
      data: options.dictionaryData,
      robotData: options.dictionaryRobot,
      userImage: options.userImage || '',
      robotImage: options.robotImage || '',
      version: this.version
    })

    this.context = options.context ? options.context : document.body
    this.tags = options.tags || []

    if (options.microphoneInput) {
      // validate the user ..... TODO....
      if (!options.microphoneInput.init || !options.microphoneInput.input) {
        console.warn('Conversational Form: microphoneInput is not correctly setup', options.microphoneInput)
        // eslint-disable-next-line no-param-reassign
        options.microphoneInput = undefined
      }
    }

    if (options.microphoneInput) {
      this.microphoneInputObj = options.microphoneInput
    }

    this.uiOptions = Helpers.deepMerge(
      UserInterfaceDefaultOptions, options.userInterfaceOptions || {}
    )

    this.options = options

    this.init()
  }

  public init(): ConversationalForm {
    /* ################## Styles are being loaded locally ##################

    switch (this.theme) {
      case 'dark':
        this.theme = 'conversational-form-dark.min.css'
        if (!this.options.robotImage) this.updateDictionaryValue('robot-image', 'robot', "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='100' fill='%233A3A3C'/%3E%3Crect x='66' y='66' width='68' height='68' fill='%23E5E6EA'/%3E%3C/svg%3E%0A")
        if (!this.options.userImage) this.updateDictionaryValue('user-image', 'user', "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23E5E6EA'/%3E%3Cpath d='M100 55L138.971 122.5H61.0289L100 55Z' fill='%233A3A3C'/%3E%3C/svg%3E%0A")
        break
      case 'green':
        this.theme = 'conversational-form-green.min.css'
        if (!this.options.robotImage) this.updateDictionaryValue('robot-image', 'robot', "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23EEEFF0'/%3E%3Crect x='66' y='66' width='68' height='68' fill='%2300BF75'/%3E%3C/svg%3E%0A")
        if (!this.options.userImage) this.updateDictionaryValue('user-image', 'user', "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='100' fill='%2300BF75'/%3E%3Cpath d='M100 55L138.971 122.5H61.0289L100 55Z' fill='%23EEEFF0'/%3E%3C/svg%3E%0A")
        break
      case 'blue':
        this.theme = 'conversational-form-irisblue.min.css'
        if (!this.options.robotImage) this.updateDictionaryValue('robot-image', 'robot', "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23E8E9EB'/%3E%3Crect x='66' y='66' width='68' height='68' fill='%2300C2DF'/%3E%3C/svg%3E%0A")
        if (!this.options.userImage) this.updateDictionaryValue('user-image', 'user', "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='100' fill='%2300C2DF'/%3E%3Cpath d='M100 55L138.971 122.5H61.0289L100 55Z' fill='%23E8E9EB'/%3E%3C/svg%3E%0A")
        break
      case 'purple':
        this.theme = 'conversational-form-purple.min.css'
        if (!this.options.robotImage) this.updateDictionaryValue('robot-image', 'robot', "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23EEEFF0'/%3E%3Crect x='66' y='66' width='68' height='68' fill='%235A1DE4'/%3E%3C/svg%3E%0A")
        if (!this.options.userImage) this.updateDictionaryValue('user-image', 'user', "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='100' fill='%235A1DE4'/%3E%3Cpath d='M100 55L138.971 122.5H61.0289L100 55Z' fill='%23EEEFF0'/%3E%3C/svg%3E%0A")
        break
      case 'red':
        this.theme = 'conversational-form-red.min.css'
        if (!this.options.robotImage) this.updateDictionaryValue('robot-image', 'robot', "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23E8E9EB'/%3E%3Crect x='66' y='66' width='68' height='68' fill='%23FF3233'/%3E%3C/svg%3E%0A")
        if (!this.options.userImage) this.updateDictionaryValue('user-image', 'user', "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23FF3233'/%3E%3Cpath d='M100 55L138.971 122.5H61.0289L100 55Z' fill='%23E8E9EB'/%3E%3C/svg%3E%0A")
        break
      default:
        this.theme = 'conversational-form.min.css'
    }

    if (this.isDevelopment) {
      // Set path for development
      this.cdnPath = '../build/'

      // strip .min from filename since we do not have minified css in build
      this.theme = this.theme.replace('.min', '')
    }

    if (this.loadExternalStyleSheet) {
      // not in development/examples, so inject production css
      const head: HTMLHeadElement = document.head || document.getElementsByTagName('head')[0]
      const style: HTMLStyleElement = document.createElement('link')
      const githubMasterUrl: string = this.cdnPath + this.theme
      style.type = 'text/css'
      style.media = 'all'
      style.setAttribute('rel', 'stylesheet')
      style.setAttribute('href', githubMasterUrl)
      head.appendChild(style)
    }
    */

    // set context position to relative, else we break out of the box
    const position: string = window.getComputedStyle(this.context).getPropertyValue('position').toLowerCase()
    if (['fixed', 'absolute', 'relative'].indexOf(position) === -1) {
      this.context.style.position = 'relative'
    }

    // if tags are not defined then we will try and build some tags our selves..
    if (!this.tags || this.tags.length === 0) {
      this.tags = []

      const fields: Array<HTMLInputElement | HTMLSelectElement | HTMLButtonElement> = [].slice.call(this.formEl.querySelectorAll('input, select, button, textarea, cf-robot-message'), 0)

      for (let i = 0; i < fields.length; i++) {
        const element = fields[i]
        if (Tag.isTagValid(element)) {
          // ignore hidden tags
          const tag = createTag(element)

          if (tag) {
            this.tags.push(tag)
          }
        }
      }
    } else {
      // tags are manually setup and passed as options.tags.
    }

    // remove invalid tags if they've sneaked in..
    // this could happen if tags are setup manually as we don't
    // encurage to use static Tag.isTagValid
    const indexesToRemove: Array<ITag> = []
    for (let i = 0; i < this.tags.length; i++) {
      const element = this.tags[i]
      if (!element || (element.domElement && !Tag.isTagValid(element.domElement))) {
        indexesToRemove.push(element)
      }
    }

    for (let i = 0; i < indexesToRemove.length; i++) {
      const tag: ITag = indexesToRemove[i]
      this.tags.splice(this.tags.indexOf(tag), 1)
    }

    if (!ConversationalForm.suppressLog && (!this.tags || this.tags.length === 0)) {
      console.warn('Conversational Form: No tags found or registered.')
    }

    // let's start the conversation
    this.tags = this.setupTagGroups(this.tags)
    this.setupUI()

    return this
  }

  /**
  * @name updateDictionaryValue
  * set a dictionary value at "runtime"
  * id: string, id of the value to update
  * type: string, "human" || "robot"
  * value: string, value to be inserted
  */
  public updateDictionaryValue(id: string, type: string, value: string): void {
    Dictionary.set(id, type, value)

    // if(["robot-image", "user-image"].indexOf(id) != -1){
    //   this.chatList.updateThumbnail(id === "robot-image", value);
    // }
  }

  public getFormData(serialized = false): FormData | any {
    if (serialized) {
      const reSerialized: Record<string, string | string[]> = {}

      for (let i = 0; i < this.tags.length; i++) {
        const element = this.tags[i]
        if (element.value) reSerialized[element.name || `tag-${i.toString()}`] = element.value
      }

      return reSerialized
    }
    const formData: FormData = new FormData(this.formEl)
    return formData
  }

  public addRobotChatResponse(response: string): void {
    this.chatList?.createResponse(true, undefined, response)
  }

  /** add a "fake" user response.. */
  public addUserChatResponse(response: string): void {
    this.chatList?.createResponse(false, undefined, response)
  }

  public stop(optionalStoppingMessage = ''): void {
    this.flowManager?.stop()
    if (optionalStoppingMessage !== '') {
      this.chatList?.createResponse(true, undefined, optionalStoppingMessage)
    }

    this.userInput?.onFlowStopped()
  }

  public start(): void {
    if (this.userInput) {
      this.userInput.disabled = false
      this.userInput.visible = true
    }

    this.flowManager?.start()
  }

  public getTag(nameOrIndex: string | number): ITag | null {
    if (typeof nameOrIndex === 'number') {
      return this.tags[nameOrIndex]
    }

    return this.tags.find((tag) => tag.name === nameOrIndex) as ITag
  }

  private setupTagGroups(tags: Array<ITag>): Array<ITag | ITagGroup> {
    // make groups, from input tag[type=radio | type=checkbox]
    // groups are used to bind logic like radio-button or checkbox dependencies
    const groups: any = []
    for (let i = 0; i < tags.length; i++) {
      const tag: ITag = tags[i]
      if (tag.type === 'radio' || tag.type === 'checkbox') {
        if (!groups[tag.name]) { groups[tag.name] = [] }

        groups[tag.name].push(tag)
      }
    }

    if (Object.keys(groups).length > 0) {
      // eslint-disable-next-line no-restricted-syntax
      for (const group in groups) {
        if (groups[group].length > 0) {
          // always build groupd when radio or checkbox

          // find the fieldset, if any..
          const isFieldsetValidForCF = (tag: HTMLElement): boolean => tag && tag.tagName.toLowerCase() !== 'fieldset' && !tag.hasAttribute('cf-questions')

          let fieldset: HTMLElement | null = groups[group][0].domElement.parentNode
          if (fieldset && fieldset.tagName.toLowerCase() !== 'fieldset') {
            fieldset = fieldset.parentNode as HTMLElement
            if (isFieldsetValidForCF(fieldset)) {
              // not a valid fieldset, we only accept fieldsets that contain cf attr
              fieldset = null
            }
          }

          const tagGroup: TagGroup = new TagGroup({
            fieldset: fieldset as HTMLFieldSetElement, // <-- can be null
            elements: groups[group]
          })

          // remove the tags as they are now apart of a group
          for (let i = 0; i < groups[group].length; i++) {
            const tagToBeRemoved: InputTag = groups[group][i]
            if (i === 0) {
              // add the group at same index as the the first tag to be removed
              tags.splice(tags.indexOf(tagToBeRemoved), 1, tagGroup)
            } else {
              tags.splice(tags.indexOf(tagToBeRemoved), 1)
            }
          }
        }
      }
    }

    return tags
  }

  private setupUI() {
    // start the flow
    this.flowManager = new FlowManager({
      cfReference: this,
      flowStepCallback: this.flowStepCallback,
      eventTarget: this.eventTarget,
      tags: this.tags
    })

    this.el = document.createElement('div')
    this.el.id = 'conversational-form'
    this.el.className = 'conversational-form'

    this.addBrowserTypes(this.el)

    if (ConversationalForm.animationsEnabled) { this.el.classList.add('conversational-form--enable-animation') }

    // add conversational form to context
    if (!this.preventAutoAppend) { this.context.appendChild(this.el) }

    // hide until stylesheet is rendered
    this.el.style.visibility = 'hidden'

    const innerWrap = document.createElement('div')
    innerWrap.className = 'conversational-form-inner'
    this.el.appendChild(innerWrap)

    // Conversational Form UI
    this.chatList = new ChatList({
      eventTarget: this.eventTarget,
      cfReference: this
    })

    innerWrap.appendChild(this.chatList.el)

    this.userInput = new UserTextInput({
      microphoneInputObj: this.microphoneInputObj,
      eventTarget: this.eventTarget,
      cfReference: this
    })

    if (ConversationalForm.showProgressBar) {
      const progressBar = new ProgressBar(this)
      innerWrap.appendChild(progressBar.el)
    }

    this.chatList.addInput(this.userInput)

    innerWrap.appendChild(this.userInput.el)

    // @ts-ignore
    this.onUserAnswerClickedCallback = this.onUserAnswerClicked.bind(this)
    // @ts-ignore
    this.eventTarget.addEventListener(
      ChatResponseEvents.USER_ANSWER_CLICKED, this.onUserAnswerClickedCallback || null, false
    )

    this.el.classList.add('conversational-form--show')

    if (!this.preventAutoStart) { this.flowManager.start() }

    if (!this.tags || this.tags.length === 0) {
      // no tags, so just show the input
      this.userInput.visible = true
    }
  }

  /**
  * @name onUserAnswerClicked
  * on user ChatReponse clicked
  */
  private onUserAnswerClicked(event: CustomEvent): void {
    const tag: ITag | ITagGroup = event.detail
    this.flowManager?.editTag(tag)
  }

  private addBrowserTypes(el: Element): void {
    if (navigator.userAgent.indexOf('Firefox') > -1) el.classList.add('browser-firefox')
    if (/Edge/.test(navigator.userAgent)) el.classList.add('browser-edge')
  }

  /**
  * @name addTag
  * Add a tag to the conversation. This can be used to add tags at runtime
  * see examples/formless.html
  */
  public addTags(tagsData: Array<DataTag>, addAfterCurrentStep = true, atIndex = -1): void {
    let tags: Array<ITag | ITagGroup> = []

    for (let i = 0; i < tagsData.length; i++) {
      const tagData: DataTag = tagsData[i]

      if (tagData.tag === 'fieldset') {
        // group ..
        // const fieldSetChildren: Array<DataTag> = tagData.children;
        // parse group tag
        const groupTag = TagsParser.parseGroupTag(tagData)

        for (let j = 0; j < groupTag.children.length; j++) {
          const tag = groupTag.children[j] as HTMLElement

          if (Tag.isTagValid(tag) && tag) {
            const createdTag = createTag(
              tag as HTMLInputElement | HTMLSelectElement | HTMLButtonElement
            )

            if (createdTag) {
              const tagElement: ITag = createdTag

              // add ref for group creation
              if (!tagElement.name) {
                tagElement.name = `tag-ref-${j.toString()}`
              }

              tags.push(tagElement)
            }
          }
        }
      } else {
        const tag: HTMLElement | HTMLInputElement | HTMLSelectElement | HTMLButtonElement = tagData.tag === 'select' ? TagsParser.parseGroupTag(tagData) : TagsParser.parseTag(tagData)
        if (Tag.isTagValid(tag)) {
          const createdTag = createTag(
            tag as HTMLInputElement | HTMLSelectElement | HTMLButtonElement
          )

          if (createdTag) {
            const tagElement: ITag = createdTag
            tags.push(tagElement)
          }
        }
      }
    }

    // map free roaming checkbox and radio tags into groups
    tags = this.setupTagGroups(tags as ITag[])

    // add new tags to the flow
    const addedTags = this.flowManager?.addTags(
      tags, addAfterCurrentStep ? this.flowManager.getStep() + 1 : atIndex
    )

    if (addedTags) {
      this.tags = addedTags
    }
  }

  /**
  * @name remapTagsAndStartFrom
  * index: number, what index to start from
  * setCurrentTagValue: boolean, usually this
  * method is called when wanting to loop or skip over questions,
  * therefore it might be usefull to set the value of the current tag before changing index.
  * ignoreExistingTags: boolean, possible to ignore existing tags,
  * to allow for the flow to just "happen"
  */
  public remapTagsAndStartFrom(
    index = 0,
    setCurrentTagValue = false,
    ignoreExistingTags = false
  ): void {
    if (setCurrentTagValue) {
      const flowDto = this.userInput?.getFlowDTO()

      if (flowDto) {
        this.chatList?.setCurrentUserResponse(flowDto)
      }
    }
    // possibility to start the form flow over from {index}
    for (let i = 0; i < this.tags.length; i++) {
      const tag: ITag | ITagGroup = this.tags[i]
      tag.refresh()
    }

    this.flowManager?.startFrom(index, ignoreExistingTags)
  }

  /**
  * @name focus
  * Sets focus on Conversational Form
  */
  public focus(): void {
    if (this.userInput) { this.userInput.setFocusOnInput() }
  }

  public doSubmitForm(): void {
    this.el?.classList?.add('done')

    this.userInput?.reset()

    if (this.submitCallback) {
      // remove should be called in the submitCallback
      this.submitCallback(this)
    } else {
      // this.formEl.submit();
      // doing classic .submit wont trigger onsubmit if that is present on form element
      // as described here: http://wayback.archive.org/web/20090323062817/http://blogs.vertigosoftware.com/snyholm/archive/2006/09/27/3788.aspx
      // so we mimic a click.
      const button: HTMLButtonElement = this.formEl.ownerDocument.createElement('button')
      button.style.display = 'none'
      button.type = 'submit'
      this.formEl.appendChild(button)
      button.click()
      this.formEl.removeChild(button)

      // remove conversational
      this.remove()
    }
  }

  public remove(): void {
    if (this.microphoneInputObj) {
      // @ts-ignore
      this.microphoneInputObj = null
    }

    if (this.onUserAnswerClickedCallback) {
      this.eventTarget.removeEventListener(
        ChatResponseEvents.USER_ANSWER_CLICKED,
        this.onUserAnswerClickedCallback,
        false
      )
      // @ts-ignore
      this.onUserAnswerClickedCallback = null
    }

    if (this.flowManager) { this.flowManager.dealloc() }
    if (this.userInput) { this.userInput.dealloc() }
    if (this.chatList) { this.chatList.dealloc() }

    // @ts-ignore
    this.dictionary = null
    // @ts-ignore
    this.flowManager = null
    // @ts-ignore
    this.userInput = null
    // @ts-ignore
    this.chatList = null
    // @ts-ignore
    this.context = null
    // @ts-ignore
    this.formEl = null
    // @ts-ignore
    this.tags = null

    // @ts-ignore
    this.submitCallback = null
    // @ts-ignore
    this.el.parentNode.removeChild(this.el)
    // @ts-ignore
    this.el = null

    // @ts-ignore
    window.ConversationalForm[this.createId] = null
  }

  // to illustrate the event flow of the app
  public static illustrateFlow(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    classRef: any,
    type: string,
    eventType: string,
    detail: any = null
  ): void {
    if (ConversationalForm.illustrateAppFlow) {
      const highlight = `font-weight: 900; background: ${type === 'receive' ? '#e6f3fe' : 'pink'}; color: black; padding: 0px 5px;`
      if (!ConversationalForm.suppressLog) console.log(`%c** event flow: %c${eventType}%c flow type: %c${type}%c from: %c${classRef.constructor.name}`, 'font-weight: 900;', highlight, 'font-weight: 400;', highlight, 'font-weight: 400;', highlight)
      if (detail) { if (!ConversationalForm.suppressLog) console.log('** event flow detail:', detail) }
    }
  }

  private static hasAutoInstantiated = false;

  public static startTheConversation(
    data: ConversationalFormOptions | ConversationalFormlessOptions
  ): ConversationalForm {
    const isFormless = (
      options: ConversationalFormOptions | ConversationalFormlessOptions
    ): options is ConversationalFormlessOptions => !(options as ConversationalFormOptions).formEl

    let formlessTags: any
    let constructorOptions: Partial<ConversationalFormOptions>

    if (isFormless(data)) {
      if (typeof data === 'string') {
        // Formless init w. string
        const json: any = JSON.parse(data)
        constructorOptions = (json as ConversationalFormlessOptions).options
        formlessTags = (json as ConversationalFormlessOptions).tags
      } else {
        // Formless init w. JSON object
        constructorOptions = data.options
        formlessTags = data.tags
      }

      // formless, so generate the pseudo tags
      const formEl = TagsParser.parseJSONIntoElements(formlessTags)
      constructorOptions.formEl = formEl
      const instanceCF = new ConversationalForm(constructorOptions as ConversationalFormOptions)
      if (instanceCF.flowManager) {
        instanceCF.flowManager.tagRefreshCallback = data.options.tagRefreshCallback
      }

      return instanceCF
    }
    // keep it standard
    constructorOptions = data

    return new ConversationalForm(constructorOptions as ConversationalFormOptions)
  }

  public static autoStartTheConversation(): void {
    if (ConversationalForm.hasAutoInstantiated) { return }

    // auto start the conversation
    let formElements = document.querySelectorAll('form[cf-form]')

    // no form elements found, look for the old init attribute
    if (formElements.length === 0) {
      formElements = document.querySelectorAll('form[cf-form-element]')
    }

    const formContexts = document.querySelectorAll('*[cf-context]')

    if (formElements && formElements.length > 0) {
      for (let i = 0; i < formElements.length; i++) {
        const form = formElements[i] as HTMLFormElement
        const context = formContexts[i] as HTMLFormElement
        ConversationalForm.startTheConversation({
          formEl: form,
          context
        })
      }

      ConversationalForm.hasAutoInstantiated = true
    }
  }
}
