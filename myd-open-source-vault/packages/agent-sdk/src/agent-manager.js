/**
 * AgentManager — Orchestrates multiple agents, coordinates tasks, manages resources.
 */

const { EventEmitter } = require('events');
const { Agent } = require('./agent');

class AgentManager extends EventEmitter {
  constructor(config = {}) {
    super();
    this.agents = new Map();
    this.taskQueue = [];
    this.activeTasks = new Map();
    this.maxConcurrent = config.maxConcurrent || 5;
    this.totalBudget = config.totalBudget || 100; // USD
    this.spentBudget = 0;
    this.completedTasks = [];
    this.failedTasks = [];
  }

  /**
   * Register an agent.
   */
  registerAgent(agent) {
    if (!(agent instanceof Agent)) throw new Error('Must register an Agent instance');
    this.agents.set(agent.config.name, agent);

    // Forward agent events
    agent.on('agent:completed', (data) => this.emit('agent:completed', data));
    agent.on('agent:failed', (data) => this.emit('agent:failed', data));
    agent.on('agent:tool_used', (data) => this.emit('agent:tool_used', data));

    return this;
  }

  /**
   * Get an agent by name.
   */
  getAgent(name) {
    return this.agents.get(name);
  }

  /**
   * List all registered agents.
   */
  listAgents() {
    return Array.from(this.agents.values()).map(a => a.getStatus());
  }

  /**
   * Submit a task to the queue.
   * @param {object} task
   * @param {string} task.agent - Agent name to handle the task
   * @param {string} task.description - Task description
   * @param {object} task.context - Additional context
   * @param {string} task.priority - 'high' | 'normal' | 'low'
   */
  submitTask(task) {
    const taskRecord = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      agent: task.agent || this._selectBestAgent(task.description),
      description: task.description,
      context: task.context || {},
      priority: task.priority || 'normal',
      status: 'queued',
      submittedAt: new Date().toISOString(),
    };

    this.taskQueue.push(taskRecord);
    this._sortQueue();
    this.emit('task:queued', taskRecord);

    // Try to process immediately
    this._processQueue();

    return taskRecord;
  }

  /**
   * Execute a task immediately with a specific agent.
   */
  async executeTask(agentName, taskDescription, context = {}) {
    const agent = this.agents.get(agentName);
    if (!agent) throw new Error(`Agent "${agentName}" not found`);

    if (this.activeTasks.size >= this.maxConcurrent) {
      throw new Error('Maximum concurrent tasks reached');
    }

    if (this.spentBudget >= this.totalBudget) {
      throw new Error('Total budget exceeded');
    }

    const taskId = `exec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.activeTasks.set(taskId, { agent: agentName, startTime: Date.now() });

    try {
      const result = await agent.run(taskDescription, context);
      this.spentBudget += result.cost || 0;
      this.completedTasks.push({ taskId, agent: agentName, ...result });
      this.activeTasks.delete(taskId);
      this.emit('task:completed', { taskId, agent: agentName, result });
      return result;
    } catch (err) {
      this.failedTasks.push({ taskId, agent: agentName, error: err.message });
      this.activeTasks.delete(taskId);
      this.emit('task:failed', { taskId, agent: agentName, error: err.message });
      throw err;
    }
  }

  /**
   * Get manager status.
   */
  getStatus() {
    return {
      agents: this.agents.size,
      activeTasks: this.activeTasks.size,
      queuedTasks: this.taskQueue.length,
      completedTasks: this.completedTasks.length,
      failedTasks: this.failedTasks.length,
      budget: {
        total: this.totalBudget,
        spent: Math.round(this.spentBudget * 10000) / 10000,
        remaining: Math.round((this.totalBudget - this.spentBudget) * 10000) / 10000,
      },
    };
  }

  /**
   * Get all task results.
   */
  getResults() {
    return {
      completed: [...this.completedTasks],
      failed: [...this.failedTasks],
    };
  }

  // ─── Private Methods ───

  _processQueue() {
    while (this.activeTasks.size < this.maxConcurrent && this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      task.status = 'running';
      this._executeTaskFromQueue(task);
    }
  }

  async _executeTaskFromQueue(task) {
    const agent = this.agents.get(task.agent);
    if (!agent) {
      task.status = 'failed';
      task.error = `Agent "${task.agent}" not found`;
      this.failedTasks.push(task);
      return;
    }

    const taskId = task.id;
    this.activeTasks.set(taskId, { agent: task.agent, startTime: Date.now() });

    try {
      const result = await agent.run(task.description, task.context);
      task.status = 'completed';
      task.result = result;
      this.spentBudget += result.cost || 0;
      this.completedTasks.push(task);
      this.activeTasks.delete(taskId);
      this.emit('task:completed', { taskId, agent: task.agent, result });
    } catch (err) {
      task.status = 'failed';
      task.error = err.message;
      this.failedTasks.push(task);
      this.activeTasks.delete(taskId);
      this.emit('task:failed', { taskId, agent: task.agent, error: err.message });
    }

    // Process next in queue
    this._processQueue();
  }

  _selectBestAgent(taskDescription) {
    // Simple: select first available agent, or 'general' if exists
    if (this.agents.has('general')) return 'general';
    const names = Array.from(this.agents.keys());
    return names[0] || 'general';
  }

  _sortQueue() {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    this.taskQueue.sort((a, b) =>
      (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1)
    );
  }
}

module.exports = { AgentManager };
