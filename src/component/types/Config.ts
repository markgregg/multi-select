import DataSource from './DataSource'

export type OperatorDisplay = 'Names' | 'Symbols'

export default interface Config {
  dataSources: DataSource[]
  defaultComparison: string
  and: string
  or: string
  comparisons: string[]
  defaultItemLimit: number
  simpleOperation: boolean
  operatorDisplay?: OperatorDisplay
  maxDropDownHeight?: number
  minDropDownWidth?: number
  searchStartLength?: number
}
