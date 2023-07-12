export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const existsVisible = (page, selector) => page.evaluate((selector) => {
  const el = document.querySelector(selector)
  if(!el) return false
  const rect = el.getBoundingClientRect();

  const margin = 50

  return el && (el.offsetWidth > 0 || el.offsetHeight > 0) && (
    rect.top >= -margin &&
    rect.left >= -margin &&
    rect.bottom <= (document.documentElement.clientHeight + margin) &&
    rect.right <= (document.documentElement.clientWidth + margin)
  )
}, selector)

export const textContent = (page, selector) => page.evaluate((selector) => {
  const el = document.querySelector(selector)
  return el && el.textContent.trim()
}, selector)


export const clickOn = (page, selector) => {
  return page.evaluate((selector) => {
    const el = document.querySelector(selector)
    const clickEvent = new MouseEvent('click', {
      bubbles: true,  // Whether the event should bubble up through the DOM or not
      cancelable: true,  // Whether the event is cancelable or not
      view: window,  // The window object associated with the event
      // Additional properties like clientX, clientY, etc. can be set if required
    });

    el.dispatchEvent(clickEvent);
  }, selector)
}
