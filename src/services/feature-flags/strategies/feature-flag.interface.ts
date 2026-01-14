export type FeatureFlagPrimitive = boolean | number | string;

export interface IFeatureFlagStrategy {
    init?(): Promise<void> | void;
    getBoolean(key: string, defaultValue?: boolean): Promise<boolean>;
    getString(key: string, defaultValue?: string): Promise<string>;
    getNumber(key: string, defaultValue?: number): Promise<number>;
}
