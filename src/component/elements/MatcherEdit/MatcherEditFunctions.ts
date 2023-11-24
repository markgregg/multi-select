import { Option } from "@/component/types"
import DataSource, { DataSourceLookup, SourceItem } from "@/component/types/DataSource"

export const FUNCTIONS_TEXT = 'Functions'

const limitOptions = (
  ds: DataSourceLookup,
  options: Option[],
  defaultItemLimit: number
): Option[] => {
  if (options.length > (ds.itemLimit ?? defaultItemLimit)) {
    return options.slice(0, ds.itemLimit ?? defaultItemLimit)
  }
  return options
}

const getInsertIndex = (
  allOptions: [string, Option[]][],
  ds: DataSource,
  dataSources: DataSource[]
): number => {
  if (ds.precedence) {
    const dsp = ds.precedence
    return allOptions.findIndex((item) => {
      if (item[0] === FUNCTIONS_TEXT) return false
      const ds2 = dataSources.find((dsc) => dsc.title === item[0])
      return dsp > (ds2?.precedence ?? 0)
    })
  }
  return -1
}

export const mapOptions = (
  items: SourceItem[],
  ds: DataSourceLookup,
): Option[] => {
  return items.map((item) => {
    return {
      source: ds.name,
      value:
        ds.valueGetter && typeof item === 'object'
          ? ds.valueGetter(item)
          : item.toString(),
      text:
        ds.textGetter && typeof item === 'object'
          ? ds.textGetter(item)
          : item.toString(),
    }
  })
}

export const updateOptions = (
  items: SourceItem[],
  ds: DataSourceLookup,
  allOptions: [string, Option[]][],
  defaultItemLimit: number,
  dataSources: DataSource[]
): number => {
  let options: Option[] = mapOptions(items, ds)
  if (options.length > 0) {
    options = limitOptions(ds, options, defaultItemLimit)
    addOptions(allOptions, ds, options, defaultItemLimit, dataSources)
  }
  return options.length
}

const combineOptions = (
  ds: DataSourceLookup,
  list1: Option[],
  list2: Option[],
  defaultItemLimit: number
): Option[] => {
  return limitOptions(
    ds,
    list1
      .concat(list2)
      .filter(
        (opt, index, array) =>
          array.findIndex((o) => o.value === opt.value) === index,
      ),
    defaultItemLimit
  )
}

export const addOptions = (
  allOptions: [string, Option[]][],
  ds: DataSourceLookup,
  options: Option[],
  defaultItemLimit: number,
  dataSources: DataSource[],
) => {
  const currentEntry = allOptions.find((entry) => entry[0] === ds.title)
  if (currentEntry) {
    currentEntry[1] = combineOptions(ds, currentEntry[1], options, defaultItemLimit)
    return
  }
  insertOptions(allOptions, ds, options, dataSources)
}

export const insertOptions = (
  allOptions: [string, Option[]][],
  ds: DataSource,
  options: Option[],
  dataSources: DataSource[],
) => {
  const index = getInsertIndex(allOptions, ds, dataSources)
  if (index !== -1) {
    allOptions.splice(index, 0, [ds.title, options])
  } else {
    allOptions.push([ds.title, options])
  }
}

export const matchItems = (
  item: SourceItem,
  ds: DataSourceLookup,
  searchText: string,
) => {
  const actualIem =
    ds.textGetter && typeof item === 'object'
      ? ds.textGetter(item)
      : item.toString()
  return ds.ignoreCase
    ? actualIem.toUpperCase().includes(searchText.toUpperCase())
    : actualIem.includes(searchText)
}