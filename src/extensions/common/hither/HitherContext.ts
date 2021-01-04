import React from 'react'
import { dummyHitherInterface, HitherInterface } from './HitherInterface'

const HitherContext = React.createContext<HitherInterface>(dummyHitherInterface)

export default HitherContext