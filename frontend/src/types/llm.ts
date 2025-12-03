export interface LLMConfig {
    provider: string;
    api_key: string;
    base_url?: string;
    model: string;
    temperature: number;
}

export interface ReportRequest {
    session_id: string;
    context_type: 'dashboard' | 'commodity' | 'supplier';
    context_value?: string;
    config: LLMConfig;
}
