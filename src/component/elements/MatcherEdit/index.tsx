import * as React from 'react'
import DataSource, {
  DataSourceLookup,
  SourceItem,
} from '../../types/DataSource'
import { Matcher, Comparison, Operator, Option, Config } from '../../types'
import { hasFocusContext, configContext } from '../../state/context'
import { guid } from '../../utils'
import OptionList from '../OptionList'
import MutliSelectStyles from '../../types/MutliSelectStyles'
import './MatcherEdit.css'
import ErrorMessage from '../ErrorMessage'

interface MatcherEditProps {
  matcher?: Matcher
  onMatcherChanged: (matcher: Matcher | null) => void
  onValidate: (matcher: Matcher) => string | null
  onFocus?: () => void
  onCancel?: () => void
  onEditPrevious?: () => void
  inFocus?: boolean
  first: boolean
  isActive?: boolean
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
      inFocus,
      first,
      isActive,
      styles,
    } = props
    const config = React.useContext<Config>(configContext)
    const inputRef = React.useRef<HTMLInputElement | null>(null)
    const [text, setText] = React.useState<string>(
      matcher
        ? `${!first && !config.simpleOperation ? matcher.operator + ' ' : ''}${matcher.comparison}${matcher.text
        }`
        : '',
    )
    const [comparison, setComparison] = React.useState<Comparison>(
      matcher?.comparison ?? '=',
    )
    const [operator, setOperator] = React.useState<Operator>(
      matcher?.operator ?? '&',
    )
    const key = React.useRef('')
    const [options, setOptions] = React.useState<[string, Option[]][]>([])
    const [totalOptions, setTotalOptions] = React.useState<number>(0)
    const [activeOption, setActiveOption] = React.useState<number | null>(null)
    const [error, setError] = React.useState<string | null>(null)

    const controlHasFocus = React.useContext<boolean>(hasFocusContext)

    React.useEffect(() => {
      if (isActive) {
        inputRef.current?.focus()
      }
    }, [isActive])

    React.useEffect(() => {
      setError(null)
    }, [first])

    const checkForOperator = (searchText: string): string => {
      if (searchText.length > 2) {
        const symbol = searchText.substring(0, 3)
        if (symbol === 'and') {
          setOperator('&')
          return searchText.substring(3).trim()
        }
      }
      if (searchText.length > 1) {
        const symbol = searchText.substring(0, 2)
        if (symbol === 'or') {
          setOperator('|')
          return searchText.substring(2).trim()
        }
      }
      const symbol = searchText[0]
      if (symbol === '&' || symbol === '|') {
        setOperator(symbol)
        return searchText.substring(1).trim()
      }
      return searchText
    }

    const checkForComparison = (searchText: string): string | null => {
      if (searchText.length > 1) {
        const symbol = searchText.substring(0, 2)
        if (symbol === '>=' || symbol === '<=' || symbol === '!*') {
          setComparison(symbol)
          return searchText.substring(2).trim()
        }
      }
      const symbol = searchText[0]
      if (!config.simpleOperation && (
        symbol === '(' ||
        symbol === ')')) {
        selectOption(symbol)
        return null
      }
      if (
        symbol === '=' ||
        symbol === '>' ||
        symbol === '<' ||
        symbol === '!' ||
        symbol === '*'
      ) {
        setComparison(symbol)
        return searchText.substring(1).trim()
      }
      return searchText
    }

    const updateOptions = (
      items: SourceItem[],
      ds: DataSourceLookup,
      allOptions: [string, Option[]][],
    ): number => {
      const options: Option[] = items
        .map((item) => {
          return {
            source: ds.name,
            value:
              ds.valueGetter && typeof item === 'object'
                ? ds.valueGetter(item)
                : item.toString(),
            text:
              ds.textGetter && typeof item === 'object'
                ? ds.textGetter(item)
                : item.toString(),
          }
        })
        .slice(0, ds.itemLimit ?? config.defaultItemLimit)
      if (options.length > 0) {
        addOptions(allOptions, ds, options)
      }
      return options.length
    }

    const getInsertIndex = (
      allOptions: [string, Option[]][],
      ds: DataSource,
    ): number => {
      if (ds.precedence) {
        const dsp = ds.precedence
        return allOptions.findIndex((item) => {
          const ds2 = config.dataSources.find((dsc) => dsc.name === item[0])
          return dsp > (ds2?.precedence ?? 0)
        })
      }
      return -1
    }

    const addOptions = (
      allOptions: [string, Option[]][],
      ds: DataSource,
      options: Option[],
    ) => {
      const index = getInsertIndex(allOptions, ds)
      if (index !== -1) {
        allOptions.splice(index, 0, [ds.name, options])
      } else {
        allOptions.push([ds.name, options])
      }
    }

    const matchItems = (
      item: SourceItem,
      ds: DataSourceLookup,
      searchText: string,
    ) => {
      const actualIem =
        ds.textGetter && typeof item === 'object'
          ? ds.textGetter(item)
          : item.toString()
      return ds.ignoreCase
        ? actualIem.toUpperCase().includes(searchText.toUpperCase())
        : actualIem.includes(searchText)
    }

    const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const currentKey = guid()
      key.current = currentKey
      const newText = event.target.value
      const allOptions: [string, Option[]][] = []
      setComparison('=')
      setOperator('&')

      let totalCount = 0
      if (newText.length > 0) {
        let searchText = newText.trim()
        if (!config.simpleOperation) {
          searchText = checkForOperator(searchText)
        }
        const result = checkForComparison(searchText)
        if (result === null) {
          return
        }
        searchText = result
        if (searchText.length > 0) {
          config.dataSources.forEach((ds) => {
            if ('source' in ds) {
              if (typeof ds.source === 'function') {
                ds.source(searchText).then((items) => {
                  if (currentKey === key.current) {
                    totalCount += updateOptions(items, ds, allOptions)
                    updateState(allOptions, totalCount)
                  }
                })
              } else {
                if (currentKey === key.current) {
                  totalCount += updateOptions(
                    ds.source.filter((item) =>
                      matchItems(item, ds, searchText),
                    ),
                    ds,
                    allOptions,
                  )
                }
              }
            } else if (
              ((ds.match instanceof RegExp && searchText.match(ds.match)) ||
                (typeof ds.match === 'function' && ds.match(searchText))) &&
              currentKey === key.current
            ) {
              const value = ds.value(searchText)
              addOptions(allOptions, ds, [
                { source: ds.name, value, text: value.toString() },
              ])
              totalCount += 1
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
          break
        case 'PageUp':
          setActiveOption(getCategoryIndex(activeOption ?? 0, false))
          event.preventDefault()
          break
        case 'PageDown':
          setActiveOption(getCategoryIndex(activeOption ?? totalOptions - 1))
          event.preventDefault()
          break
        case 'Home':
          setActiveOption(0)
          event.preventDefault()
          break
        case 'End':
          setActiveOption(totalOptions - 1)
          event.preventDefault()
          break
        case 'Enter':
        case 'Tab':
          if (options.length > 0 && activeOption !== null) {
            const optionsArray = options.flatMap((pair) => pair[1])
            if (optionsArray.length > activeOption) {
              selectOption(optionsArray[activeOption])
            }
          } else if (text.length === 0) {
            selectOption()
          } else if (matcher && onCancel) {
            onCancel()
          }
          event.preventDefault()
          break
        case 'Backspace':
          if (text.length === 0) {
            if (onEditPrevious && !event.shiftKey && !event.ctrlKey) {
              onEditPrevious()
            } else if (onCancel) { //not standalone edit
              selectOption()
            }
            event.preventDefault()
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

    const selectOption = (option?: Option | '(' | ')') => {
      if (option !== '(' && option !== ')' && option) {
        const err = validateOperator(option)
        if (err) {
          setError(err)
          return
        }
      }
      const newMatcher = option
        ? {
          key: matcher?.key ?? guid(),
          operator: option === ')' ? '' : operator,
          comparison: option === '(' || option === ')' ? option : comparison,
          source: (typeof option === 'object') ? option.source : '',
          value: (typeof option === 'object') ? option.value : '',
          text: (typeof option === 'object') ? option.text : '',
        }
        : null
      if (newMatcher) {
        const err = onValidate(newMatcher)
        if (err) {
          setError(err)
          return
        }
      }
      onMatcherChanged(newMatcher)
      setText('')
      setOptions([])
      setTotalOptions(0)
      setActiveOption(null)
    }

    return (
      <div className="matcherEditMain" style={styles?.matcherEdit}>
        {
          error &&
          <ErrorMessage
            errorMessage={error}
            onErrorAcknowledged={() => setError(null)}
            style={styles?.errorMessage}
          />
        }
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
