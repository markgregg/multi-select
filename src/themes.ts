import { MutliSelectStyles } from "./component/types";

export type Theme = 'none' | 'metallic'
export const themes: Theme[] = [
  'none',
  'metallic'
]

export const metallicTheme: MutliSelectStyles = {
  mutliSelect: {
    borderBottom: '#00468C 1px solid',
    borderRight: '#00468C 1px solid',
    borderTop: 'white 1px solid;',
    borderLeft: 'white 1px solid',
    background: 'linear-gradient(to left top, #00468C, #C3CDE6)',
    color: 'white'
  },
  input: {
    backgroundColor: 'transparent',
    color: 'white'
  },
  optionsList: {
    borderBottom: '#00468C 1px solid',
    borderRight: '#00468C 1px solid',
    borderTop: 'white 1px solid;',
    borderLeft: 'white 1px solid',
    background: 'linear-gradient(to left top, #00468C, #C3CDE6)',
    color: 'white'
  },
  activeOption: {
    background: '	#1560BD',
  },
  optionCategory: {
    background: '#00468C'
  },
  matcherToolTip: {
    borderBottom: '#00468C 1px solid',
    borderRight: '#00468C 1px solid',
    borderTop: 'white 1px solid;',
    borderLeft: 'white 1px solid',
    background: 'linear-gradient(to left top, #00468C, #C3CDE6)',
  },
  errorMessage: {
    borderBottom: '#00468C 1px solid',
    borderRight: '#00468C 1px solid',
    borderTop: 'white 1px solid;',
    borderLeft: 'white 1px solid',
  }
}

export const bodyStyleFromTheme = (theme: string): React.CSSProperties | undefined => {
  if (theme === 'metallic') {
    return {
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }
    return undefined
  }
}

export const styleFromTheme = (theme: string): MutliSelectStyles | undefined => {
  if (theme === 'metallic') {
    return metallicTheme
  }
  return undefined
}

export const styleCodeFromTheme = (theme: string): string => {
  if (theme === 'metallic') {
    return ` mutliSelect: {
      borderBottom: '#00468C 1px solid',
      borderRight: '#00468C 1px solid',
      borderTop: 'white 1px solid;',
      borderLeft: 'white 1px solid',
      background: 'linear-gradient(to left top, #00468C, #C3CDE6)',
      color: 'white'
    },
    input: {
      backgroundColor: 'transparent',
      color: 'white'
    },
    optionsList: {
      borderBottom: '#00468C 1px solid',
      borderRight: '#00468C 1px solid',
      borderTop: 'white 1px solid;',
      borderLeft: 'white 1px solid',
      background: 'linear-gradient(to left top, #00468C, #C3CDE6)',
      color: 'white'
    },
    activeOption: {
      background: '	#1560BD',
    },
    optionCategory: {
      background: '#00468C'
    },
    matcherToolTip: {
      borderBottom: '#00468C 1px solid',
      borderRight: '#00468C 1px solid',
      borderTop: 'white 1px solid;',
      borderLeft: 'white 1px solid',
      background: 'linear-gradient(to left top, #00468C, #C3CDE6)',
    },
    errorMessage: {
      borderBottom: '#00468C 1px solid',
      borderRight: '#00468C 1px solid',
      borderTop: 'white 1px solid;',
      borderLeft: 'white 1px solid',
    }`
  }
  return ''
}