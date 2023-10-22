export type Comparison = '=' | '>' | '<' | '>=' | '<=' | '!' | '*' | '!*' | '(' | ')' | '<*' | '>*'
export type Operator = '&' | '|' | ''
export type Value = string | number | Date

export default interface Matcher {
  key: string
  operator: Operator
  comparison: Comparison
  source: string
  value: Value
  text: string
}
