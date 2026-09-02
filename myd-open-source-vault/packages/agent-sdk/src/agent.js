/**
 * Agent — Core agent implementation with tools, memory, knowledge, and model routing.
 */

const { ToolRegistry, Tool } = require('./tools');
const { ShortTermMemory, TaskMemory } = require('./memory');
const { KnowledgeBase } = require('./knowledge');
const { EventEmitter } = require('events');

class AgentConfig {
  constructor(config = {}) {
    this.name = config.name || 'unnamed-agent';
    this.description = config.description || '';
    this.systemPrompt = config.systemPrompt || '';
    this.model = config.model || null;
    this.temperature = config.temperature ?? 0.7;
    this.maxTokens = config.maxTokens ?? 4096;
    this.costLimit = config.costLimit ?? 10.0; // USD per day
    this.tools = config.tools || [];
    this.permissions = config.permissions || { read: true, write: false, execute: false, deploy: false };
    this.maxIterations = config.maxIterations ?? 10;
    this.timeoutMs = config.timeoutMs ?? 300000; // 5 minutes
    this.memoryConfig = config.memoryConfig || {};
    this.knowledgeConfig = config.knowledgeConfig || {};
  }

  validate() {
    if (!this.name) throw new Error('Agent name is required');
    if (this.temperature < 0 || this.temperature > 2) throw new Error('Temperature must be 0-2');
    if (this.maxTokens < 1) throw new Error('maxTokens must be > 0');
    return true;
  }
}

class Agent extends EventEmitter {
  /**
   * @param {AgentConfig} config
   * @param {object} aiCore - MydAiCore instance (optional)
   */
  constructor(config, aiCore = null) {
    super();
    this.config = config instanceof AgentConfig ? config : new AgentConfig(config);
    this.config.validate();
    this.aiCore = aiCore;
    this.toolRegistry = new ToolRegistry();
    this.shortMemory = new ShortTermMemory(this.config.memoryConfig.shortTerm || {});
    this.taskMemory = new TaskMemory();
    this.knowledge = new KnowledgeBase(this.config.knowledgeConfig);
    this.state = 'idle'; // idle | running | paused | completed | failed
    this.runHistory = [];
    this.totalCost = 0;
    this.totalTokens = 0;

    // Register configured tools
    for (const toolConfig of this.config.tools) {
      if (toolConfig instanceof Tool) {
        this.toolRegistry.register(toolConfig);
      }
    }
  }

  /**
   * Register a tool with this agent.
   */
  registerTool(tool) {
    this.toolRegistry.register(tool);
    return this;
  }

  /**
   * Add knowledge to the agent's knowledge base.
   */
  addKnowledge(id, content, metadata = {}) {
    this.knowledge.add(id, content, metadata);
    return this;
  }

  /**
   * Execute a task using the agent.
   * @param {string} task - The task description/prompt
   * @param {object} context - Additional context
   * @returns {Promise<{result: string, iterations: number, cost: number, tools_used: string[]}>}
   */
  async run(task, context = {}) {
    this.state = 'running';
    this.emit('agent:started', { agent: this.config.name, task });

    const runRecord = {
      task,
      context,
      startTime: new Date().toISOString(),
      iterations: 0,
      toolsUsed: [],
      cost: 0,
      result: null,
      error: null,
    };

    try {
      const startTime = Date.now();
      let iterations = 0;
      let lastResponse = '';

      while (iterations < this.config.maxIterations) {
        // Check timeout
        if (Date.now() - startTime > this.config.timeoutMs) {
          throw new Error(`Agent timeout after ${this.config.timeoutMs}ms`);
        }

        // Check cost limit
        if (this.totalCost >= this.config.costLimit) {
          throw new Error(`Cost limit reached: $${this.totalCost.toFixed(4)} >= $${this.config.costLimit}`);
        }

        // Build prompt with context
        const messages = this._buildMessages(task, context, lastResponse, iterations);

        // Generate response (with tool calling)
        const response = await this._generate(messages);

        if (response.error) {
          throw new Error(response.error);
        }

        lastResponse = response.text || '';
        iterations++;

        // Check if agent wants to use a tool
        const toolCall = this._parseToolCall(lastResponse);
        if (toolCall) {
          const toolResult = await this._executeTool(toolCall);
          runRecord.toolsUsed.push(toolCall.name);
          lastResponse = `\nTool Result (${toolCall.name}): ${JSON.stringify(toolResult)}\n\nContinue with the task.`;
          this.emit('agent:tool_used', { agent: this.config.name, tool: toolCall.name, result: toolResult });
        } else {
          // No tool call — task is complete
          runRecord.result = lastResponse;
          break;
        }
      }

      runRecord.iterations = iterations;
      runRecord.cost = this.totalCost;
      runRecord.endTime = new Date().toISOString();
      this.runHistory.push(runRecord);
      this.state = 'completed';
      this.emit('agent:completed', { agent: this.config.name, result: runRecord.result, iterations });

      return runRecord;
    } catch (err) {
      this.state = 'failed';
      runRecord.error = err.message;
      runRecord.endTime = new Date().toISOString();
      this.runHistory.push(runRecord);
      this.emit('agent:failed', { agent: this.config.name, error: err.message });
      return runRecord;
    }
  }

  /**
   * Pause the agent.
   */
  pause() {
    if (this.state === 'running') {
      this.state = 'paused';
      this.emit('agent:paused', { agent: this.config.name });
    }
  }

  /**
   * Get agent status.
   */
  getStatus() {
    return {
      name: this.config.name,
      state: this.state,
      totalCost: this.totalCost,
      totalTokens: this.totalTokens,
      runCount: this.runHistory.length,
      tools: this.toolRegistry.list().map(t => t.name),
      permissions: this.config.permissions,
    };
  }

  /**
   * Get run history.
   */
  getRunHistory() {
    return [...this.runHistory];
  }

  // ─── Private Methods ───

  _buildMessages(task, context, lastResponse, iteration) {
    const messages = [];

    // System prompt
    let systemPrompt = this.config.systemPrompt;
    if (context.systemPromptSuffix) systemPrompt += '\n' + context.systemPromptSuffix;

    // Add available tools info
    const tools = this.toolRegistry.list();
    if (tools.length > 0) {
      const toolDescriptions = tools.map(t => `- ${t.name}: ${t.description}`).join('\n');
      systemPrompt += `\n\nAvailable Tools:\n${toolDescriptions}\n\nTo use a tool, respond with: [TOOL: tool_name(param1="value1", param2="value2")]`;
    }

    // Add knowledge context
    if (task) {
      const relevantKnowledge = this.knowledge.search(task, 3);
      if (relevantKnowledge.length > 0) {
        systemPrompt += '\n\nRelevant Knowledge:\n' + relevantKnowledge.map(k => `- ${k.content.slice(0, 500)}`).join('\n');
      }
    }

    messages.push({ role: 'system', content: systemPrompt });

    // Previous conversation from short-term memory
    const history = this.shortMemory.getAll();
    for (const msg of history) {
      messages.push(msg);
    }

    // Current task
    if (iteration === 0) {
      messages.push({ role: 'user', content: task });
      this.shortMemory.add({ role: 'user', content: task });
    } else if (lastResponse) {
      messages.push({ role: 'assistant', content: lastResponse });
      this.shortMemory.add({ role: 'assistant', content: lastResponse });
      messages.push({ role: 'user', content: 'Continue with the task using the tool result above.' });
    }

    return messages;
  }

  async _generate(messages) {
    if (this.aiCore) {
      // Use real AI core
      const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
      const result = await this.aiCore.generate({
        task: 'general',
        prompt,
        options: {
          temperature: this.config.temperature,
          maxTokens: this.config.maxTokens,
          ...(this.config.model ? { _overrideModel: this.config.model } : {}),
        },
      });

      if (result.usage) {
        this.totalTokens += (result.usage.prompt_tokens || 0) + (result.usage.completion_tokens || 0);
      }

      return result;
    }

    // Mock response for testing
    return {
      text: `[Mock] Agent ${this.config.name} processed the task. No AI core configured.`,
      usage: null,
    };
  }

  _parseToolCall(text) {
    // Parse tool calls like [TOOL: tool_name(param1="value1")]
    const match = text.match(/\[TOOL:\s*(\w+)\((.*?)\)\]/);
    if (!match) return null;

    const name = match[1];
    const argsStr = match[2];
    const args = {};

    // Parse simple key="value" pairs
    const argMatches = argsStr.matchAll(/(\w+)="([^"]*)"/g);
    for (const m of argMatches) {
      args[m[1]] = m[2];
    }

    return { name, args };
  }

  async _executeTool(toolCall) {
    const tool = this.toolRegistry.get(toolCall.name);
    if (!tool) {
      return { error: `Tool "${toolCall.name}" not found` };
    }

    if (!this.config.permissions.execute && tool.requiresPermission) {
      return { error: `Permission denied for tool "${toolCall.name}"` };
    }

    try {
      return await tool.execute(toolCall.args);
    } catch (err) {
      return { error: err.message };
    }
  }
}

module.exports = { Agent, AgentConfig };
