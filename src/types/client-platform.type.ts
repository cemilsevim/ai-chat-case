import { IResult as UAResult } from 'ua-parser-js';

export type ClientPlatform = 'web' | 'mobile' | 'desktop';

export type ClientPlatformMeta = {
    userAgent?: string;
    browser: UAResult['browser'];
    engine: UAResult['engine'];
    os: UAResult['os'];
    device: UAResult['device'];
    cpu: UAResult['cpu'];
    isBot: boolean;
};

export type PlatformResolution = {
    platform: ClientPlatform;
    meta: ClientPlatformMeta;
};
