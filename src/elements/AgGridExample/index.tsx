import * as React from 'react'
import { Theme, getAgGridStyle, styleFromTheme } from '@/themes'
import {
  DataSource,
  Matcher,
  SourceItem,
  defaultComparison,
  numberComparisons,
  stringComparisons,
} from '@/component/types'
import MultiSelect, { isUnique } from '@/component/MultiSelect'
import { AgGridReact } from 'ag-grid-react'
import { fetchBondsAndCache } from '@/services/bondsService'
import Bond from '@/types/Bond'
import { ColDef, IRowNode } from 'ag-grid-community'
import { createFilter } from '@/types/AgFilter'
import './AgGridExample.css'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import Nemonic from '@/component/types/Nemonic'

interface AgGridExampleProps {
  theme: Theme
}

const formatDate = (date: Date): string =>
  date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()

const extractDate = (text: string) => {
  const dt = new Date()
  const value = parseInt(text.substring(0, text.length - 1))
  const postFix = text.substring(text.length - 1)
  if (postFix === 'y' || postFix === 'Y') {
    dt.setFullYear(dt.getFullYear() + value)
    return formatDate(dt)
  } else {
    const addYears = (value + dt.getMonth()) / 12
    const months = (value + dt.getMonth()) % 12
    dt.setFullYear(dt.getFullYear() + addYears)
    dt.setMonth(months)
    return formatDate(dt)
  }
}

const AgGridExample: React.FC<AgGridExampleProps> = ({ theme }) => {
  const agGridRef = React.useRef<AgGridReact<Bond> | null>(null)
  const [matchers, setMatchers] = React.useState<Matcher[]>()
  const [rowData, setRowData] = React.useState<Bond[]>()
  const [columnDefs] = React.useState<ColDef<Bond>[]>([
    {
      field: 'isin',
      filter: 'agSetColumnFilter',
      sortable: true,
      resizable: true,
    },
    {
      field: 'currency',
      filter: 'agSetColumnFilter',
      sortable: true,
      resizable: true,
    },
    {
      field: 'issueDate',
      filter: 'agDateColumnFilter',
      sortable: true,
      resizable: true,
    },
    {
      field: 'maturityDate',
      filter: 'agDateColumnFilter',
      sortable: true,
      resizable: true,
    },
    {
      field: 'coupon',
      filter: 'agNumberColumnFilter',
      sortable: true,
      resizable: true,
    },
    {
      field: 'issuer',
      filter: 'agTextColumnFilter',
      sortable: true,
      resizable: true,
    },
    {
      field: 'hairCut',
      filter: 'agNumberColumnFilter',
      sortable: true,
      resizable: true,
    },
  ])
  const [filterSources, setFilterSources] = React.useState<string[]>([])

  const findItems = React.useCallback(
    (text: string, field: 'isin' | 'currency' | 'issuer', isOr: boolean): SourceItem[] => {
      const uniqueItems = new Set<string>()
      const callback = (row: IRowNode<Bond>) => {
        if (row.data) {
          const value = row.data[field]
          if (value && value.toUpperCase().includes(text.toUpperCase())) {
            uniqueItems.add(value)
          }
        }
      }
      if (isOr) {
        agGridRef.current?.api?.forEachNode(callback)
      } else {
        agGridRef.current?.api?.forEachNodeAfterFilter(callback)
      }
      let items = [...uniqueItems].sort()
      if (items.length > 10) {
        items = items?.slice(10)
      }
      return items
    },
    [],
  )

  const functions = React.useMemo<Nemonic[]>(
    () => [
      {
        name: 'Interest',
        requiredDataSources: ['ISIN', 'Client'],
        optionalDataSources: ['Coupon', 'MaturityDate']
      },
    ],
    [],
  )
  const dataSource = React.useMemo<DataSource[]>(
    () => [
      {
        name: 'ISIN',
        title: 'ISIN Code',
        comparisons: defaultComparison,
        precedence: 3,
        ignoreCase: true,
        searchStartLength: 1,
        selectionLimit: 2,
        source: async (text, op) =>
          new Promise((resolve) => {
            setTimeout(() => resolve(findItems(text, 'isin', op === 'or')), 5)
          }),
      },
      {
        name: 'Currency',
        title: 'Currency Code',
        comparisons: defaultComparison,
        precedence: 2,
        ignoreCase: true,
        selectionLimit: 2,
        source: async (text, op) =>
          new Promise((resolve) => {
            setTimeout(() => resolve(findItems(text, 'currency', op === 'or')), 5)
          }),
        showInMenuBar: true,
      },
      {
        name: 'Coupon',
        title: 'Coupon',
        comparisons: numberComparisons,
        precedence: 1,
        selectionLimit: 2,
        match: (text: string) => !isNaN(Number(text)),
        value: (text: string) => Number.parseFloat(text),
      },
      {
        name: 'Price',
        title: 'Price',
        comparisons: numberComparisons,
        precedence: 1,
        selectionLimit: 2,
        match: (text: string) => !isNaN(Number(text)),
        value: (text: string) => Number.parseFloat(text),
      },
      {
        name: 'Size',
        title: 'Size',
        comparisons: numberComparisons,
        precedence: 1,
        selectionLimit: 2,
        match: (text: string) => !isNaN(Number(text)),
        value: (text: string) => Number.parseInt(text),
      },
      {
        name: 'Side',
        title: 'Side',
        comparisons: stringComparisons,
        precedence: 4,
        ignoreCase: true,
        searchStartLength: 2,
        selectionLimit: 2,
        source: ['BUY', 'SELL'],
      },
      {
        name: 'HairCut',
        title: 'Hair Cut',
        comparisons: numberComparisons,
        precedence: 1,
        selectionLimit: 2,
        match: (text: string) => !isNaN(Number(text)),
        value: (text: string) => Number.parseFloat(text),
      },
      {
        name: 'Issuer',
        title: 'Issuer',
        comparisons: stringComparisons,
        precedence: 1,
        ignoreCase: true,
        selectionLimit: 2,
        match: /^[a-zA-Z ]{2,}$/,
        value: (text: string) => text,
      },
      {
        name: 'Issuer2',
        title: 'Issuer',
        comparisons: defaultComparison,
        precedence: 1,
        ignoreCase: false,
        searchStartLength: 3,
        selectionLimit: 2,
        source: async (text, op) =>
          new Promise((resolve) => {
            setTimeout(() => resolve(findItems(text, 'issuer', op === 'or')), 5)
          }),
      },
      {
        name: 'MaturityDate',
        title: 'Maturity Date',
        comparisons: numberComparisons,
        precedence: 4,
        selectionLimit: 2,
        match: /^[0-9]{0,2}[yYmM]$/,
        value: (text: string) => extractDate(text),
      },
      {
        name: 'IssueDate',
        title: 'Issue Date',
        comparisons: numberComparisons,
        precedence: 3,
        selectionLimit: 2,
        match: /^[0-9]{0,2}[yYmM]$/,
        value: (text: string) => extractDate(text),
      },
      {
        name: 'Client',
        title: 'Client',
        comparisons: defaultComparison,
        precedence: 1,
        ignoreCase: false,
        searchStartLength: 3,
        selectionLimit: 2,
        functional: true,
        source: async (text, op) =>
          new Promise((resolve) => {
            setTimeout(() => resolve(findItems(text, 'issuer', op === 'or')), 5)
          }),
      },
    ],
    [findItems],
  )

  React.useEffect(() => {
    fetchBondsAndCache()
      .then(setRowData)
      .catch((error) => {
        if (typeof error === 'string') {
          console.log(error)
        } else if (error instanceof Error) {
          console.log(error.message)
          console.log(error.stack)
        } else {
          console.log(error.toString())
        }
      })
  }, [])

  const getColumn = (source: string): string => {
    switch (source) {
      case 'MaturityDate':
        return 'maturityDate'
      case 'IssueDate':
        return 'issueDate'
      case 'HairCut':
        return 'hairCut'
    }
    return source.toLowerCase()
  }

  const matchersChanged = (newMatchers: Matcher[]) => {
    const sources = newMatchers.map((m) => m.source).filter(isUnique)
    sources.forEach((source) => {
      const column = getColumn(source)
      const values = newMatchers.filter((m) => m.source === source)
      const filter = createFilter(values)
      const instance = agGridRef.current?.api?.getFilterInstance(column)
      if (instance) {
        instance?.setModel(filter)
      }
    })
    filterSources
      .filter((source) => !sources.includes(source))
      .forEach((source) => {
        const instance = agGridRef.current?.api?.getFilterInstance(
          getColumn(source),
        )
        if (instance) {
          instance?.setModel(null)
        }
      })
    agGridRef.current?.api?.onFilterChanged()
    setFilterSources(sources)
    setMatchers(newMatchers)
  }

  return (
    <div>
      <div className="mainMultiselect">
        <MultiSelect
          matchers={matchers}
          dataSources={dataSource}
          functions={functions}
          onMatchersChanged={matchersChanged}
          styles={styleFromTheme(theme)}
          maxDropDownHeight={120}
          showCategories={true}
        />
      </div>
      <div className="ag-theme-alpine agGrid" style={getAgGridStyle(theme)}>
        <AgGridReact ref={agGridRef} rowData={rowData} columnDefs={columnDefs} enableAdvancedFilter={true}>
        </AgGridReact>
      </div>
    </div>
  )
}

export default AgGridExample
