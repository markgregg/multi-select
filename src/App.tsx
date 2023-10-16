import * as React from 'react'
import './App.css'
import DataSource, {
  defaultComparison,
  numberComparisons,
  stringComparisons,
} from './component/types/DataSource'
import Matcher from './component/types/Matcher'
import MutliSelect from './component/MultiSelect'

const dataSource: DataSource[] = [
  {
    name: 'list',
    title: 'list of strings',
    comparisons: defaultComparison,
    precedence: 1,
    selectionLimit: 2,
    source: ['asdas', 'assda', 'loadsp'],
  },
  {
    name: 'promise',
    title: 'Promise list',
    comparisons: defaultComparison,
    precedence: 3,
    source: async (text) => {
      return new Promise((resolve) => {
        setTimeout(
          () =>
            resolve(
              ['delayed', 'aploked', 'loadsp'].filter((item) =>
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
    precedence: 2,
    match: /^[a-zA-Z]{2,}$/,
    value: (text: string) => text,
  },
]

const App = () => {
  const [matchers, setMatchers] = React.useState<Matcher[]>()

  return (
    <>
      <h2>MutliSelect</h2>
      <MutliSelect
        matchers={matchers}
        dataSources={dataSource}
        onMatchersChanged={setMatchers}
      />
    </>
  )
}

export default App
