// @ts-expect-error No clue why PhpStorm doesn't understand the scopes
export const onWorker = () => typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;