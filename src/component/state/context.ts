import Config from '../types/Config'
import * as React from 'react'

const ITEM_LIMIT = 10

const hasFocusContext = React.createContext<boolean>(false)
const configContext = React.createContext<Config>({
  dataSources: [],
  simpleOperation: false,
  defaultItemLimit: ITEM_LIMIT,
})

export { hasFocusContext, configContext, ITEM_LIMIT }
