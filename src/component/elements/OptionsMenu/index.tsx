import * as React from 'react'
import { Option } from '@/component/types'
import './OptionsMenu.css'

interface OptionsMenuProps {
  header: string
  items: (Option | string)[] | (() => Promise<Option[]>)
  onItemSelected: (item: Option | string) => void
}

const OptionsMenu: React.FC<OptionsMenuProps> = ({
  header,
  items,
  onItemSelected
}) => {
  const [showMenu, setShowMenu] = React.useState<boolean>(false)
  const [availableItems, setAvailableItems] = React.useState<(Option | string)[]>(typeof items !== 'function' ? items : [])

  React.useEffect(() => {
    if (showMenu && typeof items === 'function') {
      items().then(setAvailableItems)
    }
  }, [showMenu, items])

  return (
    <div
      className='optionMenuMain'
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      <ul>
        <li
          className='optionMenuHeader'
        >{header}</li>
        {
          showMenu && availableItems.map(item => {
            const text = typeof item !== 'string' ? item.text : item.toString()
            return <li
              key={text}
              onClick={() => onItemSelected(item)}
            >{text}</li>
          })
        }
      </ul>
    </div>
  )
}

export default OptionsMenu