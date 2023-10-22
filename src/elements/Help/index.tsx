import * as React from 'react'
import { TbHelpSquareRoundedFilled } from 'react-icons/tb'
import './Help.css'
import useExternalClicks from '@/component/hooks/useExternalClicks/useExternalClicks'
import { Theme, bodyStyleFromTheme } from '@/themes'

interface HelpProps {
  theme: Theme
}

const Help: React.FC<HelpProps> = ({ theme }) => {
  const divRef = React.useRef<HTMLDivElement | null>(null)
  const [showHelp, setShowHelp] = React.useState<boolean>(false)
  const [helpPage, setHelpPage] = React.useState<'operators' | 'keybord'>('operators')

  const hideHelp = () => {
    setShowHelp(false)
  }

  useExternalClicks(divRef.current, hideHelp)

  const toggleHelp = () => {
    setShowHelp(show => !show)
  }

  const activeStyle: React.CSSProperties = {
    backgroundColor: 'lightgray',
    ...bodyStyleFromTheme(theme)
  }

  return (
    <div
      ref={divRef}
      className='helpIcon'
    >
      <TbHelpSquareRoundedFilled onClick={toggleHelp} />
      {
        showHelp &&
        <div
          className='helpInstructions'
          style={bodyStyleFromTheme(theme)}
        >
          <div className='helpHeadings'>
            <div
              onClick={() => setHelpPage('operators')}
              style={helpPage === 'operators' ? activeStyle : {}}
            >Operators and Comparisons</div>
            <div
              onClick={() => setHelpPage('keybord')}
              style={helpPage === 'keybord' ? activeStyle : {}}
            >Keyboard Commands</div>
          </div>
          {
            helpPage === 'operators' && <div className='helpInstructionsText'>
              and & the compairsons on both sides must be true<br />
              or |  the comparisons on either side can be true<br />
              <br />
              =   value must equal the matcher<br />
              !   value must not equal the matcher<br />
              &#62;   value must be greater than the matcher<br />
              &#60;   value must be less than the matcher<br />
              &#62;=  value must be equal to or greater than the matcher<br />
              &#60;=  value must equal to or less than the matcher<br />
              *   value must be like the matcher<br />
              !*  value must not be like the matcher<br />
              &#60;*  value starts with<br />
              &#62;*  value ends with<br />
              <br />
              (   open bracket<br />
              )   close bracket<br />
            </div>
          }
          {
            helpPage === 'keybord' && <div className='helpInstructionsText'>
              Shift + ArrowLeft - navigate through the matchers<br />
              Shift + ArrowRight - navigate through the matchers<br />
              Ctrl + ArrowLeft - move selected matcher left<br />
              Ctrl + ArrowRight - move selected matcher right<br />
              Shift + Backspace - delete previous matcher<br />
              Ctrl + Backspace - delete all matchers<br />
              ArrowUp - move to next option in the list<br />
              ArrowDown - move to previuos option in the list<br />
              PageUp - move to next data source group in the option list<br />
              PageDown - move to previous data source group in the option list<br />
              Home - move to first data source group in the option list<br />
              End - move to last data source group in the option list<br />
              Enter - select current option<br />
              Tab - select current option<br />
            </div>
          }
        </div>
      }
    </div>
  )
}

export default Help