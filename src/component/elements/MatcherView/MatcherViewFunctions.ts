import { Matcher } from '@/component/types'

export const matcherDisplay = (
  matcher: Matcher,
  first: boolean,
  hideOperators: boolean,
): string => {
  return `${
    first ||
    hideOperators ||
    matcher.operator === '' ||
    matcher.comparison === ')'
      ? ''
      : (matcher.operator === '&' || matcher.operator === 'and'
          ? 'and'
          : 'or') + ' '
  }${
    matcher.comparison !== '=' && matcher.comparison !== '"'
      ? matcher.comparison
      : ''
  } ${matcher.text}`
}

export const matcherToolTip = (matcher: Matcher): string => {
  return `${matcher.source}: ${matcher.text}${
    matcher.value !== matcher.text ? '(' + matcher.value + ')' : ''
  }`
}
