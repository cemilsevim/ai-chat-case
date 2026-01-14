import { tool, ToolExecuteFunction } from 'ai';
import { z } from 'zod';

export interface GetCurrentWeatherInput {
    city: string;
}

export interface GetCurrentWeatherOutput {
    city: string;
    temperature: number;
    condition: string;
}

export const getCurrentWeather = tool<
    GetCurrentWeatherInput,
    GetCurrentWeatherOutput
>({
    description: 'Get current weather',
    inputSchema: z.object({
        city: z.string(),
    }),
    execute: (async (input: GetCurrentWeatherInput) => {
        return {
            city: input.city,
            temperature: 9,
            condition: 'Rainy',
        };
    }) satisfies ToolExecuteFunction<
        GetCurrentWeatherInput,
        GetCurrentWeatherOutput
    >,
});
