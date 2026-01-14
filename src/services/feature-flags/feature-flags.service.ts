import { IFeatureFlagStrategy } from './strategies/feature-flag.interface';

export class FeatureFlagsService {
    constructor(private strategy: IFeatureFlagStrategy) {
        this.strategy = strategy;
    }

    async init(): Promise<void> {
        if (this.strategy.init) {
            await this.strategy.init();
        }
    }

    setStrategy(strategy: IFeatureFlagStrategy): void {
        this.strategy = strategy;
    }

    getBoolean(key: string, defaultValue = false): Promise<boolean> {
        return this.strategy.getBoolean(key, defaultValue);
    }

    getString(key: string, defaultValue = ''): Promise<string> {
        return this.strategy.getString(key, defaultValue);
    }

    getNumber(key: string, defaultValue = 0): Promise<number> {
        return this.strategy.getNumber(key, defaultValue);
    }
}
