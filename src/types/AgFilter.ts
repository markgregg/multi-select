import { Matcher } from '@/component/types'

export type AgFilterType = 'date' | 'text' | 'number'
export type AgOperator = 'AND' | 'OR'

export interface AgDateFilter {
  filterType: 'date'
  dateFrom: Date | string | null
  dateTo: Date | string | null
  type:
  | 'equals'
  | 'notEqual'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
}

export interface AgNumberFilter {
  filterType: 'number'
  filter: number
  type:
  | 'equals'
  | 'notEqual'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
}

export interface AgTextFilter {
  filterType: 'text'
  filter: string
  type:
  | 'equals'
  | 'notEqual'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
}

type AgSingleFilter = AgDateFilter | AgNumberFilter | AgTextFilter

export interface AgDualFilter {
  condition1: AgSingleFilter
  condition2: AgSingleFilter
  filterType: 'date' | 'number' | 'text'
  operator: AgOperator
}

type AgFilter = AgSingleFilter | AgDualFilter

const getFilterType = (source: string): AgFilterType => {
  switch (source) {
    case 'ISIN':
    case 'Currency':
    case 'Issuer':
      return 'text'
    case 'MaturityDate':
    case 'IssueDate':
      return 'date'
    default:
      return 'number'
  }
}

const getTextComparisonType = (
  comparison: string,
):
  | 'equals'
  | 'notEqual'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith' => {
  switch (comparison) {
    case '!':
      return 'notEqual'
    case '*':
      return 'contains'
    case '!*':
      return 'notContains'
    case '>*':
      return 'startsWith'
    case '<*':
      return 'endsWith'
    default:
      return 'equals'
  }
}

const getDateNumberComparisonType = (
  comparison: string,
):
  | 'equals'
  | 'notEqual'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual' => {
  switch (comparison) {
    case '!':
      return 'notEqual'
    case '>':
      return 'greaterThan'
    case '<':
      return 'lessThan'
    case '>=':
      return 'greaterThanOrEqual'
    case '<=':
      return 'lessThanOrEqual'
    default:
      return 'equals'
  }
}

const getOperator = (operator: string): AgOperator => {
  return operator === '&' ? 'AND' : 'OR'
}

const createCondition = (matcher: Matcher): AgSingleFilter => {
  switch (getFilterType(matcher.source)) {
    case 'date':
      return {
        filterType: 'date',
        dateFrom:
          typeof matcher.value === 'string'
            ? `${matcher.value.substring(6, 10)}-${matcher.value.substring(3, 5)}-${matcher.value.substring(0, 2)} 00:00:00`
            : matcher.value instanceof Date
              ? matcher.value
              : new Date(matcher.value),
        dateTo: null,
        type: getDateNumberComparisonType(matcher.comparison),
      }
    case 'number':
      return {
        filterType: 'number',
        filter:
          typeof matcher.value === 'number'
            ? matcher.value
            : Number(matcher.value.toString()),
        type: getDateNumberComparisonType(matcher.comparison),
      }
    case 'text':
      return {
        filterType: 'text',
        filter:
          typeof matcher.value === 'string'
            ? matcher.value
            : matcher.value.toString(),
        type: getTextComparisonType(matcher.comparison),
      }
  }
}

export const createFilter = (matchers: Matcher[]): AgFilter => {
  if (matchers.length === 1) {
    return createCondition(matchers[0])
  } else {
    const condition1 = createCondition(matchers[0])
    const condition2 = createCondition(matchers[1])
    return {
      condition1,
      condition2,
      filterType: condition1.filterType,
      operator: getOperator(matchers[1].operator),
    }
  }
}

export default AgFilter
