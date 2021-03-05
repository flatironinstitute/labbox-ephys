import { LabboxExtensionContext } from "../pluginInterface";
import MainWindow from "./MainWindow/MainWindow";

export function activate(context: LabboxExtensionContext) {
    context.registerPlugin({
        type: 'MainWindow',
        name: 'MainWindow',
        label: 'Main Window',
        component: MainWindow
    })
}