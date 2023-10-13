import * as React from 'react'
import { Option, MutliSelectStyles } from '../../types'
import './OptionList.css'

interface OptionListProps {
  options: [string, Option[]][]
  activeOption: number | null
  onSelectOption: (option: Option) => void
  onSelectActiveOption: (index: number) => void
  styles?: MutliSelectStyles
}

const OptionList: React.FC<OptionListProps> = ({
  options,
  activeOption,
  onSelectOption,
  onSelectActiveOption,
  styles,
}) => {
  const selectOption = (event: React.MouseEvent, option: Option) => {
    onSelectOption(option)
    event.stopPropagation()
  }

  const showOptions = () => {
    let cnt = 0
    return options.map((entry) => {
      const [category, categoryOptions] = entry
      return (
        <ul key={category}>
          <li className="optionListCategory" style={styles?.optionCategory}>
            {category}
          </li>
          {categoryOptions.map((option) => {
            const idx = cnt++
            return (
              <li
                className={
                  idx === activeOption
                    ? 'optionListOption optionListActiveOption'
                    : 'optionListOption'
                }
                style={styles?.option}
                key={option.value.toString()}
                onMouseEnter={() => onSelectActiveOption(idx)}
                onClick={(e) => selectOption(e, option)}
              >
                {option.text}
              </li>
            )
          })}
        </ul>
      )
    })
  }

  return (
    <div
      id="option_list"
      className="optionListMain"
      style={styles?.optionsList}
    >
      {showOptions()}
    </div>
  )
}

export default OptionList
