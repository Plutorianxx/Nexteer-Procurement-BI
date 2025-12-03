import type { ReportRequest } from '../types/llm';

const API_BASE_URL = '/api'; // Vite proxy handles the rest

export const llmService = {
    generateReportStream: async (request: ReportRequest, onChunk: (chunk: string) => void, onError: (error: string) => void, onComplete: () => void) => {
        try {
            const response = await fetch(`${API_BASE_URL}/llm/generate-report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || response.statusText);
            }

            if (!response.body) {
                throw new Error("No response body");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                const chunk = decoder.decode(value, { stream: true });
                onChunk(chunk);
            }

            onComplete();

        } catch (error: any) {
            console.error("LLM Generation Error:", error);
            onError(error.message || "Failed to generate report");
        }
    }
};
