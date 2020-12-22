// LABBOX-EXTENSION: unitstable
// LABBOX-EXTENSION-TAGS: jupyter

import { faTable } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from 'react';
import { ExtensionContext } from "../extensionInterface";
import registerMetricPlugins from "./Units/metricPlugins/registerMetricPlugins";
import Units from './Units/Units';

export function activate(context: ExtensionContext) {
    registerMetricPlugins(context)

    context.registerSortingView({
        name: 'UnitsTable',
        label: 'Units Table',
        icon: <FontAwesomeIcon icon={faTable} />,
        priority: 1000,
        component: Units,
        props: {
            maxHeight: 300
        },
        singleton: true
    })
}