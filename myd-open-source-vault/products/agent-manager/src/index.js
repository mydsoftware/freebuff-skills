/**
 * MYD AI Agent Manager
 * Unified platform for creating, deploying, and managing AI agents.
 *
 * Features:
 * - Multi-provider AI gateway (OpenRouter, Ollama, local models)
 * - Agent creation and management
 * - Task orchestration and scheduling
 * - Memory and knowledge management
 * - Persian/Jalali localization
 * - Cost tracking and budget management
 * - Security scanning and license checking
 */

const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..', '..');
const { MydAiCore } = require(path.join(ROOT, 'packages', 'ai-core', 'src', 'index.js'));
const { Agent, AgentManager, AgentLoop, ToolRegistry, BUILT_IN_TOOLS } = require(path.join(ROOT, 'packages', 'agent-sdk', 'src', 'index.js'));
const { MydI18n } = require(path.join(ROOT, 'packages', 'i18n', 'src', 'index.js'));

class AgentManagerApp {
  constructor(config = {}) {
    this.config = {
      port: config.port || 3000,
      name: config.name || 'MYD Agent Manager',
      version: config.version || '0.1.0',
      ai: config.ai || {},
      i18n: config.i18n || { locale: 'fa-IR' },
      ...config,
    };

    this.i18n = new MydI18n(this.config.i18n);
    this.aiCore = new MydAiCore(this.config.ai);
    this.agentManager = new AgentManager({
      maxConcurrent: config.maxConcurrent || 5,
      totalBudget: config.totalBudget || 100,
    });
    this.agentLoop = new AgentLoop({ agentManager: this.agentManager });
    this.tools = new ToolRegistry();

    this._registerBuiltInTools();
    this._registerAgentTemplates();
  }

  async initialize() {
    await this.aiCore.initialize();
    return this;
  }

  /**
   * Create a new agent from a template.
   */
  createAgent(template, overrides = {}) {
    const templates = this._getTemplates();
    const tmpl = templates[template];
    if (!tmpl) throw new Error(`Unknown template: ${template}`);

    const config = { ...tmpl, ...overrides };
    const agent = new Agent(config, this.aiCore);

    // Register tools
    for (const toolName of (config.tools || [])) {
      if (this.tools.has(toolName)) {
        agent.registerTool(this.tools.get(toolName));
      }
    }

    this.agentManager.registerAgent(agent);
    return agent;
  }

  /**
   * Submit a task to an agent.
   */
  async submitTask(agentName, taskDescription, context = {}) {
    return this.agentManager.executeTask(agentName, taskDescription, context);
  }

  /**
   * Run the autonomous development loop.
   */
  async runLoop(goal, options = {}) {
    return this.agentLoop.run({ goal, ...options });
  }

  /**
   * Get system status.
   */
  getStatus() {
    return {
      name: this.config.name,
      version: this.config.version,
      locale: this.config.i18n.locale,
      agents: this.agentManager.listAgents(),
      manager: this.agentManager.getStatus(),
      tools: this.tools.list().map(t => t.name),
      templates: Object.keys(this._getTemplates()),
    };
  }

  /**
   * List available agent templates.
   */
  listTemplates() {
    const templates = this._getTemplates();
    return Object.entries(templates).map(([name, tmpl]) => ({
      name,
      description: tmpl.description,
      systemPrompt: tmpl.systemPrompt ? tmpl.systemPrompt.slice(0, 100) + '...' : '',
      tools: tmpl.tools || [],
      permissions: tmpl.permissions,
    }));
  }

  /**
   * Register a custom tool.
   */
  registerTool(tool) {
    this.tools.register(tool);
    return this;
  }

  // ─── Private Methods ───

  _registerBuiltInTools() {
    for (const [, tool] of Object.entries(BUILT_IN_TOOLS)) {
      this.tools.register(tool);
    }
  }

  _registerAgentTemplates() {
    // Templates are defined in _getTemplates()
  }

  _getTemplates() {
    return {
      research: {
        name: 'research-agent',
        description: this.i18n.t('agent.research.desc') || 'Research Agent — discovers and analyzes open-source repositories',
        systemPrompt: 'You are a Research Agent in the MYD ecosystem. Your role is to discover, analyze, and evaluate open-source repositories. You focus on: license compatibility, commercial potential, code quality, and MYD ecosystem fit. Always provide structured analysis with clear recommendations.',
        tools: ['github_search', 'fetch_url', 'search_code', 'generate_report'],
        permissions: { read: true, write: true, execute: false, deploy: false },
        temperature: 0.3,
      },
      developer: {
        name: 'developer-agent',
        description: 'Developer Agent — writes, reviews, and improves code',
        systemPrompt: 'You are a Developer Agent in the MYD ecosystem. Your role is to write, review, and improve code. Follow MYD coding standards: TypeScript preferred, comprehensive tests, clear documentation. Never introduce security vulnerabilities. Never commit secrets.',
        tools: ['read_file', 'write_file', 'list_directory', 'run_command', 'search_code'],
        permissions: { read: true, write: true, execute: true, deploy: false },
        temperature: 0.3,
        maxTokens: 8192,
      },
      seo: {
        name: 'seo-agent',
        description: 'SEO Agent — optimizes content for search engines',
        systemPrompt: 'You are an SEO Agent optimized for Persian (Farsi) and English content. You help with: keyword research, meta tags, structured data, content optimization. For Persian content, consider RTL layout, Persian search patterns, and local SEO.',
        tools: ['fetch_url', 'generate_report', 'search_code'],
        permissions: { read: true, write: true, execute: false, deploy: false },
        temperature: 0.5,
      },
      game: {
        name: 'game-agent',
        description: 'Game Designer Agent — designs and plans game development',
        systemPrompt: 'You are a Game Design Agent in MYD Game Studio. You help with: game concepts, mechanics, level design, narrative, and asset planning. Focus on creating engaging, culturally appropriate games for the Iranian market.',
        tools: ['generate_report', 'search_code'],
        permissions: { read: true, write: true, execute: false, deploy: false },
        temperature: 0.7,
      },
      commerce: {
        name: 'commerce-agent',
        description: 'Commerce Agent — manages e-commerce operations',
        systemPrompt: 'You are a Commerce AI Agent for MYD AI Commerce. You help with: product descriptions, SEO optimization, customer support, sales analysis. Support Persian product catalogs with RTL layout. Integrate with Iranian payment gateways.',
        tools: ['fetch_url', 'search_code', 'generate_report'],
        permissions: { read: true, write: true, execute: false, deploy: false },
        temperature: 0.5,
      },
      erp: {
        name: 'erp-agent',
        description: 'ERP Agent — manages enterprise resource planning',
        systemPrompt: 'You are an ERP AI Agent for MYD ERP. You help with: accounting entries, inventory management, HR tasks, purchase orders. Use Iranian accounting standards, Jalali fiscal year, and Toman currency.',
        tools: ['read_file', 'write_file', 'generate_report'],
        permissions: { read: true, write: true, execute: false, deploy: false },
        temperature: 0.3,
      },
      farm: {
        name: 'farm-agent',
        description: 'Farm Agent — manages agricultural operations',
        systemPrompt: 'You are a Farm AI Agent for MYD Farm / SheepMonitor. You help with: animal management, feed optimization, health monitoring, growth prediction. Use Jalali dates for all farming records.',
        tools: ['read_file', 'write_file', 'generate_report', 'search_code'],
        permissions: { read: true, write: true, execute: false, deploy: false },
        temperature: 0.4,
      },
      general: {
        name: 'general-agent',
        description: 'General Agent — versatile assistant for any task',
        systemPrompt: 'You are a helpful AI assistant in the MYD ecosystem. You are knowledgeable, efficient, and always try to provide the best solution.',
        tools: ['read_file', 'write_file', 'list_directory', 'search_code', 'fetch_url'],
        permissions: { read: true, write: true, execute: false, deploy: false },
        temperature: 0.7,
      },
    };
  }
}

module.exports = { AgentManagerApp };
