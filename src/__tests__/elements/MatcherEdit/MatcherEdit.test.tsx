import MatcherEdit from '../../../component/elements/MatcherEdit'
import {
  hasFocusContext,
  configContext,
} from '../../../component/state/context'
import { act, fireEvent, render } from '@testing-library/react'
import Matcher, { Comparison, Operator } from '../../../component/types/Matcher'
import { singleMatcher, testConfig } from '../../testData'
import { delay } from '../../testUtils'

describe('MatcherEdit', () => {
  it('basic render with no matcher', () => {
    const result = createMatcherEdit(true)
    const element = result.container.querySelector('#edit_input')
    expect(element).toHaveValue('')
  })

  it('basic render with first matcher', () => {
    const result = createMatcherEdit(true, singleMatcher[0])
    const element = result.container.querySelector('#test_input')
    expect(element).toHaveValue('=text')
  })

  it('basic render with not first matcher', () => {
    const result = createMatcherEdit(false, singleMatcher[0])
    const element = result.container.querySelector('#test_input')
    expect(element).toHaveValue('& =text')
  })

  it.each<[string, Operator, Comparison]>([
    ['= a', '&', '='],
    ['! a', '&', '!'],
    ['> 1', '&', '>'],
    ['< 1', '&', '<'],
    ['>= 1', '&', '>='],
    ['<= 1', '&', '<='],
    ['* as', '&', '*'], // will use reg ex - dependent on precedence
    ['!* as', '&', '!*'],
    ['& = a', '&', '='],
    ['& ! a', '&', '!'],
    ['& > 1', '&', '>'],
    ['& < 1', '&', '<'],
    ['& >= 1', '&', '>='],
    ['& <= 1', '&', '<='],
    ['& * as', '&', '*'],
    ['& !* as', '&', '!*'],
    ['| = a', '|', '='],
    ['| ! a', '|', '!'],
    ['| > 1', '|', '>'],
    ['| < 1', '|', '<'],
    ['| >= 1', '|', '>='],
    ['| <= 1', '|', '<='],
    ['| * as', '|', '*'],
    ['| !* as', '|', '!*'],
  ])('For symbol %p and operator %p', (val, operator, comparison) => {
    let matcher: Matcher | null | undefined
    const result = createMatcherEdit(false, undefined, {
      onMatcherChanged: (m) => {
        matcher = m
        return true
      },
    })
    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && act(() => fireEvent.change(input, { target: { value: val } }))
    input && fireEvent.keyDown(input, { code: 'Enter' })
    expect(matcher?.comparison).toBe(comparison)
    expect(matcher?.operator).toBe(operator)
  })

  it('test pg up', async () => {
    let matcher: Matcher | null | undefined
    const result = createMatcherEdit(false, undefined, {
      onMatcherChanged: (m) => {
        matcher = m
        return true
      },
    })
    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && act(() => fireEvent.change(input, { target: { value: 'loa' } }))
    await act(() => delay(500))
    input && fireEvent.keyDown(input, { code: 'PageUp' })
    input && fireEvent.keyDown(input, { code: 'Enter' })
    expect(matcher?.text).toBe('loadxx')
  })

  it('test pg down', async () => {
    let matcher: Matcher | null | undefined
    const result = createMatcherEdit(false, undefined, {
      onMatcherChanged: (m) => {
        matcher = m
        return true
      },
    })
    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && act(() => fireEvent.change(input, { target: { value: 'loa' } }))
    await act(() => delay(500))
    input && fireEvent.keyDown(input, { code: 'PageDown' })
    input && fireEvent.keyDown(input, { code: 'Enter' })
    expect(matcher?.text).toBe('loadsp')
  })

  it('test end', async () => {
    let matcher: Matcher | null | undefined
    const result = createMatcherEdit(false, undefined, {
      onMatcherChanged: (m) => {
        matcher = m
        return true
      },
    })
    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && act(() => fireEvent.change(input, { target: { value: 'loa' } }))
    await act(() => delay(500))
    input && fireEvent.keyDown(input, { code: 'End' })
    input && fireEvent.keyDown(input, { code: 'Enter' })
    expect(matcher?.text).toBe('loadxx')
  })

  it('test home', async () => {
    let matcher: Matcher | null | undefined
    const result = createMatcherEdit(false, undefined, {
      onMatcherChanged: (m) => {
        matcher = m
        return true
      },
    })
    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && act(() => fireEvent.change(input, { target: { value: 'loa' } }))
    await act(() => delay(500))
    input && fireEvent.keyDown(input, { code: 'Home' })
    input && fireEvent.keyDown(input, { code: 'Enter' })
    expect(matcher?.text).toBe('loa')
  })

  it('test arrow up', async () => {
    let matcher: Matcher | null | undefined
    const result = createMatcherEdit(false, undefined, {
      onMatcherChanged: (m) => {
        matcher = m
        return true
      },
    })
    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && act(() => fireEvent.change(input, { target: { value: 'loa' } }))
    await act(() => delay(500))
    input && fireEvent.keyDown(input, { code: 'ArrowUp' })
    input && fireEvent.keyDown(input, { code: 'Enter' })
    expect(matcher?.text).toBe('loadxx')
  })

  it('test arrow down', async () => {
    let matcher: Matcher | null | undefined
    const result = createMatcherEdit(false, undefined, {
      onMatcherChanged: (m) => {
        matcher = m
        return true
      },
    })
    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && act(() => fireEvent.change(input, { target: { value: 'loa' } }))
    await act(() => delay(500))
    input && fireEvent.keyDown(input, { code: 'ArrowDown' })
    input && fireEvent.keyDown(input, { code: 'Enter' })
    expect(matcher?.text).toBe('loadsp')
  })

  it('Cancel Edit', async () => {
    let cancelled = false
    const result = createMatcherEdit(true, singleMatcher[0], {
      isActive: true,
      onCancel: () => (cancelled = true),
    })
    const element = result.container.querySelector('#test_input')
    expect(element).toBeDefined()
    element && fireEvent.keyDown(element, { code: 'Enter' })
    expect(cancelled).toBeTruthy()
  })

  it('Edit Previous', async () => {
    let editPrevious = false
    const result = createMatcherEdit(true, singleMatcher[0], {
      isActive: true,
      onEditPrevious: () => (editPrevious = true),
    })
    const element = result.container.querySelector('#test_input')
    expect(element).toBeDefined()
    element && fireEvent.change(element, { target: { value: '' } })
    element && fireEvent.keyDown(element, { code: 'Backspace' })
    expect(editPrevious).toBeTruthy()
  })

  it('onFocus', () => {
    let hasFocus = false
    const result = createMatcherEdit(true, undefined, {
      onFocus: () => (hasFocus = true),
    })
    const element = result.container.querySelector('#edit_input')
    expect(element).toBeDefined()
    element && fireEvent.focus(element)
    expect(hasFocus).toBeTruthy()
  })
})

const createMatcherEdit = (
  first = false,
  matcher?: Matcher,
  options?: {
    inFocus?: boolean
    isActive?: boolean
    onMatcherChanged?: (matcher: Matcher | null) => boolean
    onFocus?: () => void
    onCancel?: () => void
    onEditPrevious?: () => void
  },
) => {
  return render(
    <hasFocusContext.Provider value={true}>
      <configContext.Provider value={testConfig}>
        <MatcherEdit
          matcher={matcher}
          onMatcherChanged={
            options?.onMatcherChanged
              ? options.onMatcherChanged
              : (m) => {
                console.log(m)
                return true
              }
          }
          onFocus={options?.onFocus}
          onCancel={options?.onCancel}
          onEditPrevious={options?.onEditPrevious}
          inFocus={options?.inFocus}
          first={first}
          isActive={options?.isActive}
        />
      </configContext.Provider>
    </hasFocusContext.Provider>,
  )
}
