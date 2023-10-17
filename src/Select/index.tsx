import * as React from 'react'
import './Select.css'
import useExternalClicks from '@/component/hooks/useExternalClicks/useExternalClicks'

interface SelectProps {
  options: string[]
  selection: string
  onSelectOption: (option: string) => void
}

const Select: React.FC<SelectProps> = ({
  options,
  selection,
  onSelectOption
}) => {
  const divRef = React.useRef<HTMLDivElement | null>(null)
  const [selected, setSelected] = React.useState<string>(selection)
  const [optionsVisible, setOptionsVisible] = React.useState<boolean>(false)

  const lostFocus = React.useCallback(() => {
    setOptionsVisible(false)
  }, [])

  useExternalClicks(divRef.current, lostFocus)

  const selectOption = (e: React.MouseEvent, option: string) => {
    setSelected(option)
    setOptionsVisible(false)
    onSelectOption(option)
    e.stopPropagation()
  }

  return (
    <div
      className="selectMain"
      onClick={() => setOptionsVisible(true)}
      ref={divRef}
    >
      {selected}
      {
        optionsVisible &&
        <div className='selectMainOptionList'>
          <ul>
            {
              options.map(option =>
                <li
                  key={option}
                  onClick={e => selectOption(e, option)}
                >{option}</li>
              )
            }
          </ul>
        </div>
      }
      <div>

      </div>
    </div>
  )
}

export default Select
