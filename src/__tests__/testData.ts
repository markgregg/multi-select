import Matcher, { Comparison } from '../component/types/Matcher'
import Config from '../component/types/Config'
import DataSource, {
  defaultComparison,
  numberComparisons,
  stringComparisons,
} from '../component/types/DataSource'

const matcherAnd: Matcher = {
  key: 'test',
  operator: '&',
  comparison: '=',
  source: 'test',
  value: 'value',
  text: 'text',
}

const testDataSources: DataSource[] = [
  {
    name: 'list',
    title: 'list of strings',
    comparisons: defaultComparison,
    precedence: 2,
    source: ['asdas', 'assda', 'loadsp'],
  },
  {
    name: 'promise',
    title: 'Promise list',
    comparisons: defaultComparison,
    precedence: 1,
    source: async (text) => {
      return new Promise((resolve) => {
        setTimeout(
          () =>
            resolve(
              ['delayed', 'aploked', 'loadxx'].filter((item) =>
                item.includes(text),
              ),
            ),
          250,
        )
      })
    },
  },
  {
    name: 'function',
    title: 'Functions',
    comparisons: numberComparisons,
    match: (text: string) => !isNaN(Number(text)),
    value: (text: string) => Number.parseInt(text),
  },
  {
    name: 'regex',
    title: 'Regular Expression',
    comparisons: stringComparisons,
    precedence: 3,
    match: /^[a-zA-Z]{2,}$/,
    value: (text: string) => text,
  },
]

const testConfig: Config = {
  dataSources: testDataSources,
  defaultItemLimit: 10,
}

const singleMatcher: Matcher[] = [
  {
    key: 'test',
    operator: '&',
    comparison: '=',
    source: 'test',
    value: 'value',
    text: 'text',
  },
]

const dualMatchers = (comp: Comparison): Matcher[] => {
  return [
    {
      key: 'test',
      operator: '&',
      comparison: comp,
      source: 'test',
      value: 'value',
      text: 'text',
    },
    {
      key: 'test2',
      operator: '&',
      comparison: comp,
      source: 'test',
      value: 'value',
      text: 'text',
    },
  ]
}

const multipleMatchers: Matcher[] = [
  {
    key: 'test',
    operator: '&',
    comparison: '=',
    source: 'test',
    value: 'value',
    text: 'text',
  },
  {
    key: 'test2',
    operator: '|',
    comparison: '=',
    source: 'test',
    value: 'value2',
    text: 'text2',
  },
  {
    key: 'test3',
    operator: '&',
    comparison: '=',
    source: 'test',
    value: 'value3',
    text: 'text3',
  },
]

export {
  singleMatcher,
  dualMatchers,
  multipleMatchers,
  matcherAnd,
  testConfig,
  testDataSources,
}
