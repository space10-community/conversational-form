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

/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
// interface

export interface TouchVector2d {
  x: number,
  y: number,
  touches: Array<any>,
}

// class
export class Helpers {
  public static lerp(norm: number, min: number, max: number): number {
    return (max - min) * norm + min
  }

  public static norm(value: number, min: number, max: number): number {
    return (value - min) / (max - min)
  }

  public static getXYFromMouseTouchEvent(event: Event | MouseEvent | TouchEvent): TouchVector2d {
    let touches: any[] | null = null

    if ((event as any).originalEvent) {
      touches = (event as any).originalEvent.touches || (event as any).originalEvent.changedTouches
    } else if ((event as TouchEvent).changedTouches) {
      touches = (event as TouchEvent).changedTouches as any
    }

    if (touches) {
      return { x: touches[0].pageX, y: touches[0].pageY, touches: touches[0] }
    }

    return { x: (event as MouseEvent).pageX, y: (event as MouseEvent).pageY, touches: [] }
  }

  public static getInnerTextOfElement(element: Element): string {
    const tmp = document.createElement('DIV')
    tmp.innerHTML = element.innerHTML
    // return
    let text: string = tmp.textContent || tmp.innerText || ''
    // text = String(text).replace('\t','');
    text = String(text).replace(/^\s+|\s+$/g, '')

    return text
  }

  public static getMouseEvent(eventString: string): string {
    const mappings: any = []
    mappings.click = 'ontouchstart' in window ? 'touchstart' : 'click'
    mappings.mousedown = 'ontouchstart' in window ? 'touchstart' : 'mousedown'
    mappings.mouseup = 'ontouchstart' in window ? 'touchend' : 'mouseup'
    mappings.mousemove = 'ontouchstart' in window ? 'touchmove' : 'mousemove'

    return mappings[eventString]
  }

  public static isInternetExlorer(): boolean {
    const ua = window.navigator.userAgent
    const msie = ua.indexOf('MSIE ')
    return msie > 0 || !!navigator.userAgent.match(/Trident.*rv:11\./)
  }

  public static caniuse = {
    fileReader: (): boolean => {
      if (window.File && window.FileReader && window.FileList && window.Blob) {
        return true
      }

      return false
    }
  }

  public static getValuesOfBars(str: string): Array<string> {
    let strs: Array<string> = str.split('||')

    // TODO: remove single |
    // fallback to the standard
    if (strs.length <= 1) { strs = str.split('|') }

    return strs
  }

  public static setTransform(el: HTMLElement, transformString: string): void {
    el.style['-webkit-transform' as any] = transformString
    el.style['-moz-transform' as any] = transformString
    el.style['-ms-transform' as any] = transformString
    el.style.transform = transformString
  }

  /**
   * https://stackoverflow.com/a/70452304/10416161
   */
  public static deepMerge(
    target: Record<string, any>, ...sources: Record<string, any>[]
  ): Record<string, any> {
    if (!sources.length) {
      return target
    }

    Object.entries(sources.shift() ?? []).forEach(([key, value]) => {
      if (!target[key]) {
        Object.assign(target, { [key]: {} })
      }

      if (
        value.constructor === Object
        || (value.constructor === Array && value.find((v) => v.constructor === Object))
      ) {
        Helpers.deepMerge(target[key], value)
      } else if (value.constructor === Array) {
        Object.assign(target, {
          [key]: value.find((v) => v.constructor === Array)
            ? target[key].concat(value)
            : [...new Set([...target[key], ...value])]
        })
      } else {
        Object.assign(target, { [key]: value })
      }
    })

    return target
  }
}
