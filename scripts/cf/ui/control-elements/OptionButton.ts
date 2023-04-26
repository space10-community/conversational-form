/* eslint-disable class-methods-use-this */
import { ConversationalForm } from '../../ConversationalForm'
import { Button } from './Button'
import { IControlElementOptions } from './ControlElement'

// interface

export interface IOptionButtonOptions extends IControlElementOptions {
  isMultiChoice: boolean;
}

export const OptionButtonEvents = {
  CLICK: 'cf-option-button-click'
}

// class
export class OptionButton extends Button {
  private isMultiChoice = false;

  public get type(): string {
    return 'OptionButton'
  }

  public get selected(): boolean {
    return this.el.hasAttribute('selected')
  }

  public set selected(value: boolean) {
    if (value) {
      this.el.setAttribute('selected', 'selected')
    } else {
      this.el.removeAttribute('selected')
    }
  }

  protected setData(options: IOptionButtonOptions): void {
    this.isMultiChoice = options.isMultiChoice
    super.setData(options)
  }

  protected onClick(event: MouseEvent): void {
    ConversationalForm.illustrateFlow(this, 'dispatch', OptionButtonEvents.CLICK, this)
    this.eventTarget.dispatchEvent(new CustomEvent(OptionButtonEvents.CLICK, {
      detail: this
    }))
  }

  // override
  public getTemplate(): string {
    // be aware that first option element on none multiple select tags will be selected by default

    // select first option only if there is only one option and if it is not multiple choice
    const selected = !(this.referenceTag.domElement as HTMLOptionElement).previousSibling
    && !(this.referenceTag.domElement as HTMLOptionElement).nextSibling
    && !this.isMultiChoice
    && (this.referenceTag.domElement as HTMLOptionElement).selected

    let tmpl = `<cf-button class="cf-button ${this.isMultiChoice ? 'cf-checkbox-button' : ''}" ${selected ? "selected='selected'" : ''}>`

    tmpl += '<div>'
    if (this.isMultiChoice) { tmpl += '<cf-checkbox></cf-checkbox>' }

    tmpl += this.referenceTag.label
    tmpl += '</div>'

    tmpl += '</cf-button>'

    return tmpl
  }
}
