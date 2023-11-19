export default interface Nemonic {
  name: string
  requiredDataSources?: string[]
  optionalDataSources?: string[]
  noAndOr?: boolean
  noBrackets?: boolean
}
