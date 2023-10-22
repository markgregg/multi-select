import { MutliSelectStyles } from './component/types';

export type Theme = 'none' | 'metallic'
export const themes: Theme[] = [
  'none',
  'metallic'
]

export const metallicTheme: MutliSelectStyles = {
  mutliSelect: {
    borderBottom: '#00468C 1px solid',
    borderRight: '#00468C 1px solid',
    borderTop: 'white 1px solid',
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

type AgProperties = React.CSSProperties | {
  '--ag-foreground-color': string,
  '--ag-background-color': string,
  '--ag-header-foreground-color': string,
  '--ag-header-background-color': string,
  '--ag-odd-row-background-color': string,
  '--ag-header-column-resize-handle-color': string
}

export const getAgGridStyle = (theme: string): AgProperties => {
  if (theme === 'metallic') {
    return {
      '--ag-foreground-color': 'white',
      '--ag-background-color': '#416488',
      '--ag-header-foreground-color': 'white',
      '--ag-header-background-color': '#16518d',
      '--ag-odd-row-background-color': '#2e5b87',
      '--ag-header-column-resize-handle-color': '#042e58'
    }
  }
  return {}
}