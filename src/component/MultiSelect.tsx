import * as React from 'react'
import {
  Config,
  DataSource,
  Matcher,
  MutliSelectStyles,
  Option,
  Value,
  OperatorDisplay,
  SourceItem,
  defaultComparison,
  stringComparisons,
  numberComparisons,
  Selection,
  Nemonic,
} from './types'
import { isUnique } from './utils'
import {
  hasFocusContext,
  configContext,
  selectionContext,
  ITEM_LIMIT,
} from './state/context'
import MatcherView from './elements/MatcherView'
import MatcherEdit from './elements/MatcherEdit'
import { checkBracket, validateMatcher } from './MultiSelectFunctions'
import { MdClear } from 'react-icons/md'
import useExternalClicks from './hooks/useExternalClicks/useExternalClicks'
import './MultiSelect.css'

interface MultiSelectProps {
  matchers?: Matcher[]
  dataSources: DataSource[]
  functions?: Nemonic[]
  defaultComparison?: string
  and?: string
  or?: string
  defaultItemLimit?: number
  simpleOperation?: boolean
  onMatchersChanged?: (matchers: Matcher[]) => void
  onComplete?: (matchers: Matcher[], func?: string) => void
  onCompleteError?: (func: string, missingFields: string[]) => void
  clearIcon?: React.ReactElement
  maxDropDownHeight?: number
  minDropDownWidth?: number
  searchStartLength?: number
  showCategories?: boolean
  hideToolTip?: boolean
  styles?: MutliSelectStyles
}

const comparisonsFromDataSources = (dataSources: DataSource[]): string[] => {
  return dataSources.flatMap((ds) => ds.comparisons).filter(isUnique)
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  matchers,
  defaultComparison,
  and,
  or,
  dataSources,
  functions,
  defaultItemLimit,
  simpleOperation,
  onMatchersChanged,
  onComplete,
  onCompleteError,
  clearIcon,
  maxDropDownHeight,
  minDropDownWidth,
  searchStartLength,
  showCategories,
  hideToolTip,
  styles,
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const editDivRef = React.useRef<HTMLDivElement | null>(null)
  const [hasFocus, setHasFocus] = React.useState<boolean>(false)
  const [activeMatcher, setActiveMatcher] = React.useState<number | null>(null)
  const [currentMatchers, setCurrentMatchers] = React.useState<Matcher[]>(
    matchers ?? [],
  )
  const [mismatchedBrackets, setMismatchedBrackets] = React.useState<number[]>(
    [],
  )
  const [inEdit, setInEdit] = React.useState<boolean>(false)
  const [activeFunction, setActiveFunction] = React.useState<Nemonic | null>(
    null,
  )

  const config = React.useMemo<Config>(() => {
    return {
      dataSources,
      functions,
      defaultComparison: defaultComparison ?? '=',
      and: and ?? '&',
      or: or ?? '|',
      comparisons: comparisonsFromDataSources(dataSources),
      defaultItemLimit: defaultItemLimit ?? ITEM_LIMIT,
      simpleOperation: simpleOperation ?? false,
      maxDropDownHeight,
      minDropDownWidth,
      searchStartLength,
    }
  }, [
    dataSources,
    functions,
    defaultComparison,
    and,
    or,
    defaultItemLimit,
    simpleOperation,
    maxDropDownHeight,
    minDropDownWidth,
    searchStartLength,
  ])

  React.useEffect(() => {
    if (!inEdit) {
      setCurrentMatchers(matchers ?? [])
    } else {
      setInEdit(false)
    }
  }, [matchers])

  const clickedAway = React.useCallback(() => {
    setHasFocus(false)
  }, [])

  useExternalClicks(editDivRef.current, clickedAway)

  const clearActiveMatcher = () => {
    setActiveMatcher(null)
    inputRef.current?.focus()
  }

  const deleteActiveFunction = () => {
    setActiveFunction(null)
  }

  const editFocus = () => {
    clearActiveMatcher()
    setHasFocus(true)
  }

  const notifyMatchersChanged = (matchers: Matcher[]) => {
    if (onMatchersChanged) {
      onMatchersChanged(matchers)
    }
  }

  const validateFunction = (): boolean => {
    if (activeFunction?.requiredDataSources) {
      const missing = activeFunction.requiredDataSources.filter(ds => !currentMatchers.find(m => m.source === ds))
      if (missing.length > 0) {
        if (onCompleteError) {
          onCompleteError(activeFunction.name, missing)
        }
        return false
      }
    }
    return true
  }

  const validateBrackets = (newMatchers: Matcher[]) => {
    const missingBracketIndexes: number[] = []
    const brackets = newMatchers.map((m) => m.comparison)
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
    clearActiveMatcher()
  }

  const deleteLast = () => {
    if (currentMatchers.length > 0) {
      deleteMatcher(currentMatchers[currentMatchers.length - 1])
    } else if (activeFunction != null) {
      setActiveFunction(null)
    }
  }

  const deleteAll = () => {
    updatedMatchers([])
    clearActiveMatcher()
    setActiveFunction(null)
  }

  const editLast = () => {
    if (currentMatchers.length > 0) {
      if (activeMatcher === null) {
        setActiveMatcher(currentMatchers.length - 1)
      } else {
        if (activeMatcher > 0) {
          setActiveMatcher(activeMatcher - 1)
        }
      }
    }
  }

  const editNext = () => {
    if (
      currentMatchers.length > 0 &&
      activeMatcher !== null &&
      activeMatcher < currentMatchers.length - 1
    ) {
      setActiveMatcher(activeMatcher + 1)
    }
  }

  const deleteMatcher = (matcher: Matcher, forceClearActivematcher = false) => {
    const newMatchers = currentMatchers.filter((mat) => mat.key !== matcher.key)
    updatedMatchers(newMatchers)
    if (
      activeMatcher !== null &&
      (forceClearActivematcher || activeMatcher > currentMatchers.length - 1)
    ) {
      clearActiveMatcher()
    }
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

  const matcherChanging = (matcher: Matcher) => {
    setInEdit(true)
    notifyMatchersChanged(currentMatchers.filter((m) => matcher.key !== m.key))
  }

  const insertMatcher = (
    newMatcher: Matcher,
    currentMatcher: Matcher | null,
  ) => {
    if (currentMatcher) {
      const index = currentMatchers.findIndex(
        (m) => m.key === currentMatcher.key,
      )
      currentMatchers.splice(index, 0, newMatcher)
      setCurrentMatchers([...currentMatchers])
      if (activeMatcher != null && index <= activeMatcher) {
        setActiveMatcher(activeMatcher + 1)
      }
    } else {
      setCurrentMatchers([...currentMatchers, newMatcher])
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
          if (currentMatchers.length === 0) {
            setActiveFunction(null)
          }
          deleteLast()
          event.preventDefault()
        } else if (event.ctrlKey) {
          deleteAll()
          event.preventDefault()
        }
        break
      case 'Enter':
        if (onComplete) {
          if (validateFunction()) {
            onComplete(currentMatchers, activeFunction?.name)
            setCurrentMatchers([])
            setActiveMatcher(null)
            setActiveFunction(null)
          }
        }
        event.preventDefault()
        break
    }
  }

  const selection: Selection = {
    matchers: currentMatchers,
    activeFunction,
  }

  return (
    <hasFocusContext.Provider value={hasFocus}>
      <configContext.Provider value={config}>
        <selectionContext.Provider value={selection}>
          <div
            id="MultiSelect"
            style={styles?.mutliSelect}
            className="multiSelectMain"
            ref={editDivRef}
            onKeyDown={handleKeyPress}
          >
            {currentMatchers.length > 0 && (
              <div className="multiSelectClearIcon" onClick={() => deleteAll()}>
                {clearIcon ? clearIcon : <MdClear />}
              </div>
            )}
            {activeFunction && (
              <MatcherView
                key={'function'}
                matcher={activeFunction}
                onDelete={deleteActiveFunction}
              />
            )}
            {currentMatchers?.map((matcher, index) => (
              <MatcherView
                key={matcher.key}
                matcher={matcher}
                onMatcherChanged={updateMatcher}
                onValidate={(m) =>
                  validateMatcher(currentMatchers, dataSources, m)
                }
                onDelete={() => deleteMatcher(matcher, true)}
                onSelect={() => selectMatcher(index)}
                onCancel={() => clearActiveMatcher()}
                onSwapMatcher={swapMatchers}
                onEditPrevious={editLast}
                onEditNext={editNext}
                onChanging={() => matcherChanging(matcher)}
                onInsertMatcher={(newMatcher) =>
                  insertMatcher(newMatcher, matcher)
                }
                selected={index === activeMatcher}
                first={
                  index === 0 || currentMatchers[index - 1].comparison === '('
                }
                hideOperators={simpleOperation}
                showWarning={mismatchedBrackets.includes(index)}
                showCategory={showCategories}
                hideToolTip={hideToolTip}
                styles={styles}
              />
            ))}
            {
              <MatcherEdit
                ref={inputRef}
                onMatcherChanged={addMatcher}
                onValidate={(m) =>
                  validateMatcher(currentMatchers, dataSources, m)
                }
                onFocus={editFocus}
                inFocus={activeMatcher === null}
                first={currentMatchers.length === 0}
                allowFunctions={currentMatchers.length === 0 && activeFunction === null}
                onEditPrevious={editLast}
                onEditNext={editNext}
                onInsertMatcher={(newMatcher) =>
                  insertMatcher(newMatcher, null)
                }
                onSetActiveFunction={(activeFunction) =>
                  setActiveFunction(activeFunction)
                }
                onDeleteActiveFunction={deleteActiveFunction}
                styles={styles}
              />
            }
          </div>
        </selectionContext.Provider>
      </configContext.Provider>
    </hasFocusContext.Provider>
  )
}

export type {
  Config,
  DataSource,
  Matcher,
  MutliSelectStyles,
  Option,
  Value,
  OperatorDisplay,
  SourceItem,
  Nemonic,
}
export { defaultComparison, stringComparisons, numberComparisons, isUnique }
export default MultiSelect
