import * as React from 'react'
import './App.css'
import Select from './elements/Select'
import { Theme, bodyStyleFromTheme, themes } from './themes'
import BasicExample from './elements/BasicExample'
import AgGridExample from './elements/AgGridExample'

type Example = 'basic' | 'ag-grid'
const examples: Example[] = ['basic', 'ag-grid']

const App = () => {
  const [theme, setTheme] = React.useState<Theme>(themes[0])
  const [example, setExample] = React.useState<Example>(examples[0])

  return (
    <div className="mainBody" style={bodyStyleFromTheme(theme)}>
      <h2>MutliSelect</h2>
      <div className="mainSelection">
        <b>Themes</b>
        <Select options={themes} selection={theme} onSelectOption={setTheme} />
      </div>
      <div className="mainSelection">
        <b>Exaples</b>
        <Select
          options={examples}
          selection={example}
          onSelectOption={setExample}
        />
      </div>
      {example === 'basic' ? (
        <BasicExample theme={theme} />
      ) : (
        <AgGridExample theme={theme} />
      )}
    </div>
  )
}

export default App
