import { ExtensionContext } from "../../../extensionInterface"
import { default as EventCountPlugin } from './EventCount'
import { default as FiringRatePlugin } from './FiringRate'
import { default as IsiViolationsPlugin } from './IsiViolations'
import { default as PeakChannelsPlugin } from './PeakChannels'
import { default as UnitSnrsPlugin } from './UnitSnrs'

const registerMetricPlugins = (context: ExtensionContext) => {
    context.registerSortingUnitMetric(EventCountPlugin)
    context.registerSortingUnitMetric(FiringRatePlugin)
    context.registerSortingUnitMetric(IsiViolationsPlugin)
    context.registerSortingUnitMetric(PeakChannelsPlugin)
    context.registerSortingUnitMetric(UnitSnrsPlugin)
}

export default registerMetricPlugins