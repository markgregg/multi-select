import { matcherAnd, testConfig } from '../../testData'
import MatcherView from '../../../component/elements/MatcherView'
import Matcher from '../../../component/types/Matcher'
import {
  hasFocusContext,
  configContext,
} from '../../../component/state/context'
import { fireEvent, render } from '@testing-library/react'

describe('MatcherView', () => {
  it('basic render', () => {
    const result = createMatcherView(matcherAnd, false)
    const label = result.container.querySelector('#test_label')
    expect(label).toHaveTextContent('and text')
  })

  it('basic render first', () => {
    const result = createMatcherView(matcherAnd, true)
    const label = result.container.querySelector('#test_label')
    expect(label).toHaveTextContent('text')
  })

  it('basic render selecte4d', () => {
    const result = createMatcherView(matcherAnd, false, { selected: true })
    const input = result.container.querySelector('#test_input')
    expect(input).toHaveValue('& =text')
  })

  it('select', () => {
    let selected = false
    const result = createMatcherView(matcherAnd, false, {
      onSelect: () => (selected = true),
    })
    const view = result.container.querySelector('#test_view')
    expect(view).toBeDefined()
    view && fireEvent.click(view)
    expect(selected).toBeTruthy()
  })

  it('delete', () => {
    let deleted = false
    const result = createMatcherView(matcherAnd, false, {
      onDelete: () => (deleted = true),
    })
    const view = result.container.querySelector('#test_view')
    expect(view).toBeDefined()
    view && fireEvent.mouseEnter(view)
    const del = result.container.querySelector('svg')
    expect(del).toBeDefined()
    del && fireEvent.click(del)
    expect(deleted).toBeTruthy()
  })

  it('show tooltip', () => {
    const result = createMatcherView(matcherAnd, false)
    const label = result.container.querySelector('#test_label')
    expect(label).toBeDefined()
    label && fireEvent.mouseEnter(label)
    const tooltip = result.container.querySelector('#test_tool_tip')
    expect(tooltip).toHaveTextContent('test: text(value)')
  })

  it('cancel edit', () => {
    let cancelled = false
    const result = createMatcherView(matcherAnd, false, {
      selected: true,
      onCancel: () => (cancelled = true),
    })
    const input = result.container.querySelector('#test_input')
    expect(input).toBeDefined()
    input && fireEvent.keyDown(input, { code: 'Enter' })
    expect(cancelled).toBeTruthy()
  })

  it('update matcher', () => {
    let changed = false
    const result = createMatcherView(matcherAnd, false, {
      selected: true,
      onMatcherChanged: () => (changed = true),
    })
    const input = result.container.querySelector('#test_input')
    expect(input).toBeDefined()
    input && fireEvent.change(input, { target: { value: 'a' } })
    input && fireEvent.keyDown(input, { code: 'Enter' })
    expect(changed).toBeTruthy()
  })

  it('matcher deleted', () => {
    let deleted = false
    const result = createMatcherView(matcherAnd, false, {
      selected: true,
      onDelete: () => (deleted = true),
    })
    const input = result.container.querySelector('#test_input')
    expect(input).toBeDefined()
    input && fireEvent.change(input, { target: { value: '' } })
    input && fireEvent.keyDown(input, { code: 'Enter' })
    expect(deleted).toBeTruthy()
  })
})

const createMatcherView = (
  matcher: Matcher,
  first: boolean,
  optons?: {
    selected?: boolean
    onMatcherChanged?: (matcher: Matcher) => void
    onDelete?: () => void
    onSelect?: () => void
    onCancel?: () => void
    onSwapMatcher?: (matcher: Matcher, swapMatcher: Matcher) => void
  },
) => {
  return render(
    <hasFocusContext.Provider value={true}>
      <configContext.Provider value={testConfig}>
        <MatcherView
          matcher={matcher}
          first={first}
          selected={optons?.selected}
          onMatcherChanged={
            optons?.onMatcherChanged
              ? optons.onMatcherChanged
              : (m) => console.log(m)
          }
          onDelete={
            optons?.onDelete ? optons.onDelete : () => console.log('delete')
          }
          onSelect={
            optons?.onSelect ? optons.onSelect : () => console.log('select')
          }
          onCancel={
            optons?.onCancel ? optons.onCancel : () => console.log('cancel')
          }
          onSwapMatcher={
            optons?.onSwapMatcher
              ? optons.onSwapMatcher
              : (m1, m2) => console.log(`${m1}-${m2}`)
          }
        />
      </configContext.Provider>
    </hasFocusContext.Provider>,
  )
}
