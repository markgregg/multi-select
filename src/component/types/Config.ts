import DataSource from './DataSource'

export type OperatorDisplay = 'Names' | 'Symbols'

export default interface Config {
  dataSources: DataSource[]
  defaultItemLimit: number
  operatorDisplay?: OperatorDisplay
}
