/**
 * Gtag helper class
 */
class Tracking {
  constructor() {
    this.enabled = false;
    const scriptSrc = document.querySelector('script[src*="gtag"]');
    // eslint-disable-next-line prefer-destructuring
    this.gaPropertyId = scriptSrc && scriptSrc.hasAttribute('src') ? scriptSrc.src.split('?id=')[1] : false;
  }

  hasGtag() {
    this.enabled = typeof window.gtag !== 'undefined';
    return this.enabled;
  }

  event(category, action, label, value) {
    if (!this.hasGtag()) return false;

    if (!this.gaPropertyId) {
      this.log('Missing dataLayer. Is gtag loaded?');
      return false;
    }

    window.gtag('event', this.gaPropertyId, {
      event_category: category,
      event_action: action,
      event_label: label,
      value,
    });

    return true;
  }

  pageview() {
    if (!this.hasGtag()) return false;

    if (!this.gaPropertyId) {
      this.log('Missing dataLayer. Is gtag loaded?');
      return false;
    }

    window.gtag('config', this.gaPropertyId, {
      page_title: document.title,
      page_path: `${window.location.pathname}${window.location.search}`,
    });

    return true;
  }

  registerAllExternalLinks() {
    if (typeof window === 'undefined') return;
    if (this.hasGtag()) {
      const a = document.querySelectorAll('a[href^="http"]:not([hastracking])');
      for (let i = 0; i < a.length; i += 1) {
        if (a[i].href !== '') {
          a[i].setAttribute('hastracking', 'true');
          a[i].onclick = (function ct(_this, href) {
            return function track() {
              _this.event('Ext. link', href);
            };
          }(this, a[i].href));
        }
      }
    }
  }

  log(message) {
    if (!this.debug) return;
    console.log(message);
  }
}

export default (new Tracking());
