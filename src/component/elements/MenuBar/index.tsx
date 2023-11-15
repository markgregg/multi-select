import * as React from 'react'
import { Config, Option } from '../../types'
import { configContext } from '../../state/context'
import './MenuBar.css'
import OptionsMenu from '../OptionsMenu'
import { DataSourceLookup, SourceItem } from '@/component/types/DataSource'
import { mapOptions } from '@/component/utils'

interface MenuBarProps {
  onItemSelected: (source: string, item: Option | string) => void
}

const MenuBar: React.FC<MenuBarProps> = ({ onItemSelected }) => {
  const config = React.useContext<Config>(configContext)

  return (
    <div className='menuBarMain'>
      <OptionsMenu
        header="Sign"
        items={config.comparisons}
        onItemSelected={item => onItemSelected('sign', item)}
      />
      <OptionsMenu
        header="Operand"
        items={['and', 'or']}
        onItemSelected={item => onItemSelected('operand', item)}
      />
      <OptionsMenu
        header="Brac"
        items={['(', ')']}
        onItemSelected={item => onItemSelected('brac', item)}
      />
      {
        config.dataSources
          .filter(ds => 'source' in ds && ds.showInMenuBar)
          .map(ds => {
            const dsLookup = ds as DataSourceLookup
            return <OptionsMenu
              key={ds.name}
              header={ds.title}
              items={typeof dsLookup.source !== 'function'
                ? mapOptions(dsLookup.source as SourceItem[], dsLookup)
                : () => typeof dsLookup.source === 'function'
                  ? dsLookup.source('').then(items => mapOptions(items, dsLookup))
                  : new Promise<Option[]>(() => [])}
              onItemSelected={item => onItemSelected(ds.name, item)}
            />
          })
      }
    </div>
  )
}

export default MenuBar