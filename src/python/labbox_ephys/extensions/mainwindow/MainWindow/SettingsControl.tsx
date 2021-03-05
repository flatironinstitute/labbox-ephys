import { IconButton } from '@material-ui/core';
import { Settings } from '@material-ui/icons';
import React, { FunctionComponent, useCallback, useMemo } from 'react';

type Props = {
    onOpenSettings: () => void
}

const SettingsControl: FunctionComponent<Props> = ({ onOpenSettings }) => {
    const { icon, title } = useMemo(() => {
        return {icon: <Settings />, title: 'Open settings'}
    }, [])

    const handleClick = useCallback(() => {
        onOpenSettings()
    }, [onOpenSettings])

    return (
        <IconButton title={title} onClick={handleClick}>{icon}</IconButton>
    );
}

export default SettingsControl