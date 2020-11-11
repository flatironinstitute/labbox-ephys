import { matrix, multiply } from 'mathjs'
import * as mocha from 'mocha'
import * as ut from '../../src/components/jscommon/CanvasWidget/Geometry'
// import * as sinon from 'sinon'

// If you get vague errors about All files must be modules when the --isolatedModules flag is provided,
// change the 'module' setting in tsconfig.json to 'commonjs'. It keeps getting reset to something
// else for some reason.

const chai = require('chai')
var dirtyChai = require('dirty-chai')
var expect = chai.expect
chai.use(dirtyChai)


mocha.describe('VecX Types', () => {
    describe('Vec2', () => {
        it('isVec2() returns true for valid input', () => {
            expect(ut.isVec2([4, 5])).to.be.true()
        })
        it('isVec2() returns false for non-numeric input', () => {
            expect(ut.isVec2([4, 'a'])).to.be.false()
        })
        it('isVec2() returns false for wrong-sized array', () => {
            expect(ut.isVec2([4, 5, 6])).to.be.false()
            expect(ut.isVec2([4])).to.be.false()
        })
    })
    describe('Vec3', () => {
        it('isVec3() returns true for valid input', () => {
            expect(ut.isVec3([4, 5, 6])).to.be.true()
        })
        it('isVec3() returns false for non-numeric input', () => {
            expect(ut.isVec3([4, 'a', 5])).to.be.false()
        })
        it('isVec3() returns false for wrong-sized array', () => {
            expect(ut.isVec3([4, 5, 6, 7])).to.be.false()
            expect(ut.isVec3([4, 5])).to.be.false()
        })
    })
    describe('Vec4', () => {
        it('isVec4() returns true for valid input', () => {
            expect(ut.isVec4([4, 5, 6, 7])).to.be.true()
        })
        it('isVec4() returns false for non-numeric input', () => {
            expect(ut.isVec4([4, 'a', 5, 6])).to.be.false()
        })
        it('isVec4() returns false for wrong-sized array', () => {
            expect(ut.isVec4([4, 5, 6])).to.be.false()
            expect(ut.isVec4([4, 5, 6, 7, 8])).to.be.false()
        })
    })
    describe('Vec2H', () => {
        it('isVec2H() returns true for valid input', () => {
            expect(ut.isVec2H([4, 5, 1])).to.be.true()
        })
        it('isVec2H() returns false for non-unit perspective dimension', () => {
            expect(ut.isVec2H([4, 5, 2])).to.be.false()
        })
        it('isVec2H() returns false for non-numeric input', () => {
            expect(ut.isVec2H([4, 'a', 1])).to.be.false()
        })
        it('isVec2H() returns false for wrong-sized array', () => {
            expect(ut.isVec2H([4, 5, 6, 1])).to.be.false()
            expect(ut.isVec2H([4, 1])).to.be.false()
        })
        it('Vec2HToVector() returns a matrix', () => {
            const point = [3, 2, 1]
            const vector = ut.Vec2HToVector(point)
            expect(vector.type).to.equal('DenseMatrix')
        })
        it('Vec2HToVector() is identity operation', () => {
            const point = [3, 2, 1]
            const vector = ut.Vec2HToVector(point)
            expect(JSON.stringify(vector.toArray())).to.equal(JSON.stringify(point))
        })
    })
    // TODO: rest of these
})

describe('RectangularRegion functionality', () => {
    const region = { xmin: 0, xmax: 10, ymin: 6, ymax: 12 }
    describe('Type guard', () => {
        it('isRectangularRegion() returns true for valid input', () => {
            expect(ut.isRectangularRegion(region)).to.be.true()
        })
        it('isRectangularRegion() returns false for missing props', () => {
            expect(ut.isRectangularRegion({xmin: 0, xmax: 10, ymin: 6})).to.be.false()
            expect(ut.isRectangularRegion({xmin: 0, xmax: 10, ymax: 6})).to.be.false()
            expect(ut.isRectangularRegion({xmin: 0, ymax: 10, ymin: 6})).to.be.false()
            expect(ut.isRectangularRegion({ymax: 10, xmax: 10, ymin: 6})).to.be.false()
        })
        it('isRectangularRegion() returns false for non-numeric props', () => {
            expect(ut.isRectangularRegion({xmin: 'a', xmax: 10, ymin: 6, ymax: 12 })).to.be.false()
            expect(ut.isRectangularRegion({xmin: 0, xmax: 'a', ymin: 6, ymax: 12 })).to.be.false()
            expect(ut.isRectangularRegion({xmin: 0, xmax: 10, ymin: 'a', ymax: 12 })).to.be.false()
            expect(ut.isRectangularRegion({xmin: 0, xmax: 10, ymin: 6, ymax: 'a' })).to.be.false()
        })
        it('isRectangularRegion() returns false for minima above maxima', () => {
            expect(ut.isRectangularRegion({xmin: 11, xmax: 10, ymin: 6, ymax: 10})).to.be.false()
            expect(ut.isRectangularRegion({xmin: 9, xmax: 10, ymin: 16, ymax: 10})).to.be.false()
        })
    })
    describe('Region equality', () => {
        const a = { xmin: 0, xmax: 1, ymin: 0, ymax: 1 }
        const b = { xmin: 0, xmax: 1, ymin: 0, ymax: 1 }
        it('rectsAreEqual() returns true for regions with same corners', () => {
            expect(ut.rectsAreEqual(a, b)).to.be.true()
            expect(ut.rectsAreEqual(b, a)).to.be.true()
        })
        it('rectsAreEqual() returns false for regions with different corners', () => {
            expect(ut.rectsAreEqual(a, {...a, xmin: 0.5})).to.be.false()
            expect(ut.rectsAreEqual(a, {...a, xmax: 0.5})).to.be.false()
            expect(ut.rectsAreEqual(a, {...a, ymin: 0.5})).to.be.false()
            expect(ut.rectsAreEqual(a, {...a, ymax: 0.5})).to.be.false()
        })
        it('rectsAreEqual() returns false on bad region input', () => {
            const bad = {xmin: 1, xmax: 0, ymin: 0, ymax: 1} // min > max, therefore invalid region
            expect(ut.rectsAreEqual(a, bad)).to.be.false()
            expect(ut.rectsAreEqual(bad, b)).to.be.false()
        })
    })
    describe('value getters', () => {
        it('getWidth() returns expected value', () => {
            expect(ut.getWidth(region)).to.equal(10)
        })
        it('getHeight() returns expected value', () => {
            expect(ut.getHeight(region)).to.equal(6)
        })
        it('getHeight() returns positive values only', () => {
            expect(ut.getHeight({xmin: 0, xmax: 5, ymin: 10, ymax: 0})).to.equal(10)
        })
        it('getCenter() returns expected value', () => {
            expect(ut.getCenter(region)).to.deep.equal([5, 9])
        })
    })
    describe('Converting PointSpan to Region', () => {
        it('pointSpanToRegion() returns expected value', () => {
            const pointSpan = [0, 6, 10, 6] // should be same as region above
            expect(ut.pointSpanToRegion(pointSpan)).to.deep.equal(region)
        })
    })
    describe('Region Intersection', () => {
        it('rectangularRegionsIntersect() identifies intersecting regions', () => {
            const intersectingRegion = { xmin: 5, ymin: 9, xmax: 7, ymax: 9 }
            expect(ut.rectangularRegionsIntersect(region, intersectingRegion)).to.be.true()
        })
        it('rectangularRegionsIntersect() identifies non-intersecting regions', () => {
            const leftOfRegion = { xmin: -5, xmax: -0.0001, ymin: 7, ymax: 9 }
            const rightOfRegion = { xmin: 11, xmax: 12, ymin: 7, ymax: 9 }
            const aboveRegion = { xmin: 5, xmax: 9, ymin: 3, ymax: 4 }
            const belowRegion = { xmin: 5, xmax: 9, ymin: 14, ymax: 16 }
            expect(ut.rectangularRegionsIntersect(region, leftOfRegion)).to.be.false()
            expect(ut.rectangularRegionsIntersect(region, rightOfRegion)).to.be.false()
            expect(ut.rectangularRegionsIntersect(region, aboveRegion)).to.be.false()
            expect(ut.rectangularRegionsIntersect(region, belowRegion)).to.be.false()
        })
    })
    describe('Point intersectino', () => {
        const rect = { xmin: 0, xmax: 5, ymin: 0, ymax: 10 }
        it('pointInRect() returns true for point in the region', () => {
            const pt = [2, 2]
            expect(ut.pointInRect(pt, rect)).to.be.true()
        })
        it('pointInRect() is transparent to inverted y-axis', () => {
            const goofyRect = { ...rect, ymin: 10, ymax: 0}
            const pt = [2, 2]
            expect(ut.pointInRect(pt, goofyRect)).to.be.true()
        })
        it('pointInRect() returns false for points outside the region', () => {
            const tooLeft = [-1, 4]
            const tooRight = [6, 4]
            const tooHigh = [3, 12]
            const tooLow = [3, -4]
            const onBorder = [0, 0]
            for (let pt of [tooLeft, tooRight, tooHigh, tooLow, onBorder]) {
                expect(ut.pointInRect(pt, rect)).to.be.false()
            }
        })
    })
})

describe('Transformation matrix functionality', () => {
    describe('Type guard', () => {
        it('isTransformationMatrix() returns true for correct transform matrix', () => {
            const matrix = [[1, 0, 0], [0, -1, 5], [0, 0, 1]]
            expect(ut.isTransformationMatrix(matrix)).to.be.true()
        })
        it('isTransformationMatrix() returns false for wrong number/shape of entries', () => {
            const badShape = [[1, 0, 0], [0, -1, 5], [0, 1]]
            const tooManyRows = [[1, 0, 0], [0, -1, 5], [0, 0, 1], [0, 0, 1]]
            expect(ut.isTransformationMatrix(badShape)).to.be.false()
            expect(ut.isTransformationMatrix(tooManyRows)).to.be.false()
        })
        it('isTransformationMatrix() returns false for last row <> 0, 0, 1', () => {
            const matrix = [[1, 0, 0], [0, -1, 5], [0, 1, 1]]
            expect(ut.isTransformationMatrix(matrix)).to.be.false()
        })
    })
    describe('Conversion to transformation matrix', () => {
        it('toTransformationMatrix() returns identity', () => {
            const myMatrix = matrix([[50, 0, 0], [0, -50, 50], [0, 0, 1]])
            const asTMatrix = ut.toTransformationMatrix(myMatrix)
            expect(JSON.stringify(myMatrix.toArray())).to.equal(JSON.stringify(asTMatrix))
        })
        it('toTransformationMatrix() returns a TransformationMatrix', () => {
            const myMatrix = matrix([[50, 0, 0], [0, -50, 50], [0, 0, 1]])
            expect(ut.isTransformationMatrix(ut.toTransformationMatrix(myMatrix))).to.be.true()
        })
        it('toTransformationMatrix() throws on bad shape', () => {
            const badFn = () => ut.toTransformationMatrix( matrix([[1, 0, 0], [0, -1, 5], [0, 1, 1], [0, 1, 1]]) )
            expect(badFn).to.throw()
        })
        it('toTransformationMatrix() throws on wrong last row', () => {
            const badFn = () => ut.toTransformationMatrix(matrix([[1, 0, 0], [0, -1, 5], [0, 1, 1]]))
            expect(badFn).to.throw()
        })
    })
    describe('Base Transformation Matrix setup and inversions', () => {
        const baseWidth = 600
        const baseHeight = 600
        const portraitWidth = 400
        const portraitHeight = baseHeight
        const landscapeWidth = baseWidth
        const landscapeHeight = 400

        it('getBasePixelTransformationMatrix() sets expected base transform matrix for square canvas', () => {
            const { matrix } = ut.getBasePixelTransformationMatrix(baseWidth, baseHeight)
            expect(JSON.stringify(matrix)).to.equal(JSON.stringify([[600, 0, 0], [0, -600, 600], [0, 0, 1]]))
        })
        it('getBasePixelTransformationMatrix() sets expected base transform matrix for landscape canvas', () => {
            const { matrix } = ut.getBasePixelTransformationMatrix(landscapeWidth, landscapeHeight)
            expect(JSON.stringify(matrix)).to.equal(JSON.stringify([[400, 0, 0], [0, -400, 400], [0, 0, 1]]))
        })
        it('getBasePixelTransformationMatrix() sets expected base transform matrix for portrait canvas', () => {
            const { matrix } = ut.getBasePixelTransformationMatrix(portraitWidth, portraitHeight)
            expect(JSON.stringify(matrix)).to.equal(JSON.stringify([[400, 0, 0], [0, -400, 600], [0, 0, 1]]))
        })
        it('getBasePixelTransformationMatrix() sets expected coordinate ranges for all orientations', () => {
            let { coords } = ut.getBasePixelTransformationMatrix(baseWidth, baseHeight)
            expect(ut.rectsAreEqual(coords, {xmin: 0, xmax: 1, ymin: 0, ymax: 1} )).to.be.true()
            coords = ut.getBasePixelTransformationMatrix(landscapeWidth, landscapeHeight)['coords']
            expect(ut.rectsAreEqual(coords, {xmin: 0, xmax: 1.5, ymin: 0, ymax: 1} )).to.be.true()
            coords = ut.getBasePixelTransformationMatrix(portraitWidth, portraitHeight)['coords']
            expect(ut.rectsAreEqual(coords, {xmin: 0, xmax: 1, ymin: 0, ymax: 1.5} )).to.be.true()
        })
        it('getBasePixelTransformationMatrix() uses input target system when provided', () => {
            const newTargetSystem = { xmin: 150, xmax: 450, ymin: 100, ymax: 700 }
            const { matrix, coords } = ut.getBasePixelTransformationMatrix(baseWidth, baseHeight, newTargetSystem)
            const expectedMatrix = [[2, 0, -300], [0, -1, 700], [0, 0, 1]]
            expect(ut.rectsAreEqual(coords, newTargetSystem))
            expect(JSON.stringify(matrix)).to.equal(JSON.stringify(expectedMatrix))
        })
        it('getBasePixelTransformationMatrix() throws when width or height unset', () => {
            const noWidth = () => ut.getBasePixelTransformationMatrix(undefined as any as number, baseHeight)
            const noHeight = () => ut.getBasePixelTransformationMatrix(baseWidth, undefined as any as number)
            expect(noWidth).to.throw()
            expect(noHeight).to.throw()
        })
        it('applyNewTransformationMatrix() returns object with correct transformation matrix', () => {
            const { matrix, coords } = ut.getBasePixelTransformationMatrix(baseWidth, baseHeight)
            const baseRange = {xmin: 0, xmax: 1, ymin: 0, ymax: 1}
            expect(ut.rectsAreEqual(coords, baseRange)).to.be.true('Assert base coord range is unit square')
            const newSystem = {xmin: 20, xmax: 80, ymin: 0, ymax: 60}
            const finalMatrix = ut.getUpdatedTransformationMatrix(newSystem, baseRange, matrix)
            // Got the new matrix, which (per my pencil math) should be [10, 0, -200], [0, -10, 600], [0 0 1]
            // (Assuming mathjs downscaled and upscaled without loss of fidelity)
            expect(JSON.stringify(finalMatrix)).to.equal(JSON.stringify([[10, 0, -200], [0, -10, 600], [0, 0, 1]]))
        })
    })
    describe('Getting new transformation matrix', () => {
        it('getTransformationMatrix() matches expected value (no translation)', () => {
            // intentionally testing a downscaling to avoid any issues from floating-point rounding
            const oldSystem = { xmin: 0, ymin: 0, xmax: 50, ymax: 50 }
            const newSystem = { xmin: 0, ymin: 0, xmax: 10, ymax: 10 }
            const tmatrix = ut.getTransformationMatrix(newSystem, oldSystem)
            expect(JSON.stringify(tmatrix)).to.equal(JSON.stringify([[5, 0, 0], [0, 5, 0], [0, 0, 1]]))
        })
        it('getTransformationMatrix() matches expected value (with translation)', () => {
            const oldSystem = { xmin: 0, ymin: 0, xmax: 1000, ymax: 1000 }
            let newSystem = { xmin: 0, ymin: 0, xmax: 50, ymax: 25 }
            const targetedRegion = { ...oldSystem, xmin: 500, ymin: 500 }
            // expect: 10x scaling in x and 20x in y, plus a [500, 500] offset
            let expected = [[10,  0, 500],
                            [ 0, 20, 500],
                            [ 0,  0,   1]]
            expect(JSON.stringify(ut.getTransformationMatrix(newSystem, targetedRegion))).to.equal(JSON.stringify(expected))
            // now let's try a new system with an offset
            newSystem = { xmin: 20, xmax: 70, ymin: 0, ymax: 50 }
            expected = [[20,  0, -400],
                        [ 0, 20,    0],
                        [ 0,  0,    1]]
            expect(JSON.stringify(ut.getTransformationMatrix(newSystem, oldSystem))).to.equal(JSON.stringify(expected))
        })
        it('getTransformationMatrix() result does convert new-system point into old-system point', () => {
            const oldSystem = { xmin: 0, ymin: 0, xmax: 200, ymax: 100 }
            const newSystem = { xmin: 0, ymin: 0, xmax: 12, ymax: 12 }
            // Note: we're addressing the (square) right half of the old system's rectangle.
            const targetedRegion = { ...oldSystem, xmin: (oldSystem.xmin + oldSystem.xmax)/2 }
            const tmatrix = matrix(ut.getTransformationMatrix(newSystem, targetedRegion))
            const pointInNewSystem = matrix([6, 6, 1]) // Midpoint of new system
            const pointInOldSystem = multiply(tmatrix, pointInNewSystem).toArray()
            // new point, the midpoint of a right-side square subregion, should equal a point
            // at 3/4 of the original xrange and 1/2 of the original yrange
            expect(JSON.stringify(pointInOldSystem)).to.equal(JSON.stringify([150, 50, 1]))
        })
        it('getInverseTransformationMatrix() returns the correct matrix inverse', () => {
            const oldSystem = { xmin: 0, ymin: 0, xmax: 200, ymax: 100 }
            const newSystem = { xmin: 20, ymin: 0, xmax: 70, ymax: 50 }
            const targetedRegion = { ...oldSystem, xmin: (oldSystem.xmin + oldSystem.xmax)/2 }
            // somewhat poor form to use a function from the system under test, but... eh....
            const tmatrix = matrix(ut.getTransformationMatrix(newSystem, targetedRegion))
            const pointInNewSystem = matrix([10, 15, 1])
            const pointInOldSystem = multiply(tmatrix, pointInNewSystem).toArray()
            
            const inverse = ut.getInverseTransformationMatrix(ut.toTransformationMatrix(tmatrix))
            const invmatrix = matrix(inverse)

            const roundTrip = multiply(invmatrix, pointInOldSystem)
            expect(JSON.stringify(pointInNewSystem.toArray())).to.equal(JSON.stringify(roundTrip.toArray()))
        })
    })
    describe('Transformations', () => {
        const oldSystem = { xmin: 0, ymin: 0, xmax: 450, ymax: 300 }
        const targetRange = { ...oldSystem, xmax: 300 } // square region corresp. to the left 2/3 of the original system
        const newSystem = { xmin: 0, ymin: 0, xmax: 60, ymax: 60 }
        const tmatrix = ut.getTransformationMatrix(newSystem, targetRange)
        const targetRangeWithTranslation = { ...oldSystem, xmin: 150 }
        const tmatrixWithTranslation = ut.getTransformationMatrix(newSystem, targetRangeWithTranslation)
        describe('Point transforms', () => {
            const newPoint = [20, 40, 1] as ut.Vec2H
            const oldPoint = [100, 200, 1] as ut.Vec2H
            const transformedXY = ut.transformXY(tmatrix, newPoint[0], newPoint[1])
            it('transformXY() returns homogeneous point', () => {
                expect(ut.isVec2H(transformedXY)).to.be.true()
            })
            it('transformXY() returns expected value', () => {
                expect(transformedXY[0]).to.equal(oldPoint[0])
                expect(transformedXY[1]).to.equal(oldPoint[1])
            })
            it('transformPoint() returns expected value', () => {
                const transformedPt = ut.transformPoint(tmatrix, newPoint)
                expect(JSON.stringify(transformedPt)).to.equal(JSON.stringify(oldPoint))
            })
        })
        describe('Rect transforms', () => {
            const rectInNewSystem = { xmin: 10, ymin: 20, xmax: 45, ymax: 55 }
            const expectedInOldSystem = { xmin: 50, ymin: 100, xmax: 225, ymax: 275 }
            it('transformRect() returns correct value (no translation)', () => {
                const result = ut.transformRect(tmatrix, rectInNewSystem)
                expect(ut.rectsAreEqual(result, expectedInOldSystem)).to.be.true()
            })
            it('transformRect() returns correct value (with translation)', () => {
                const newExpected = { xmin: 200, ymin: 100, xmax: 375, ymax: 275 }
                const result = ut.transformRect(tmatrixWithTranslation, rectInNewSystem)
                expect(ut.rectsAreEqual(result, newExpected)).to.be.true()
            })
        })
        describe('Distance transforms', () => {
            it('transformDistance() returns expected values', () => {
                const distances = [6, 12] // 6 units in x, 12 units in y
                const converted = ut.transformDistance(tmatrix, distances)
                expect(JSON.stringify(converted)).to.equal(JSON.stringify([30, 60]))
            })
            it('transformDistance() returns expected values, untranslated', () => {
                const distances = [6, 12]
                const converted = ut.transformDistance(tmatrixWithTranslation, distances)
                expect(JSON.stringify(converted)).to.equal(JSON.stringify([30, 60]))
            })
            it('transformDistance() returns only positive values', () => {
                const newTmatrix = tmatrix
                newTmatrix[1][1] = newTmatrix[1][1] * -1 // invert y-scale as in coordinate-to-pixel transform
                const distances = [20, 30]
                const converted = ut.transformDistance(newTmatrix, distances)
                expect(JSON.stringify(converted)).to.equal(JSON.stringify([100, 150]))
            })
        })
    })
})
