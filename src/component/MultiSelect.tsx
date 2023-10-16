import * as React from 'react'
import {
  Config,
  DataSource,
  Matcher,
  MutliSelectStyles,
  Option, Comparison,
  Operator,
  Value,
  OperatorDisplay,
  SourceItem,
  defaultComparison,
  stringComparisons,
  numberComparisons
} from './types'
import { hasFocusContext, configContext, ITEM_LIMIT } from './state/context'
import MatcherView from './elements/MatcherView'
import MatcherEdit from './elements/MatcherEdit'
import './MultiSelect.css'
import { checkBracket, validateMatcher } from './MultiSelectFunctions'

interface MultiSelectProps {
  matchers?: Matcher[]
  dataSources: DataSource[]
  defaultItemLimit?: number
  simpleOperation?: boolean
  onMatchersChanged?: (matchers: Matcher[]) => void
  styles?: MutliSelectStyles
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  matchers,
  dataSources,
  defaultItemLimit,
  simpleOperation,
  onMatchersChanged,
  styles,
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const editDivRef = React.useRef<HTMLDivElement | null>(null)
  const [hasFocus, setHasFocus] = React.useState<boolean>(false)
  const [activeMatcher, setActiveMatcher] = React.useState<number | null>(null)
  const [currentMatchers, setCurrentMatchers] = React.useState<Matcher[]>(
    matchers ?? [],
  )
  const [mismatchedBrackets, setMismatchedBrackets] = React.useState<number[]>([])

  React.useEffect(() => {
    document.addEventListener('mousedown', mouseClick)
    return () => document.removeEventListener('mousedown', mouseClick)
  }, [])

  const mouseClick = (mouseEvent: MouseEvent) => {
    if (editDivRef.current && mouseEvent.target) {
      if (!editDivRef.current.contains(mouseEvent.target as Node)) {
        setHasFocus(false)
      }
    }
  }

  const inputFocus = () => {
    setHasFocus(true)
    setActiveMatcher(null)
  }

  const notifyMatchersChanged = (matchers: Matcher[]) => {
    if (onMatchersChanged) {
      onMatchersChanged(matchers)
    }
  }

  const validateBrackets = (newMatchers: Matcher[]) => {
    const missingBracketIndexes: number[] = []
    const brackets = newMatchers.map(m => m.comparison)
    checkBracket(brackets, missingBracketIndexes, true)
    checkBracket(brackets, missingBracketIndexes, false)
    setMismatchedBrackets(missingBracketIndexes)
  }

  const updatedMatchers = (newMatchers: Matcher[]) => {
    setCurrentMatchers(newMatchers)
    notifyMatchersChanged(newMatchers)
    validateBrackets(newMatchers)
  }


  const updateMatcher = (matcher: Matcher): void => {
    const newMatchers = currentMatchers.map((mat) =>
      mat.key === matcher.key ? matcher : mat,
    )
    updatedMatchers(newMatchers)
    setActiveMatcher(null)
  }

  const deleteLast = () => {
    if (currentMatchers.length > 0) {
      deleteMatcher(currentMatchers[currentMatchers.length - 1])
    }
  }

  const deleteAll = () => {
    updatedMatchers([])
    setActiveMatcher(null)
  }

  const editLast = () => {
    if (currentMatchers.length > 0) {
      setActiveMatcher(currentMatchers.length - 1)
    }
  }

  const deleteMatcher = (matcher: Matcher, forceClearActivematcher = false) => {
    const newMatchers = currentMatchers.filter((mat) => mat.key !== matcher.key)
    updatedMatchers(newMatchers)
    if (
      activeMatcher !== null &&
      (forceClearActivematcher || activeMatcher > currentMatchers.length - 1)
    ) {
      setActiveMatcher(null)
    }
    inputRef.current?.focus()
  }

  const addMatcher = (matcher: Matcher | null): void => {
    if (matcher) {
      const newMatchers = [...currentMatchers, matcher]
      updatedMatchers(newMatchers)
    }
  }

  const selectMatcher = (index: number) => {
    if (!hasFocus) {
      setHasFocus(true)
    }
    setActiveMatcher(index)
  }

  const swapMatchers = (matcher: Matcher, swapMatcher: Matcher) => {
    const idx1 = currentMatchers.findIndex((mtch) => mtch.key === matcher.key)
    const idx2 = currentMatchers.findIndex(
      (mtch) => mtch.key === swapMatcher.key,
    )
    if (idx1 !== -1 && idx2 !== -1) {
      const newMatchers = currentMatchers.map((mtch) =>
        mtch.key === matcher.key
          ? swapMatcher
          : mtch.key === swapMatcher.key
            ? matcher
            : mtch,
      )
      updatedMatchers(newMatchers)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    switch (event.code) {
      case 'ArrowLeft':
        if (event.shiftKey) {
          setActiveMatcher(
            activeMatcher === null
              ? currentMatchers.length - 1
              : activeMatcher > 0
                ? activeMatcher - 1
                : null,
          )
          event.preventDefault()
        } else if (
          event.ctrlKey &&
          activeMatcher !== null &&
          currentMatchers.length > 1
        ) {
          const idx =
            activeMatcher > 0 ? activeMatcher - 1 : currentMatchers.length - 1
          swapMatchers(currentMatchers[activeMatcher], currentMatchers[idx])
          setActiveMatcher(idx)
        }
        break
      case 'ArrowRight':
        if (event.shiftKey) {
          setActiveMatcher(
            activeMatcher === null
              ? 0
              : activeMatcher < currentMatchers.length - 1
                ? activeMatcher + 1
                : null,
          )
          event.preventDefault()
        } else if (
          event.ctrlKey &&
          activeMatcher !== null &&
          currentMatchers.length > 1
        ) {
          const idx =
            activeMatcher < currentMatchers.length - 1 ? activeMatcher + 1 : 0
          swapMatchers(currentMatchers[activeMatcher], currentMatchers[idx])
          setActiveMatcher(idx)
        }
        break
      case 'Backspace':
        if (event.shiftKey) {
          deleteLast()
          event.preventDefault()
        } else if (event.ctrlKey) {
          deleteAll()
          event.preventDefault()
        }
        break
    }
  }

  const config: Config = {
    dataSources,
    defaultItemLimit: defaultItemLimit ?? ITEM_LIMIT,
    simpleOperation: simpleOperation ?? false
  }

  return (
    <hasFocusContext.Provider value={hasFocus}>
      <configContext.Provider value={config}>
        <div
          id="MultiSelect"
          style={styles?.mutliSelect}
          className="multiSelectMain"
          ref={editDivRef}
          onKeyDown={handleKeyPress}
        >
          {currentMatchers?.map((matcher, index) => (
            <MatcherView
              key={matcher.key}
              matcher={matcher}
              onMatcherChanged={updateMatcher}
              onValidate={m => validateMatcher(currentMatchers, dataSources, m)}
              onDelete={() => deleteMatcher(matcher, true)}
              onSelect={() => selectMatcher(index)}
              onCancel={() => setActiveMatcher(null)}
              onSwapMatcher={swapMatchers}
              selected={index === activeMatcher}
              first={index === 0 || currentMatchers[index - 1].comparison === '('}
              hideOperators={simpleOperation}
              showWarning={mismatchedBrackets.includes(index)}
              styles={styles}
            />
          ))}
          {
            <MatcherEdit
              ref={inputRef}
              onMatcherChanged={addMatcher}
              onValidate={m => validateMatcher(currentMatchers, dataSources, m)}
              onFocus={inputFocus}
              inFocus={activeMatcher === null}
              first={currentMatchers.length === 0}
              isActive={activeMatcher === null}
              onEditPrevious={editLast}
              styles={styles}
            />
          }
        </div>
      </configContext.Provider>
    </hasFocusContext.Provider>
  )
}

export type {
  Config,
  DataSource,
  Matcher,
  MutliSelectStyles,
  Option, Comparison,
  Operator,
  Value,
  OperatorDisplay,
  SourceItem
}
export {
  defaultComparison,
  stringComparisons,
  numberComparisons
}
export default MultiSelect
