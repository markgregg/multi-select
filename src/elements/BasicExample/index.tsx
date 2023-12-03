import * as React from 'react'
import { Theme, styleCodeFromTheme, styleFromTheme } from '@/themes'
import {
  DataSource,
  Matcher,
  Nemonic,
  SourceItem,
  defaultComparison,
  numberComparisons,
  stringComparisons,
} from '@/component/types'
import MultiSelect from '@/component/MultiSelect'
import './BasicExample.css'
import Help from '../Help'
import { bonds } from '@/data/bonds'
import {
  extractDate,
  getColumn,
  getFilterType,
  getSize,
  isSize,
} from '@/types/AgFilter'

interface BasicExampleProps {
  theme: Theme
}

type Operation = (bond: any) => boolean

const textCondition = (matcher: Matcher): Operation => {
  const field = getColumn(matcher.source)
  switch (matcher.comparison) {
    case '!':
      return (bond) => (bond[field] as string) !== matcher.value
    case '*':
      return (bond) => (bond[field] as string).includes(matcher.value as string)
    case '!*':
      return (bond) =>
        !(bond[field] as string).includes(matcher.value as string)
    case '>*':
      return (bond) =>
        (bond[field] as string).startsWith(matcher.value as string)
    case '<*':
      return (bond) => (bond[field] as string).endsWith(matcher.value as string)
    default:
      return (bond) => bond[field] === matcher.value
  }
}

const numberCondition = (matcher: Matcher): Operation => {
  const field = getColumn(matcher.source)
  switch (matcher.comparison) {
    case '!':
      return (bond) => bond[field] === matcher.value
    case '>':
      return (bond) => bond[field] > matcher.value
    case '<':
      return (bond) => bond[field] < matcher.value
    case '>=':
      return (bond) => bond[field] >= matcher.value
    case '<=':
      return (bond) => bond[field] <= matcher.value
    default:
      return (bond) => bond[field] === matcher.value
  }
}

const dateCondition = (matcher: Matcher): Operation => {
  const field = getColumn(matcher.source)
  switch (matcher.comparison) {
    case '!':
      return (bond) => bond[field] === matcher.value
    case '>':
      return (bond) => bond[field] > matcher.value
    case '<':
      return (bond) => bond[field] < matcher.value
    case '>=':
      return (bond) => bond[field] >= matcher.value
    case '<=':
      return (bond) => bond[field] <= matcher.value
    default:
      return (bond) => bond[field] === matcher.value
  }
}

const operator = (
  matcher: Matcher,
  comp1: Operation,
  comp2: Operation,
): Operation => {
  switch (matcher.operator.toLowerCase()) {
    case 'or':
    case '|':
      return (bond) => comp1(bond) || comp2(bond)
  }
  return (bond) => comp1(bond) && comp2(bond)
}

const operation = (matcher: Matcher): Operation => {
  switch (getFilterType(matcher.source)) {
    case 'date':
      return dateCondition(matcher)
    case 'number':
      return numberCondition(matcher)
  }
  return textCondition(matcher)
}

const getPredicate = (matchers: Matcher[]): Operation | null => {
  let op: Operation | null = null
  matchers
    .filter(
      (matcher) =>
        matcher.comparison !== '(' &&
        matcher.comparison !== ')' &&
        !matcher.changing &&
        matcher.source !== 'Channel',
    )
    .forEach((matcher) => {
      const currentOp = operation(matcher)
      op = op !== null ? operator(matcher, op, currentOp) : currentOp
    })
  return op
}

const BasicExample: React.FC<BasicExampleProps> = ({ theme }) => {
  const findItems = React.useCallback(
    (
      text: string,
      field: 'isin' | 'currency' | 'issuer',
      op: 'and' | 'or' | null,
      matchers?: Matcher[],
    ): SourceItem[] => {
      const uniqueItems = new Set<string>()
      const predicate = matchers && op !== 'or' ? getPredicate(matchers) : null
      bonds.forEach((bond) => {
        if (!predicate || predicate(bond)) {
          const value = bond[field]
          if (value && value.toUpperCase().includes(text.toUpperCase())) {
            uniqueItems.add(value)
          }
        }
      })
      let items = [...uniqueItems].sort()
      if (items.length > 10) {
        items = items?.slice(10)
      }
      return items
    },
    [],
  )

  const findItem = React.useCallback(
    (
      text: string,
      field: 'isin' | 'currency' | 'issuer',
    ): SourceItem | null => {
      const found = bonds.find((bond) => bond[field] === text)
      return found ? found[field] : null
    },
    [],
  )

  const functions = React.useMemo<Nemonic[]>(
    () => [
      {
        name: 'Interest',
        pasteFreeTextAction: 'Combined',
        requiredDataSources: ['Client', 'Side'],
        optionalDataSources: [
          'Coupon',
          'Size',
          'MaturityDate',
          'Sector',
          'ISIN2',
        ],
        allowFreeText: true,
      },
    ],
    [],
  )

  const dataSource = React.useMemo<DataSource[]>(
    () => [
      {
        name: 'ISIN',
        title: 'ISIN Code',
        comparisons: defaultComparison,
        precedence: 3,
        selectionLimit: 2,
        definitions: [
          {
            searchStartLength: 1,
            ignoreCase: true,
            source: async (text, op, matchers) =>
              new Promise((resolve) => {
                setTimeout(
                  () => resolve(findItems(text, 'isin', op, matchers)),
                  5,
                )
              }),
            matchOnPaste: async (text) =>
              new Promise((resolve) => {
                setTimeout(() => {
                  resolve(findItem(text, 'isin'))
                }, 5)
              }),
          },
        ],
      },
      {
        name: 'ISIN2',
        title: 'ISIN Code',
        comparisons: defaultComparison,
        precedence: 3,
        selectionLimit: 2,
        definitions: [
          {
            ignoreCase: true,
            searchStartLength: 1,
            source: async (text, op) =>
              new Promise((resolve) => {
                setTimeout(() => resolve(findItems(text, 'isin', op)), 5)
              }),
            matchOnPaste: async (text) =>
              new Promise((resolve) => {
                setTimeout(() => {
                  resolve(findItem(text, 'isin'))
                }, 5)
              }),
          },
        ],
      },
      {
        name: 'Currency',
        title: 'Currency Code',
        comparisons: defaultComparison,
        precedence: 2,
        selectionLimit: 2,
        definitions: [
          {
            ignoreCase: true,
            source: async (text, op, matchers) =>
              new Promise((resolve) => {
                setTimeout(
                  () => resolve(findItems(text, 'currency', op, matchers)),
                  5,
                )
              }),
            matchOnPaste: async (text) =>
              new Promise((resolve) => {
                setTimeout(() => {
                  resolve(findItem(text, 'currency'))
                }, 5)
              }),
          },
        ],
      },
      {
        name: 'Coupon',
        title: 'Coupon',
        comparisons: numberComparisons,
        precedence: 1,
        selectionLimit: 2,
        definitions: [
          {
            match: (text: string) => !isNaN(Number(text)),
            value: (text: string) => Number.parseFloat(text),
            matchOnPaste: true,
          },
        ],
      },
      {
        name: 'HairCut',
        title: 'Hair Cut',
        comparisons: numberComparisons,
        precedence: 1,
        selectionLimit: 2,
        definitions: [
          {
            match: (text: string) => !isNaN(Number(text)),
            value: (text: string) => Number.parseFloat(text),
            matchOnPaste: true,
          },
        ],
      },
      {
        name: 'Price',
        title: 'Price',
        comparisons: numberComparisons,
        precedence: 4,
        selectionLimit: 2,
        functional: true,
        definitions: [
          {
            match: (text: string) => !isNaN(Number(text)),
            value: (text: string) => Number.parseFloat(text),
            matchOnPaste: true,
          },
        ],
      },
      {
        name: 'Size',
        title: 'Size',
        comparisons: numberComparisons,
        precedence: 4,
        selectionLimit: 2,
        definitions: [
          {
            match: (text: string) => isSize(text),
            value: (text: string) => getSize(text),
            matchOnPaste: true,
          },
        ],
      },
      {
        name: 'Side',
        title: 'Side',
        comparisons: stringComparisons,
        precedence: 9,
        selectionLimit: 1,
        definitions: [
          {
            ignoreCase: true,
            source: ['BUY', 'SELL'],
            matchOnPaste: true,
          },
        ],
      },
      {
        name: 'Issuer',
        title: 'Issuer',
        comparisons: stringComparisons,
        precedence: 1,
        selectionLimit: 2,
        definitions: [
          {
            ignoreCase: true,
            match: /^[a-zA-Z ]{2,}$/,
            value: (text: string) => text,
            matchOnPaste: false,
          },
          {
            ignoreCase: false,
            searchStartLength: 3,
            source: async (text, op, matchers) =>
              new Promise((resolve) => {
                setTimeout(
                  () => resolve(findItems(text, 'issuer', op, matchers)),
                  5,
                )
              }),
            matchOnPaste: async (text) =>
              new Promise((resolve) => {
                setTimeout(() => {
                  resolve(findItem(text, 'issuer'))
                }, 5)
              }),
          }
        ],
      },
      {
        name: 'MaturityDate',
        title: 'Maturity Date',
        comparisons: numberComparisons,
        precedence: 4,
        selectionLimit: 2,
        definitions: [
          {
            match: /^[0-9]{0,2}[yYmM]$/,
            value: (text: string) => extractDate(text),
            matchOnPaste: true,
          },
        ],
      },
      {
        name: 'IssueDate',
        title: 'Issue Date',
        comparisons: numberComparisons,
        precedence: 3,
        selectionLimit: 2,
        definitions: [
          {
            match: /^[0-9]{0,2}[yYmM]$/,
            value: (text: string) => extractDate(text),
            matchOnPaste: true,
          },
        ],
      },
      {
        name: 'TradeDate',
        title: 'Trade Date',
        comparisons: numberComparisons,
        precedence: 4,
        selectionLimit: 2,
        functional: true,
        definitions: [
          {
            match: /^[0-9]{0,2}[yYmM]$/,
            value: (text: string) => extractDate(text),
            matchOnPaste: true,
          },
        ],
      },
      {
        name: 'Client',
        title: 'Client',
        comparisons: defaultComparison,
        precedence: 5,
        ignoreCase: false,
        searchStartLength: 2,
        selectionLimit: 1,
        functional: true,
        definitions: [
          {
            source: async (text, op) =>
              new Promise((resolve) => {
                setTimeout(() => resolve(findItems(text, 'issuer', op)), 5)
              }),
            matchOnPaste: async (text) =>
              new Promise((resolve) => {
                setTimeout(() => {
                  resolve(findItem(text, 'issuer'))
                }, 5)
              }),
          },
        ],
      },
      {
        name: 'Sector',
        title: 'Sector',
        comparisons: stringComparisons,
        precedence: 8,
        functional: true,
        definitions: [
          {
            searchStartLength: 2,
            ignoreCase: true,
            source: [
              'Energy',
              'Materials',
              'Industrials',
              'Consumer',
              'Health',
              'Financials',
              'Technology',
              'Communications',
              'Utilities',
            ],
            matchOnPaste: true,
          },
        ],
      },
    ],
    [findItems, findItem],
  )

  const handleAction = (matchers: Matcher[], func?: string) => {
    if (func) {
      //const valueMatchers = matchers.filter(matcher => matcher.source.toLowerCase() !== 'actions')
      console.log('do')
    } else {
      console.log('do')
    }
  }

  return (
    <div>
      <div className="mainMultiselectContainer">
        <div className="mainMultiselect">
          <MultiSelect
            dataSources={dataSource}
            functions={functions}
            styles={styleFromTheme(theme)}
            onComplete={handleAction}
            onCompleteError={(func, missing) =>
              alert(`${func} is missing ${missing.toString()}`)
            }
            showCategories={true}
            hideToolTip={true}

          />
        </div>
        <Help theme={theme} />
      </div>
      {theme !== 'none' && (
        <div className="styleContainer">
          <div className="mainStyle">
            <pre className="styleCode">{styleCodeFromTheme(theme)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default BasicExample
