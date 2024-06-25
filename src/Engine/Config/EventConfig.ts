export type EventConfig<Events> = {
    [K in keyof Events]: {
        value: Events[K],
        min?: Events[K],
        max?: Events[K],
    }
};

export interface ConfigManager<Events> {
    set: <T extends keyof Events>(event: T, value: Events[T]) => void;
    get: <T extends keyof Events>(event: T) => Events[T];
}