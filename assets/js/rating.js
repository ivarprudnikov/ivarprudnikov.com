(function (window, document) {

  var btnPositiveId = 'recordPositive'
  var btnNegativeId = 'recordNegative'
  var btnActiveClass = 'active'
  var btnSelectedClass = 'selected'
  var popupTimeouts = {}
  var POSITIVE = 'POSITIVE'
  var NEGATIVE = 'NEGATIVE'
  var eventCategory = 'Rating'
  var STORAGE_KEY = 'rating'
  var TIMEOUT = 2000
  var PAGE = window.location.pathname

  var elPositive = document.getElementById(btnPositiveId)
  if (elPositive)
    elPositive.addEventListener('click', recordPositive)
  var elNegative = document.getElementById(btnNegativeId)
  if (elNegative)
    elNegative.addEventListener('click', recordNegative)

  focusActiveButton()

  function focusActiveButton () {
    var storage = getStorage()
    var existingRating = storage[PAGE]
    switch (existingRating) {
      case POSITIVE:
        addClass(elPositive, btnSelectedClass)
        removeClass(elNegative, btnSelectedClass)
        break
      case NEGATIVE:
        removeClass(elPositive, btnSelectedClass)
        addClass(elNegative, btnSelectedClass)
        break
      default:
        removeClass(elPositive, btnSelectedClass)
        removeClass(elNegative, btnSelectedClass)
    }
  }

  function recordPositive () {
    triggerActiveClass(btnPositiveId)
    recordEvent(true)
    focusActiveButton()
  }

  function recordNegative () {
    triggerActiveClass(btnNegativeId)
    recordEvent(false)
    focusActiveButton()
  }

  function addClass (el, className) {
    if (!el) return
    var initialClasses = el.className || ''
    var classesArr = initialClasses.split(' ')
    var classNameIndex = classesArr.indexOf(className)
    if (classNameIndex < 0) {
      classesArr.push(className)
    }
    el.className = classesArr.join(' ')
  }

  function removeClass (el, className) {
    if (!el) return
    var initialClasses = el.className || ''
    var classesArr = initialClasses.split(' ')
    var classNameIndex = classesArr.indexOf(className)
    if (classNameIndex > -1) {
      classesArr.splice(classNameIndex, 1)
    }
    el.className = classesArr.join(' ')
  }

  function getStorage () {
    var storageParsed = {}
    if (window.localStorage != null) {
      var storage = window.localStorage.getItem(STORAGE_KEY)
      try {
        storageParsed = JSON.parse(storage) || {}
      } catch (e) {
        storageParsed = {}
      }
    }
    return storageParsed
  }

  function setStorage (obj) {
    if (window.localStorage != null) {
      if (obj == null) {
        window.localStorage.removeItem(STORAGE_KEY)
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
      }
    }
  }

  function recordEvent (isPositive) {

    var storage = getStorage()
    var existingRating = storage[PAGE]
    var currentRating = isPositive ? POSITIVE : NEGATIVE

    if (existingRating == null || existingRating !== currentRating) {
      storage[PAGE] = currentRating
      setStorage(storage)
      if (typeof window.ga === 'function') {
        window.ga('send', 'event', eventCategory, currentRating, PAGE, {
          nonInteraction: true
        })
      }
    }
  }

  function triggerActiveClass (elId) {

    var el = document.getElementById(elId)

    // 1. clear existing timeout if any
    var popupTimeout = popupTimeouts[elId]
    if (popupTimeout != null) {
      window.clearTimeout(popupTimeout)
    }

    // 2. remove active class if any
    removeClass(el, btnActiveClass)

    // 3. add active class
    window.setTimeout(function () {
      addClass(el, btnActiveClass)
    }, 5)

    popupTimeouts[elId] = window.setTimeout(function () {
      // 4. remove active class
      removeClass(el, btnActiveClass)
    }, TIMEOUT)
  }

}(window, document))
