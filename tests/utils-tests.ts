import * as mocha from 'mocha'
import * as ut from '../src/util/Utility'

const chai = require('chai')
var dirtyChai = require('dirty-chai')
var expect = chai.expect
chai.use(dirtyChai)

mocha.describe('Type Utilities', () => {
    describe('Number', () => {
        it('isNumber() returns true for numeric values', () => {
            expect(ut.isNumber(5)).to.be.true()
            expect(ut.isNumber(-5)).to.be.true()
            expect(ut.isNumber(1/3)).to.be.true()
        })
        it('isNumber() returns false for non-numeric defined values', () => {
            expect(ut.isNumber('a')).to.be.false()
        })
        it('isNumber() returns false for null or undefined values', () => {
            expect(ut.isNumber(null)).to.be.false()
            expect(ut.isNumber(undefined)).to.be.false()
        })
    })
    describe('String', () => {
        it('isString() returns true for non-empty strings', () => {
            expect(ut.isString('abcdef')).to.be.true()
        })
        it('isString() returns true for unicode', () => {
            expect(ut.isString('子曰。學而時習之、不亦說乎。 有朋自遠方來、不亦樂乎。人不知而不慍、不亦君子乎。')).to.be.true()
        })
        it('isString() returns true for empty string', () => {
            expect(ut.isString('')).to.be.true()
        })
        it('isString() returns false for numeric values', () => {
            expect(ut.isString(123)).to.be.false()
        })
        it('isString() returns false for objects', () => {
            expect(ut.isString({this: 'has strings'})).to.be.false()
        })
        it('isString() returns false for null or undefined values', () => {
            expect(ut.isString(null)).to.be.false()
            expect(ut.isString(undefined)).to.be.false()
        })
    })
})
