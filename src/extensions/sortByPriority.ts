const isArray = <T>(x: any): x is T[] => {
    return (Array.isArray(x))
}

const sortByPriority = <T extends {priority?: number}>(x: T[] | {[key: string]: T}): T[] => {
    if (isArray<T>(x)) {
        return x.sort((a, b) => ((b.priority || 0) - (a.priority || 0)))
    }
    else {
        return sortByPriority(Object.values(x))
    }
}

export default sortByPriority