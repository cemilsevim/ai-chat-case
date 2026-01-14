import admin, { ServiceAccount } from 'firebase-admin';
import type { remoteConfig } from 'firebase-admin';
import { IFeatureFlagStrategy } from './feature-flag.interface';

export type FirebaseRemoteConfigStrategyOptions = {
    serviceAccount?: ServiceAccount;
    projectId?: string;
};

export class FirebaseRemoteConfigStrategy implements IFeatureFlagStrategy {
    private remoteConfig?: remoteConfig.RemoteConfig;

    constructor(
        private readonly options: FirebaseRemoteConfigStrategyOptions = {},
    ) { }

    async init(): Promise<void> {
        if (!admin.apps.length) {
            const appOptions: admin.AppOptions = {};

            if (this.options.serviceAccount) {
                appOptions.credential = admin.credential.cert(
                    this.options.serviceAccount,
                );
            }

            if (this.options.projectId) {
                appOptions.projectId = this.options.projectId;
            }

            admin.initializeApp(appOptions);
        }

        this.remoteConfig = admin.remoteConfig();
    }

    async getBoolean(key: string, defaultValue = false): Promise<boolean> {
        const value = await this.fetchParameterValue(key);
        if (value === undefined) {
            return defaultValue;
        }

        return /^true|1|yes|on$/i.test(value);
    }

    async getString(key: string, defaultValue = ''): Promise<string> {
        const value = await this.fetchParameterValue(key);
        return value ?? defaultValue;
    }

    async getNumber(key: string, defaultValue = 0): Promise<number> {
        const value = await this.fetchParameterValue(key);
        if (value === undefined) {
            return defaultValue;
        }

        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : defaultValue;
    }

    private async fetchParameterValue(
        key: string,
    ): Promise<string | undefined> {
        const parameter = await this.fetchRemoteParameter(key);

        if (!parameter) {
            return undefined;
        }
        return this.extractParameterValue(parameter);
    }

    private async fetchRemoteParameter(
        key: string,
    ): Promise<remoteConfig.RemoteConfigParameter | undefined> {
        if (!this.remoteConfig) {
            throw new Error('Firebase Remote Config is not initialized.');
        }

        const template = await this.remoteConfig.getTemplate();
        return template.parameters?.[key];
    }

    private extractParameterValue(
        parameter: remoteConfig.RemoteConfigParameter,
    ): string | undefined {
        const defaultValue = parameter.defaultValue;
        if (defaultValue && 'value' in defaultValue) {
            return defaultValue.value;
        }

        if (parameter.conditionalValues) {
            const firstConditional = Object.values(
                parameter.conditionalValues,
            )[0];
            if (firstConditional && 'value' in firstConditional) {
                return firstConditional.value;
            }
        }

        return undefined;
    }
}
