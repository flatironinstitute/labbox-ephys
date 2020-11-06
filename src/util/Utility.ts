

export const isNumber = (x: any): x is number => {
    return ((x !== null) && (x !== undefined) && (typeof(x) === 'number'))
}

export const isString = (x: any): x is string => {
    return ((x !== null) && (x !== undefined) && (typeof(x) === 'string'))
}
