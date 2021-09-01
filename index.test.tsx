import React from 'react'
import ReactDOM from 'react-dom'
import {act} from 'react-dom/test-utils'
import {useDevicePixelRatio, getDevicePixelRatio} from './index'

let container: HTMLDivElement

beforeEach(() => {
  assignWindowProp('devicePixelRatio', 1) // Reset to 1 by default
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }
  document.body.removeChild(container)
})

describe('hook', () => {
  it('renders with no options', () => {
    const Test = () => {
      const dpr = useDevicePixelRatio()
      return <>DPR is {dpr}</>
    }

    act(() => {
      ReactDOM.render(<Test />, container)
    })
    expect(container.textContent).toBe('DPR is 1')
  })

  it('renders with no options and no devicePixelRatio window prop', () => {
    assignWindowProp('devicePixelRatio', undefined)
    const Test = () => {
      const dpr = useDevicePixelRatio()
      return <>DPR is {dpr}</>
    }

    act(() => {
      ReactDOM.render(<Test />, container)
    })
    expect(container.textContent).toBe('DPR is 1')
  })

  it('renders with custom default device pixel ratio', () => {
    assignWindowProp('devicePixelRatio', undefined)
    const Test = () => {
      const dpr = useDevicePixelRatio({defaultDpr: 2})
      return <>DPR is {dpr}</>
    }

    act(() => {
      ReactDOM.render(<Test />, container)
    })
    expect(container.textContent).toBe('DPR is 2')
  })

  it('rounds down by default', () => {
    assignWindowProp('devicePixelRatio', Math.PI)
    const Test = () => {
      const dpr = useDevicePixelRatio()
      return <>DPR is {dpr}</>
    }

    act(() => {
      ReactDOM.render(<Test />, container)
    })
    expect(container.textContent).toBe('DPR is 3')
  })

  it('can be told not to round down', () => {
    assignWindowProp('devicePixelRatio', 2.14)
    const Test = () => {
      const dpr = useDevicePixelRatio({round: false})
      return <>DPR is {dpr}</>
    }

    act(() => {
      ReactDOM.render(<Test />, container)
    })
    expect(container.textContent).toBe('DPR is 2.14')
  })

  it('limits to 3 dpr by default', () => {
    assignWindowProp('devicePixelRatio', 5)
    const Test = () => {
      const dpr = useDevicePixelRatio()
      return <>DPR is {dpr}</>
    }

    act(() => {
      ReactDOM.render(<Test />, container)
    })
    expect(container.textContent).toBe('DPR is 3')
  })

  it('can be given custom maximum dpr', () => {
    assignWindowProp('devicePixelRatio', 5)
    const Test = () => {
      const dpr = useDevicePixelRatio({maxDpr: 4})
      return <>DPR is {dpr}</>
    }

    act(() => {
      ReactDOM.render(<Test />, container)
    })
    expect(container.textContent).toBe('DPR is 4')
  })

  it('reacts to changes in dpr', () => {
    const matchMedia = getMockedMatchMedia()
    assignWindowProp('matchMedia', matchMedia)
    assignWindowProp('devicePixelRatio', 2)
    const Test = () => {
      const dpr = useDevicePixelRatio()
      return <>DPR is {dpr}</>
    }

    act(() => {
      ReactDOM.render(<Test />, container)
    })
    expect(container.textContent).toBe('DPR is 2')

    act(() => {
      assignWindowProp('devicePixelRatio', 1)
      matchMedia.trigger()
    })

    expect(container.textContent).toBe('DPR is 1')
  })
})

describe('function', () => {
  it('can get with no options', () => {
    expect(getDevicePixelRatio()).toBe(1)
  })

  it('get with no options and no devicePixelRatio window prop', () => {
    assignWindowProp('devicePixelRatio', undefined)
    expect(getDevicePixelRatio()).toBe(1)
  })

  it('get with custom default device pixel ratio', () => {
    assignWindowProp('devicePixelRatio', undefined)
    expect(getDevicePixelRatio({defaultDpr: 2})).toBe(2)
  })

  it('rounds down by default', () => {
    assignWindowProp('devicePixelRatio', Math.PI)
    expect(getDevicePixelRatio()).toBe(3)
  })

  it('can be told not to round down', () => {
    assignWindowProp('devicePixelRatio', 2.14)
    expect(getDevicePixelRatio({round: false})).toBe(2.14)
  })

  it('limits to 3 dpr by default', () => {
    assignWindowProp('devicePixelRatio', 5)
    expect(getDevicePixelRatio()).toBe(3)
  })

  it('can be given custom maximum dpr', () => {
    assignWindowProp('devicePixelRatio', 5)
    expect(getDevicePixelRatio({maxDpr: 4})).toBe(4)
  })
})

/**
 * This monstrosity is to test the reactivity of `matchMedia`,
 * which JSDom doesn't expose. Apologies in advance :shrugs:
 */
function getMockedMatchMedia() {
  let handlers: EventListenerOrEventListenerObject[] = []

  const matchMedia = (
    _query: string
  ): Pick<MediaQueryList, 'addEventListener' | 'removeEventListener'> => {
    return {
      addEventListener: (_type: 'change', listener: EventListenerOrEventListenerObject) => {
        handlers.push(listener)
      },
      removeEventListener: (_type: 'change', listener: EventListenerOrEventListenerObject) => {
        handlers = handlers.filter((handler) => handler !== listener)
      },
    }
  }

  matchMedia.trigger = () => {
    handlers.forEach((handler) => {
      if (typeof handler === 'function') {
        handler({} as Event)
      }
    })
  }

  return matchMedia
}

/**
 * Ugly workaround for overriding read-only `devicePixelRatio` and
 * `matchMedia` props on JSDom `window`. Again - apologies.
 */
function assignWindowProp(propName: string, value: any) {
  const win = window as any
  win[propName] = value
}
