import { Button } from './Button'

export class CheckboxButton extends Button {
  public get type(): string {
    return 'CheckboxButton'
  }

  public get checked(): boolean {
    return this.el.getAttribute('checked') === 'checked'
  }

  public set checked(value: boolean) {
    if (!value) {
      this.el.removeAttribute('checked');
      (this.referenceTag.domElement as HTMLInputElement).removeAttribute('checked');
      (this.referenceTag.domElement as HTMLInputElement).checked = false
    } else {
      this.el.setAttribute('checked', 'checked');
      (this.referenceTag.domElement as HTMLInputElement).setAttribute('checked', 'checked');
      (this.referenceTag.domElement as HTMLInputElement).checked = true
    }
  }

  protected onClick(event: MouseEvent): void {
    this.checked = !this.checked
  }

  // override
  public getTemplate(): string {
    const isChecked = !!((this.referenceTag.domElement as HTMLInputElement).checked && this.referenceTag.domElement?.hasAttribute('checked'))

    return `<cf-button class="cf-button cf-checkbox-button ${this.referenceTag.label.trim().length === 0 ? 'no-text' : ''}" checked=${isChecked ? 'checked' : ''}>
        <div>
          <cf-checkbox></cf-checkbox>
          <span>${this.referenceTag.label}</span>
        </div>
      </cf-button>
      `
  }
}
