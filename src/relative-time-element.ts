import RelativeTime from './relative-time'
import ExtendedTimeElement from './extended-time-element'
import {localeFromElement} from './utils'

export default class RelativeTimeElement extends ExtendedTimeElement {
  getFormattedDate(): string | undefined {
    const date = this.date
    if (!date) return

    const isPhrase = !this.hasAttribute('is-phrase') || this.getAttribute('is-phrase') === 'true'
    return new RelativeTime(date, localeFromElement(this), isPhrase).toString()
  }

  connectedCallback(): void {
    nowElements.push(this)

    if (!updateNowElementsId) {
      updateNowElements()
      updateNowElementsId = window.setInterval(updateNowElements, 60 * 1000)
    }
    super.connectedCallback()
  }

  disconnectedCallback(): void {
    const ix = nowElements.indexOf(this)
    if (ix !== -1) {
      nowElements.splice(ix, 1)
    }

    if (!nowElements.length) {
      if (updateNowElementsId) {
        clearInterval(updateNowElementsId)
        updateNowElementsId = null
      }
    }
  }
}

// Internal: Array tracking all elements attached to the document that need
// to be updated every minute.
const nowElements: RelativeTimeElement[] = []

// Internal: Timer ID for `updateNowElements` interval.
let updateNowElementsId: number | null

// Internal: Install a timer to refresh all attached relative-time elements every
// minute.
function updateNowElements() {
  let time, i, len
  for (i = 0, len = nowElements.length; i < len; i++) {
    time = nowElements[i]
    time.textContent = time.getFormattedDate() || ''
  }
}

// Public: RelativeTimeElement constructor.
//
//   var time = new RelativeTimeElement()
//   # => <relative-time></relative-time>
//
if (!window.customElements.get('relative-time')) {
  window.RelativeTimeElement = RelativeTimeElement
  window.customElements.define('relative-time', RelativeTimeElement)
}

declare global {
  interface Window {
    RelativeTimeElement: typeof RelativeTimeElement
  }
  interface HTMLElementTagNameMap {
    'relative-time': RelativeTimeElement
  }
}
