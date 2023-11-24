import * as React from 'react'
import { Matcher, Option, Config, Selection } from '../../types'
import {
  hasFocusContext,
  configContext,
  selectionContext,
} from '../../state/context'
import { guid } from '../../utils'
import OptionList from '../OptionList'
import MutliSelectStyles from '../../types/MutliSelectStyles'
import ErrorMessage from '../ErrorMessage'
import './MatcherEdit.css'
import Nemonic from '@/component/types/Nemonic'
import { FUNC_ID } from '@/component/types/Opton'
import { FUNCTIONS_TEXT, insertOptions, matchItems, updateOptions } from './MatcherEditFunctions'

interface MatcherEditProps {
  matcher?: Matcher
  onMatcherChanged: (matcher: Matcher | null) => void
  onValidate?: (matcher: Matcher) => string | null
  onFocus?: () => void
  onCancel?: () => void
  onEditPrevious: (deleting: boolean) => void
  onEditNext?: () => void
  onChanging?: () => void
  onInsertMatcher?: (matcher: Matcher) => void
  onSetActiveFunction?: (activeFunction: Nemonic) => void
  onDeleteActiveFunction?: () => void
  inFocus?: boolean
  first: boolean
  allowFunctions?: boolean
  styles?: MutliSelectStyles
}



const MatcherEdit = React.forwardRef<HTMLInputElement, MatcherEditProps>(
  (props, ref) => {
    const {
      matcher,
      onMatcherChanged,
      onValidate,
      onFocus,
      onCancel,
      onEditPrevious,
      onEditNext,
      onInsertMatcher,
      inFocus,
      first,
      allowFunctions,
      styles,
      onChanging,
      onSetActiveFunction,
      onDeleteActiveFunction,
    } = props
    const config = React.useContext<Config>(configContext)
    const inputRef = React.useRef<HTMLInputElement | null>(null)
    const [text, setText] = React.useState<string>(
      matcher
        ? `${!first && config.operators !== 'Simple' ? matcher.operator + ' ' : ''}${matcher.comparison
        }${matcher.text}`
        : '',
    )
    const [comparison, setComparison] = React.useState<string>(
      matcher?.comparison ?? config.defaultComparison,
    )
    const [operator, setOperator] = React.useState<string>(
      matcher?.operator ?? config.and,
    )
    const key = React.useRef('')
    const [options, setOptions] = React.useState<[string, Option[]][]>([])
    const [totalOptions, setTotalOptions] = React.useState<number>(0)
    const [activeOption, setActiveOption] = React.useState<number | null>(null)
    const [error, setError] = React.useState<string | null>(null)
    const [notifiedChanging, setNotifiedChaning] =
      React.useState<boolean>(false)

    const controlHasFocus = React.useContext<boolean>(hasFocusContext)
    const selection = React.useContext<Selection>(selectionContext)

    React.useEffect(() => {
      inputRef.current?.focus()
    }, [])

    React.useEffect(() => {
      setError(null)
    }, [first])

    const resetEdit = () => {
      setText('')
      setOptions([])
      setTotalOptions(0)
      setActiveOption(null)
    }

    const checkForOperator = (searchText: string): [string, 'or' | 'and' | null] => {
      if (searchText.length > 2) {
        const symbol = searchText.substring(0, 3)
        if (symbol === 'and') {
          setOperator(config.and)
          return [searchText.substring(3).trim(), 'and']
        }
      }
      if (searchText.length > 1) {
        const symbol = searchText.substring(0, 2)
        if (symbol === 'or') {
          setOperator(config.or)
          return [searchText.substring(2).trim(), 'or']
        }
      }
      const symbol = searchText[0]
      if (symbol === config.and || symbol === config.or) {
        setOperator(symbol)
        return [searchText.substring(1).trim(), symbol === config.and ? 'and' : 'or']
      }
      return [searchText, null]
    }

    const checkForComparison = (searchText: string): string | null => {
      if (searchText.length > 1) {
        const symbolPair = searchText.substring(0, 2)
        if (config.comparisons.includes(symbolPair)) {
          setComparison(symbolPair)
          return searchText.substring(2).trim()
        }
      }

      const symbol = searchText[0]
      if (
        config.operators === 'Complex' &&
        (!selection.activeFunction || !selection.activeFunction.noBrackets) &&
        (symbol === '(' || symbol === ')')
      ) {
        if (matcher && onInsertMatcher && matcher.operator !== symbol) {
          const newMatcher: Matcher = {
            key: guid(),
            operator: symbol,
            comparison: symbol,
            source: '',
            value: '',
            text: '',
          }
          onInsertMatcher(newMatcher)
        } else {
          selectOption(symbol)
        }
        return null
      }

      if (config.comparisons.includes(symbol)) {
        setComparison(symbol)
        return searchText.substring(1).trim()
      }
      return searchText
    }

    const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const currentKey = guid()
      key.current = currentKey
      const newText = event.target.value
      const allOptions: [string, Option[]][] = []
      setComparison('=')
      setOperator('&')

      if (!notifiedChanging && matcher) {
        setNotifiedChaning(true)
        if (onChanging) {
          onChanging()
        }
      }
      let totalCount = 0
      let op: 'or' | 'and' | null = null
      if (newText.length > 0) {
        let searchText = newText.trim()
        if (
          config.operators !== 'Simple' &&
          (!selection.activeFunction || !selection.activeFunction.noAndOr)
        ) {
          [searchText, op] = checkForOperator(searchText)
        }
        const result = checkForComparison(searchText)
        if (result === null) {
          return
        }
        searchText = result
        if (searchText.length >= (config.searchStartLength ?? 0)) {
          if (allowFunctions && config.functions) {
            const functions = config.functions
              .filter((func) =>
                func.name.toUpperCase().includes(searchText.toUpperCase()),
              )
              .map((func) => {
                return {
                  source: FUNC_ID,
                  text: func.name,
                  value: func.name,
                }
              })
            if (functions.length > 0) {
              allOptions.push([FUNCTIONS_TEXT, functions])
              totalCount += functions.length
            }
          }
          config.dataSources.forEach((ds) => {
            if ((!selection.activeFunction && !ds.functional) ||
              (selection.activeFunction && (
                selection.activeFunction.requiredDataSources?.includes(ds.name) ||
                selection.activeFunction.optionalDataSources?.includes(ds.name)))
            ) {
              if ('source' in ds) {
                if (searchText.length >= (ds.searchStartLength ?? 0)) {
                  if (typeof ds.source === 'function') {
                    ds.source(searchText, op, selection.matchers).then((items) => {
                      if (currentKey === key.current) {
                        totalCount += updateOptions(items, ds, allOptions, config.defaultItemLimit, config.dataSources)
                        updateState(allOptions, totalCount)
                      }
                    })
                  } else {
                    if (currentKey === key.current) {
                      const items = ds.source.filter((item) =>
                        matchItems(item, ds, searchText),
                      )
                      if (items.length > 0) {
                        totalCount += updateOptions(items, ds, allOptions, config.defaultItemLimit, config.dataSources)
                      }
                    }
                  }
                }
              } else if (
                ((ds.match instanceof RegExp && searchText.match(ds.match)) ||
                  (typeof ds.match === 'function' && ds.match(searchText))) &&
                currentKey === key.current
              ) {
                const value = ds.value(searchText)
                insertOptions(
                  allOptions,
                  ds,
                  [{ source: ds.name, value, text: value.toString() }],
                  config.dataSources)
                totalCount += 1
              }
            }
          })
        }
      }
      setText(newText)
      updateState(allOptions, totalCount)
    }

    const updateState = (
      options: [string, Option[]][],
      totalOptions: number,
    ) => {
      setOptions(options)
      setTotalOptions(totalOptions)
      if (totalOptions > 0) {
        if (activeOption === null) {
          setActiveOption(0)
        } else if (activeOption >= totalOptions) {
          setActiveOption(totalOptions - 1)
        }
      }
    }

    const getPosition = (index: number) => {
      return index === 0
        ? 0
        : options
          .slice(0, index)
          .map((entry) => entry[1].length)
          .reduce((prev, curr) => prev + curr)
    }

    const getCategoryIndex = (currentIndex: number, forward = true) => {
      let count = 0
      const index = options.findIndex((entry) => {
        const [, opts] = entry
        const outcome =
          currentIndex >= count && currentIndex < count + opts.length
        count += opts.length
        return outcome
      })
      return getPosition(
        forward
          ? index < options.length - 1
            ? index + 1
            : 0
          : index > 0
            ? index - 1
            : options.length - 1,
      )
    }

    const keyPressed = (event: React.KeyboardEvent<HTMLInputElement>) => {
      setError(null)
      switch (event.code) {
        case 'ArrowLeft':
          if (
            inputRef.current &&
            !event.ctrlKey &&
            !event.shiftKey &&
            event.currentTarget.selectionStart === 0
          ) {
            onEditPrevious(false)
            event.preventDefault()
            event.stopPropagation()
          }
          break
        case 'ArrowRight':
          if (
            inputRef.current &&
            !event.ctrlKey &&
            !event.shiftKey &&
            event.currentTarget.selectionStart ===
            event.currentTarget.value.length &&
            onEditNext
          ) {
            onEditNext()
            event.preventDefault()
            event.stopPropagation()
          }
          break
        case 'ArrowUp':
          if (activeOption === null) {
            setActiveOption(totalOptions - 1)
          } else {
            if (activeOption > 0) {
              setActiveOption(activeOption - 1)
            } else {
              setActiveOption(totalOptions - 1)
            }
          }
          event.preventDefault()
          event.stopPropagation()
          break
        case 'ArrowDown':
          if (activeOption === null) {
            setActiveOption(0)
          } else {
            if (activeOption < totalOptions - 1) {
              setActiveOption(activeOption + 1)
            } else {
              setActiveOption(0)
            }
          }
          event.preventDefault()
          event.stopPropagation()
          break
        case 'PageUp':
          if (totalOptions > 0) {
            setActiveOption(getCategoryIndex(activeOption ?? 0, false))
            event.preventDefault()
            event.stopPropagation()
          }
          break
        case 'PageDown':
          if (totalOptions > 0) {
            setActiveOption(getCategoryIndex(activeOption ?? totalOptions - 1))
            event.preventDefault()
            event.stopPropagation()
          }
          break
        case 'Home':
          if (totalOptions > 0) {
            setActiveOption(0)
            event.preventDefault()
            event.stopPropagation()
          }
          break
        case 'End':
          if (totalOptions > 0) {
            setActiveOption(totalOptions - 1)
            event.preventDefault()
            event.stopPropagation()
          }
          break
        case 'Enter':
        case 'Tab':
          if (options.length > 0 && activeOption !== null) {
            const optionsArray = options.flatMap((pair) => pair[1])
            if (optionsArray.length > activeOption) {
              if (optionsArray[activeOption].source === FUNC_ID) {
                const func = config.functions?.find(
                  (func) => func.name === optionsArray[activeOption].text,
                )
                if (func && onSetActiveFunction) {
                  onSetActiveFunction(func)
                  resetEdit()
                }
              } else {
                if (event.shiftKey) {
                  insertMatcher(optionsArray[activeOption])
                } else {
                  selectOption(optionsArray[activeOption])
                }
              }
              event.preventDefault()
              event.stopPropagation()
            }
          } else if (text.length === 0 && matcher) {
            selectOption()
            event.preventDefault()
            event.stopPropagation()
          } else if (matcher && onCancel) {
            onCancel()
            event.preventDefault()
            event.stopPropagation()
          }
          break
        case 'Backspace':
          if (text.length === 0) {
            if (onEditPrevious && !event.shiftKey && !event.ctrlKey) {
              if (first && onDeleteActiveFunction) {
                onDeleteActiveFunction()
              } else {
                onEditPrevious(true)
              }
              event.preventDefault()
              event.stopPropagation()
            } else if (onCancel) {
              //not standalone edit
              selectOption()
              event.preventDefault()
              event.stopPropagation()
            }
          }
          break
      }
    }

    const validateOperator = (option: Option): string | null => {
      const ds = config.dataSources.find((d) => d.name === option.source)
      if (ds) {
        if (!ds.comparisons.includes(comparison)) {
          const idx = text.indexOf(comparison)
          if (idx !== -1 && inputRef.current) {
            inputRef.current.selectionStart = idx
            inputRef.current.selectionEnd = idx + 1
          }
          return `Compairson (${comparison}) isn't valid for ${ds.name}.`
        }
      }
      return null
    }

    const validate = (option?: Option | '(' | ')'): Matcher | null | false => {
      if (option !== '(' && option !== ')' && option) {
        const err = validateOperator(option)
        if (err) {
          setError(err)
          return false
        }
      }
      const newMatcher: Matcher | null = option
        ? {
          key: matcher?.key ?? guid(),
          operator: option === ')' ? '' : operator,
          comparison: option === '(' || option === ')' ? option : comparison,
          source: typeof option === 'object' ? option.source : '',
          value: typeof option === 'object' ? option.value : '',
          text: typeof option === 'object' ? option.text : '',
        }
        : null
      if (newMatcher && onValidate) {
        const err = onValidate(newMatcher)
        if (err) {
          setError(err)
          return false
        }
      }
      return newMatcher
    }

    const insertMatcher = (option?: Option | '(' | ')') => {
      const newMatcher = validate(option)
      if (newMatcher !== false && newMatcher !== null && onInsertMatcher) {
        onInsertMatcher(newMatcher)
      }
    }

    const selectOption = (option?: Option | '(' | ')') => {
      const newMatcher = validate(option)
      if (newMatcher !== false) {
        onMatcherChanged(newMatcher)
        resetEdit()
      }
    }

    return (
      <div className="matcherEditMain" style={styles?.matcherEdit}>
        {error && (
          <ErrorMessage
            errorMessage={error}
            onErrorAcknowledged={() => setError(null)}
            style={styles?.errorMessage}
          />
        )}
        <input
          id={(matcher?.key ?? 'edit') + '_input'}
          style={styles?.input}
          ref={(node) => {
            inputRef.current = node
            if (typeof ref === 'function') {
              ref(node)
            } else if (ref) {
              ref.current = node
            }
          }}
          value={text}
          onChange={handleTextChange}
          onFocus={onFocus}
          onKeyDown={keyPressed}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          type="text"
          placeholder="..."
        />
        {controlHasFocus && inFocus && totalOptions > 0 && (
          <OptionList
            options={options}
            activeOption={activeOption}
            onSelectActiveOption={setActiveOption}
            onSelectOption={selectOption}
            styles={styles}
          />
        )}
      </div>
    )
  },
)

MatcherEdit.displayName = 'MatcherEdit'

export default MatcherEdit
