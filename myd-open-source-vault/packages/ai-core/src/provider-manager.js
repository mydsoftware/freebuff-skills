/**
 * ProviderManager — Manages multiple AI provider instances.
 * Providers are pluggable: OpenRouter, OpenAI, Ollama, custom.
 */

class ProviderManager {
  constructor(configs = []) {
    this.configs = configs;
    this.providers = new Map();
  }

  async initialize() {
    for (const config of this.configs) {
      this.addProvider(config);
    }
  }

  addProvider(config) {
    const { name, type, baseUrl, apiKey, models, embeddingModels } = config;

    // Create generic provider wrapper
    const provider = {
      name,
      type: type || 'openai-compatible',
      baseUrl: baseUrl || 'https://openrouter.ai/api/v1',
      apiKey: apiKey || '',
      models: models || [],
      embeddingModels: embeddingModels || [],

      async generate({ model, prompt, temperature = 0.7, maxTokens = 4096, ...rest }) {
        const axios = require('axios');
        const endpoint = `${provider.baseUrl}/chat/completions`;

        const headers = { 'Content-Type': 'application/json' };
        if (provider.apiKey) {
          headers['Authorization'] = `Bearer ${provider.apiKey}`;
        }

        const body = {
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
          ...rest,
        };

        try {
          const res = await axios.post(endpoint, body, { headers, timeout: 120000 });
          const choice = res.data.choices && res.data.choices[0];
          return {
            text: choice ? choice.message.content : '',
            usage: res.data.usage || null,
            finishReason: choice ? choice.finish_reason : null,
          };
        } catch (err) {
          return {
            text: null,
            error: err.response ? err.response.data : err.message,
          };
        }
      },

      async *stream({ model, prompt, temperature = 0.7, maxTokens = 4096 }) {
        const axios = require('axios');
        const endpoint = `${provider.baseUrl}/chat/completions`;

        const headers = { 'Content-Type': 'application/json' };
        if (provider.apiKey) {
          headers['Authorization'] = `Bearer ${provider.apiKey}`;
        }

        const body = {
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
          stream: true,
        };

        const res = await axios.post(endpoint, body, {
          headers,
          timeout: 120000,
          responseType: 'stream',
        });

        for await (const chunk of res.data) {
          const lines = chunk.toString().split('\n').filter(l => l.startsWith('data: '));
          for (const line of lines) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices && parsed.choices[0] && parsed.choices[0].delta;
              if (delta && delta.content) {
                yield { chunk: delta.content };
              }
            } catch { /* skip malformed chunks */ }
          }
        }
      },

      async embed({ text, model }) {
        const axios = require('axios');
        const texts = Array.isArray(text) ? text : [text];
        const endpoint = `${provider.baseUrl}/embeddings`;
        const modelName = model || provider.embeddingModels[0] || 'text-embedding-3-small';

        const headers = { 'Content-Type': 'application/json' };
        if (provider.apiKey) {
          headers['Authorization'] = `Bearer ${provider.apiKey}`;
        }

        const res = await axios.post(endpoint, {
          model: modelName,
          input: texts,
        }, { headers, timeout: 60000 });

        return {
          embeddings: res.data.data.map(d => d.embedding),
          model: modelName,
          usage: res.data.usage,
        };
      },
    };

    this.providers.set(name, provider);
  }

  getProvider(name) {
    return this.providers.get(name);
  }

  getEmbeddingProvider() {
    for (const [, provider] of this.providers) {
      if (provider.embeddingModels && provider.embeddingModels.length > 0) {
        return provider.name;
      }
    }
    return null;
  }

  findProviderForModel(model) {
    for (const [, provider] of this.providers) {
      if (provider.models && provider.models.includes(model)) {
        return provider.name;
      }
    }
    return null;
  }

  listProviders() {
    return Array.from(this.providers.keys());
  }
}

module.exports = { ProviderManager };
