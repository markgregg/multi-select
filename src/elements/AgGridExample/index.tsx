import * as React from 'react'
import { Theme, styleFromTheme } from "@/themes"
import { DataSource, Matcher, SourceItem, defaultComparison, numberComparisons, stringComparisons } from '@/component/types'
import MultiSelect from '@/component/MultiSelect'
import { AgGridReact } from "ag-grid-react";
import { fetchBondsAndCache } from '@/services/bondsService';
import Bond from '@/types/Bond';
import { ColDef } from 'ag-grid-community';
import './AgGridExample.css'
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

interface AgGridExampleProps {
  theme: Theme
}

const isUnique = (value: string, index: number, array: string[]) => {
  return array.indexOf(value) === index;
}

const AgGridExample: React.FC<AgGridExampleProps> = ({ theme }) => {
  const [matchers, setMatchers] = React.useState<Matcher[]>()
  const [rowData, setRowData] = React.useState<Bond[]>();
  const [columnDefs] = React.useState<ColDef<Bond>[]>([
    { field: "isin", filter: 'agSetColumnFilter', sortable: true, resizable: true },
    { field: "currency", filter: 'agSetColumnFilter', sortable: true, resizable: true },
    { field: "issueDate", filter: 'agDateColumnFilter', sortable: true, resizable: true },
    { field: "maturityDate", filter: 'agDateColumnFilter', sortable: true, resizable: true },
    { field: "coupon", filter: 'agNumberColumnFilter', sortable: true, resizable: true },
    { field: "issuer", filter: 'agTextColumnFilter', sortable: true, resizable: true },
    { field: "hairCut", filter: 'agNumberColumnFilter', sortable: true, resizable: true },
  ]);

  const filterBonds = React.useCallback((text: string, field: 'isin' | 'currency'): SourceItem[] => {
    return rowData
      ?.filter(item => item[field].toUpperCase().includes(text.toUpperCase()))
      ?.map(item => item[field])
      ?.filter(isUnique)
      ?? []
  }, [rowData])

  const dataSource = React.useMemo<DataSource[]>(() => [
    {
      name: 'ISIN',
      title: 'ISIN Code',
      comparisons: defaultComparison,
      precedence: 3,
      ignoreCase: true,
      source: async (text) => new Promise((resolve) => {
        setTimeout(
          () =>
            resolve(filterBonds(text, 'isin')
            ),
          1,
        )
      })
    },
    {
      name: 'Currency',
      title: 'Currency Code',
      comparisons: defaultComparison,
      precedence: 2,
      ignoreCase: true,
      source: async (text) => new Promise((resolve) => {
        setTimeout(
          () =>
            resolve(filterBonds(text, 'currency')
            ),
          1,
        )
      })
    },
    {
      name: 'Coupon',
      title: 'Coupon',
      comparisons: numberComparisons,
      match: (text: string) => !isNaN(Number(text)),
      value: (text: string) => Number.parseInt(text),
    },
    {
      name: 'HairCut',
      title: 'Hair Cut',
      comparisons: numberComparisons,
      match: (text: string) => !isNaN(Number(text)),
      value: (text: string) => Number.parseInt(text),
    },
    {
      name: 'Issuer',
      title: 'Issuer',
      comparisons: stringComparisons,
      precedence: 1,
      ignoreCase: true,
      match: /^[a-zA-Z]{2,}$/,
      value: (text: string) => text,
    },
    {
      name: 'MaturityDate',
      title: 'Maturity Date',
      comparisons: stringComparisons,
      precedence: 2,
      match: /^[0-9]{0,2}[yYmM]$/,
      value: (text: string) => {
        const now = new Date();
        const value = parseInt(text.substring(0, text.length - 1));
        const postFix = text.substring(text.length - 1)
        if (postFix === 'y' || postFix === 'Y') {
          return new Date(now.setFullYear(now.getFullYear() + value));
        } else {
          const addYears = (value + now.getMonth()) / 12
          const months = (value + now.getMonth()) % 12
          const dt = new Date(now.setFullYear(now.getFullYear() + addYears))
          return new Date(dt.setMonth(months))
        }
      },
    },
  ],
    [filterBonds]
  )

  React.useEffect(() => {
    fetchBondsAndCache()
      .then(setRowData)
      .catch(error => {
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

  return (
    <div>
      <div className='mainMultiselect'>
        <MultiSelect
          matchers={matchers}
          dataSources={dataSource}
          onMatchersChanged={setMatchers}
          styles={styleFromTheme(theme)}
          maxDropDownHeight={120}
        />
      </div>
      <div className="ag-theme-alpine agGrid">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}>
        </AgGridReact>
      </div>
    </div>
  )
}

export default AgGridExample