export type SortingCuration = {
    labelsByUnit?: {[key: string]: string[]}
    labelChoices?: string[]
    mergeGroups?: (number[])[]
}

export type SortingCurationDispatch = (action: SortingCurationAction) => void

type SetCurationSortingCurationAction = {
    type: 'SetCuration',
    curation: SortingCuration
}

type AddLabelSortingCurationAction = {
    type: 'AddLabel',
    unitId: number
    label: string
}

type RemoveLabelSortingCurationAction = {
    type: 'RemoveLabel',
    unitId: number
    label: string
}
type MergeUnitsSortingCurationAction = {
    type: 'MergeUnits',
    unitIds: number[]
}
type UnmergeUnitsSortingCurationAction = {
    type: 'UnmergeUnits',
    unitIds: number[]
}

export type SortingCurationAction = SetCurationSortingCurationAction | AddLabelSortingCurationAction | RemoveLabelSortingCurationAction | MergeUnitsSortingCurationAction | UnmergeUnitsSortingCurationAction

export const mergeGroupForUnitId = (unitId: number, curation: SortingCuration | undefined) => {
    const mergeGroups = (curation || {}).mergeGroups || []
    return mergeGroups.filter(g => (g.includes(unitId)))[0] || null
}

export const applyMergesToUnit = (unitId: number, curation: SortingCuration | undefined, applyMerges: boolean | undefined) => {
    return applyMerges ? (
        mergeGroupForUnitId(unitId, curation) || unitId
    ) : unitId
}

export const isMergeGroupRepresentative = (unitId: number, curation: SortingCuration | undefined) => {
    const mg = mergeGroupForUnitId(unitId, curation)
    if (!mg) return true
    return (Math.min(...mg) === unitId)
}