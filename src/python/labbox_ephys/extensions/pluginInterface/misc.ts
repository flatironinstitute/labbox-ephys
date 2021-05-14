export const parseWorkspaceUri = (workspaceUri: string | undefined): {feedId: string | undefined, feedUri: string | undefined} => {
    if (!workspaceUri) return {feedUri: undefined, feedId: undefined}
    if (!workspaceUri.startsWith('workspace://')) {
        return {feedUri: undefined, feedId: undefined}
    }
    const a = workspaceUri.split('?')[0].split('/')
    const feedId = a[2] || undefined
    if (!feedId) return {feedUri: undefined, feedId: undefined}
    return {
        feedId: feedId,
        feedUri: `feed://${feedId}`
    }
}