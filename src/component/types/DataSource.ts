import { Comparison, Value } from './Matcher'

export type SourceItem = string | object

export interface DataSourceBase {
  name: string
  title: string
  comparisons: Comparison[]
  precedence?: number
  selectionLimit?: number
}

export const defaultComparison: Comparison[] = ['=', '!']
export const stringComparisons: Comparison[] = ['=', '!', '*', '!*', '<*', '>*']
export const numberComparisons: Comparison[] = ['=', '>', '<', '>=', '<=', '!']

export interface DataSourceLookup extends DataSourceBase {
  source: SourceItem[] | ((text: string) => Promise<SourceItem[]>)
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
