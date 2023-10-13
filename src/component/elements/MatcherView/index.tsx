import * as React from 'react'
import { Matcher, MutliSelectStyles } from '../../types'
import MatcherEdit from '../MatcherEdit'
import { TiMinus } from 'react-icons/ti'
import './MatcherView.css'

const multiSelectPrefix = 'multi-select/matcher/'

interface MatcherViewProps {
  matcher: Matcher
  onMatcherChanged: (matcher: Matcher) => void
  onDelete: () => void
  onSelect: () => void
  onCancel: () => void
  onSwapMatcher: (matcher: Matcher, swapMatcher: Matcher) => void
  selected?: boolean
  first: boolean
  styles?: MutliSelectStyles
}

const matcherDisplay = (matcher: Matcher, first: boolean): string => {
  return `${first ? '' : (matcher.operator === '&' ? 'and' : 'or') + ' '}${matcher.comparison !== '=' ? matcher.comparison : ''
    } ${matcher.text}`
}

const matcherToolTip = (matcher: Matcher): string => {
  return `${matcher.source}: ${matcher.text}(${matcher.value})`
}

const MatcherView: React.FC<MatcherViewProps> = ({
  matcher,
  onMatcherChanged,
  onDelete,
  onSelect,
  onCancel,
  onSwapMatcher,
  selected,
  first,
  styles,
}) => {
  const [showToopTip, setShowToolTip] = React.useState<boolean>(false)
  const [showDelete, setShowDelete] = React.useState<boolean>(false)

  React.useEffect(() => {
    if (selected && showToopTip) {
      setShowToolTip(false)
    }
  }, [selected, showToopTip])

  React.useEffect(() => {
    if (selected && showDelete) {
      setShowDelete(false)
    }
  }, [selected, showDelete])

  const deleteMatcher = (event: React.MouseEvent) => {
    onDelete()
    event.stopPropagation()
  }

  const matcherUpdated = (update: Matcher | null) => {
    if (update) {
      onMatcherChanged(update)
    } else {
      onDelete()
    }
    return true
  }

  const dragMatcher = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData(
      `${multiSelectPrefix}${matcher.key}`,
      JSON.stringify(matcher),
    )
    event.dataTransfer.effectAllowed = 'move'
  }

  const dragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.find((type) => type.includes(matcher.key))) {
      event.dataTransfer.dropEffect = 'move'
      event.preventDefault()
    }
  }

  const dropMatcher = (event: React.DragEvent<HTMLDivElement>) => {
    const dataType = event.dataTransfer.types.find((type) =>
      type.includes(multiSelectPrefix),
    )
    if (dataType) {
      const data = event.dataTransfer.getData(dataType)
      if (data) {
        const swapMatcher: Matcher = JSON.parse(data)
        onSwapMatcher(matcher, swapMatcher)
      }
    }
  }

  return (
    <div
      id={matcher.key + '_view'}
      className="matcherViewMain"
      style={selected ? styles?.matcherViewSelected : styles?.matcherView}
      onClick={onSelect}
      draggable
      onDragStart={dragMatcher}
      onDragOver={dragOver}
      onDrop={dropMatcher}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {showDelete && !selected && (
        <TiMinus className="deleteIcon" onClick={deleteMatcher} />
      )}
      {selected ? (
        <MatcherEdit
          matcher={matcher}
          onMatcherChanged={matcherUpdated}
          onCancel={onCancel}
          inFocus={true}
          first={first}
          styles={styles}
          isActive={selected}
        />
      ) : (
        <>
          {showToopTip && (
            <div
              id={matcher.key + '_tool_tip'}
              className="matcherViewToolTip"
              style={styles?.matcherToolTip}
            >
              {matcherToolTip(matcher)}
            </div>
          )}
          <span
            onMouseEnter={() => setShowToolTip(true)}
            onMouseLeave={() => setShowToolTip(false)}
            id={matcher.key + '_label'}
          >
            {matcherDisplay(matcher, first)}
          </span>
        </>
      )}
    </div>
  )
}

export default MatcherView
