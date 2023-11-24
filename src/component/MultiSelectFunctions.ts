import { DataSource, Matcher } from './types'

export const checkBracket = (
  brackets: string[],
  missingBracketIndexes: number[],
  open: boolean,
) => {
  const first = open ? '(' : ')'
  const last = open ? ')' : '('
  const matchEnds: number[] = []
  for (
    let index = !open ? 0 : brackets.length - 1;
    (!open && index < brackets.length) || (open && index >= 0);
    !open ? index++ : index--
  ) {
    if (brackets[index] === first) {
      let foundTerm = false
      for (
        let index2 = open ? index + 1 : index - 1;
        (open && index2 < brackets.length) || (!open && index2 >= 0);
        open ? index2++ : index2--
      ) {
        if (brackets[index2] === last && !matchEnds.includes(index2)) {
          matchEnds.push(index2)
          foundTerm = true
          break
        }
      }
      if (!foundTerm) {
        missingBracketIndexes.push(index)
      }
    }
  }
}

export const validateMatcher = (
  matchers: Matcher[],
  dataSources: DataSource[],
  matcher: Matcher,
  activeMatcher: number | null,
  operators: 'Simple' | 'AgGrid' | 'Complex',
  orSymnbol: string
): string | null => {
  if (matcher.comparison === '(' || matcher.comparison === ')') {
    return null
  }
  if (operators === 'AgGrid' && (matcher.operator === 'or' || matcher.operator === orSymnbol)) {
    const previousOp = activeMatcher
      ? activeMatcher > 0
        ? matchers[activeMatcher - 1]
        : null
      : matchers.length > 0
        ? matchers[matchers.length - 1]
        : null
    if (previousOp && previousOp.source !== matcher.source) {
      return `When using AgGrid style operators, or can only be used for the same field`
    }
  }
  const dataSource = dataSources.find((ds) => ds.name === matcher.source)
  if (dataSource?.selectionLimit) {
    const currentCount = matchers.filter(
      (m) => matcher.key !== m.key && matcher.source === m.source,
    ).length
    if (currentCount >= dataSource.selectionLimit) {
      return `Datasource (${dataSource.name}) is limited to ${dataSource.selectionLimit} items.`
    }
  }
  return null
}
