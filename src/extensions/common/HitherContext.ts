import React from 'react'
import { dummyHitherInterface, HitherInterface } from '../extensionInterface'

const HitherContext = React.createContext<HitherInterface>(dummyHitherInterface)

export default HitherContext