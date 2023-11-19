import * as React from 'react'
import { Option, MutliSelectStyles, Config } from '../../types'
import { configContext } from '@/component/state/context'
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
  const activeItemRef = React.useRef<HTMLLIElement | null>(null)
  const config = React.useContext<Config>(configContext)

  React.useEffect(() => {
    if (activeItemRef.current && activeItemRef.current.scrollIntoView) {
      activeItemRef.current.scrollIntoView({ block: 'end', behavior: 'smooth' })
    }
  }, [activeOption])

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
                ref={idx === activeOption ? activeItemRef : undefined}
                className={
                  idx === activeOption
                    ? 'optionListOption optionListActiveOption'
                    : 'optionListOption'
                }
                style={
                  idx === activeOption ? styles?.activeOption : styles?.option
                }
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

  const listStyle = {
    ...styles?.optionsList,
    ...(config.maxDropDownHeight
      ? { maxHeight: config.maxDropDownHeight }
      : {}),
    ...(config.minDropDownWidth ? { minWidth: config.minDropDownWidth } : {}),
  }

  return (
    <div id="option_list" className="optionListMain" style={listStyle}>
      {showOptions()}
    </div>
  )
}

export default OptionList
