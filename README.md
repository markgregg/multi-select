# MultiSelect

MultiSelect is a select component that can lookup or match text as a user types. MultiSelect will search across multiple sources and show the matches in a dropdown list. Is intended to be an alternative to having multiple select components, and supports and/or opertions and multiple comparison types.


## To install

yarn add multi-select

npm i multi-select

## Quick start

A simple string list
```js

const dataSource: DataSource[] = [
  {
    name: 'list',
    title: 'list of strings',
    comparisons: defaultComparison,
    precedence: 1,
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
  )
}  
```
