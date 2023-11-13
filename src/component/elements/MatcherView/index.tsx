import * as React from 'react'
import { Matcher, MutliSelectStyles } from '../../types'
import MatcherEdit from '../MatcherEdit'
import { TiMinus } from 'react-icons/ti'
import './MatcherView.css'

const multiSelectPrefix = 'multi-select/matcher/'

interface MatcherViewProps {
  matcher: Matcher
  onMatcherChanged: (matcher: Matcher) => void
  onValidate: (matcher: Matcher) => string | null
  onDelete: () => void
  onSelect: () => void
  onCancel: () => void
  onSwapMatcher: (matcher: Matcher, swapMatcher: Matcher) => void
  onEditPrevious: () => void
  onEditNext: () => void
  onChanging: () => void
  onInsertMatcher: (matcher: Matcher) => void
  selected?: boolean
  first: boolean
  hideOperators?: boolean
  showWarning?: boolean
  styles?: MutliSelectStyles
}

const matcherDisplay = (matcher: Matcher, first: boolean, hideOperators: boolean): string => {
  return `${first || hideOperators || matcher.operator === '' || matcher.comparison === ')' ? '' : ((matcher.operator === '&' ? 'and' : 'or') + ' ')}${matcher.comparison !== '=' ? matcher.comparison : ''
    } ${matcher.text}`
}

const matcherToolTip = (matcher: Matcher): string => {
  return `${matcher.source}: ${matcher.text}${matcher.value !== matcher.text ? '(' + matcher.value + ')' : ''}`
}

const MatcherView: React.FC<MatcherViewProps> = ({
  matcher,
  onMatcherChanged,
  onValidate,
  onDelete,
  onSelect,
  onCancel,
  onSwapMatcher,
  onEditPrevious,
  onEditNext,
  onChanging,
  onInsertMatcher,
  selected,
  first,
  hideOperators,
  showWarning,
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

  const editPrevious = (deleting: boolean) => {
    if (deleting) {
      onDelete()
    } else {
      onEditPrevious()
    }

  }
  const deleteMatcher = (event: React.MouseEvent) => {
    onDelete()
    event.stopPropagation()
  }

  const matcherUpdated = (update: Matcher | null): void => {
    if (update) {
      onMatcherChanged(update)
    } else {
      onDelete()
    }
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
          onValidate={onValidate}
          onCancel={onCancel}
          inFocus={true}
          first={first}
          styles={styles}
          isActive={selected}
          onEditNext={onEditNext}
          onEditPrevious={editPrevious}
          onChanging={onChanging}
          onInsertMatcher={onInsertMatcher}
        />
      ) : (
        <>
          {showToopTip && (
            <div
              id={matcher.key + '_tool_tip'}
              className='matcherViewToolTip'
              style={styles?.matcherToolTip}
            >
              {matcherToolTip(matcher)}
            </div>
          )}
          <span
            onMouseEnter={() => setShowToolTip(true)}
            onMouseLeave={() => setShowToolTip(false)}
            id={matcher.key + '_label'}
            className={showWarning ? 'matcherViewWarning' : ''}
          >
            {matcherDisplay(matcher, first, hideOperators ?? false)}
          </span>
        </>
      )}
    </div>
  )
}

export default MatcherView
