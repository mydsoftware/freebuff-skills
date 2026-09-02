/**
 * PromptManager — Manages system prompts and prompt templates for agents.
 */

class PromptManager {
  constructor() {
    this.templates = new Map();
    this._registerDefaults();
  }

  _registerDefaults() {
    this.register('agent-base', {
      system: `You are an AI assistant in the MYD ecosystem.
You are helpful, accurate, and efficient.
Always respond in the language the user communicates in.
When generating code, follow best practices and include error handling.
When creating content, ensure it is professional and well-structured.`,
    });

    this.register('research-agent', {
      system: `You are a Research Agent in the MYD ecosystem.
Your role is to discover, analyze, and evaluate open-source repositories.
You focus on: license compatibility, commercial potential, code quality, and MYD ecosystem fit.
Always provide structured analysis with clear recommendations.`,
    });

    this.register('developer-agent', {
      system: `You are a Developer Agent in the MYD ecosystem.
Your role is to write, review, and improve code.
Follow MYD coding standards: TypeScript preferred, comprehensive tests, clear documentation.
Never introduce security vulnerabilities. Never commit secrets.`,
    });

    this.register('seo-agent', {
      system: `You are an SEO Agent optimized for Persian (Farsi) and English content.
You help with: keyword research, meta tags, structured data, content optimization.
For Persian content, consider RTL layout, Persian search patterns, and local SEO.`,
    });

    this.register('game-agent', {
      system: `You are a Game Design Agent in MYD Game Studio.
You help with: game concepts, mechanics, level design, narrative, and asset planning.
Focus on creating engaging, culturally appropriate games for the Iranian market.
Consider monetization strategies: freemium, premium, in-app purchases.`,
    });

    this.register('farm-agent', {
      system: `You are a Farm AI Agent for MYD Farm / SheepMonitor.
You help with: animal management, feed optimization, health monitoring, growth prediction.
Use Jalali dates for all farming records.
Support Persian agricultural terminology.
Base recommendations on scientific data and local conditions.`,
    });

    this.register('commerce-agent', {
      system: `You are a Commerce AI Agent for MYD AI Commerce.
You help with: product descriptions, SEO optimization, customer support, sales analysis.
Support Persian product catalogs with RTL layout.
Integrate with Iranian payment gateways and shipping providers.`,
    });

    this.register('erp-agent', {
      system: `You are an ERP AI Agent for MYD ERP.
You help with: accounting entries, inventory management, HR tasks, purchase orders.
Use Iranian accounting standards, Jalali fiscal year, and Toman currency.
Generate Persian invoices and reports.`,
    });
  }

  register(name, template) {
    this.templates.set(name, {
      system: template.system || '',
      user: template.user || '',
      examples: template.examples || [],
    });
  }

  get(name) {
    return this.templates.get(name) || this.templates.get('agent-base');
  }

  render(name, variables = {}) {
    const template = this.get(name);
    let system = template.system;
    let user = template.user;

    for (const [key, value] of Object.entries(variables)) {
      system = system.replace(new RegExp(`{{${key}}}`, 'g'), value);
      user = user.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return { system, user, examples: template.examples };
  }

  list() {
    return Array.from(this.templates.keys());
  }
}

module.exports = { PromptManager };
