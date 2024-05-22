declare global {
    interface Performance {
        measureUserAgentSpecificMemory(): Promise<{
            bytes: number;
            breakdown: {
                [key: string]: number;
            };
        }>;
    }
}

export { }