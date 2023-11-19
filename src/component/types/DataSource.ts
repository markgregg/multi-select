import Matcher, { Value } from './Matcher'

export type SourceItem = string | object

export interface DataSourceBase {
  name: string
  title: string
  comparisons: string[]
  precedence?: number
  selectionLimit?: number
  functional?: boolean
}

export const defaultComparison: string[] = ['=', '!']
export const stringComparisons: string[] = ['=', '!', '*', '!*', '<*', '>*']
export const numberComparisons: string[] = ['=', '>', '<', '>=', '<=', '!']

export interface DataSourceLookup extends DataSourceBase {
  source:
  | SourceItem[]
  | ((text: string, matchers: Matcher[]) => Promise<SourceItem[]>)
  textGetter?: (item: object) => string
  valueGetter?: (item: object) => Value
  ignoreCase?: boolean
  itemLimit?: number
  searchStartLength?: number
}

export interface DataSourceValue extends DataSourceBase {
  match: RegExp | ((text: string) => boolean)
  value: (text: string) => Value
}

type DataSource = DataSourceLookup | DataSourceValue

export default DataSource
