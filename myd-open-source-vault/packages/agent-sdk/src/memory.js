/**
 * Memory system for agents.
 * ShortTermMemory: conversation buffer
 * TaskMemory: per-task context and results
 * ProjectMemory: long-term project knowledge
 */

class Memory {
  constructor(config = {}) {
    this.maxSize = config.maxSize || 100;
    this.store = [];
  }

  add(item) {
    this.store.push({ ...item, timestamp: new Date().toISOString() });
    if (this.store.length > this.maxSize) {
      this.store = this.store.slice(-this.maxSize);
    }
  }

  getAll() {
    return [...this.store];
  }

  getRecent(n = 10) {
    return this.store.slice(-n);
  }

  clear() {
    this.store = [];
  }

  size() {
    return this.store.length;
  }

  search(query) {
    const q = query.toLowerCase();
    return this.store.filter(item => {
      const text = typeof item === 'string' ? item : JSON.stringify(item);
      return text.toLowerCase().includes(q);
    });
  }
}

class ShortTermMemory extends Memory {
  /**
   * Short-term (conversation) memory with automatic summarization.
   */
  constructor(config = {}) {
    super(config);
    this.summary = '';
  }

  /**
   * Get a compact representation for the model context window.
   */
  getContextSummary() {
    if (this.store.length === 0) return '';
    if (this.store.length <= 5) {
      return this.store.map(m => `${m.role}: ${m.content}`).join('\n');
    }
    // Keep last 5 messages + summary of older ones
    const older = this.store.slice(0, -5);
    const recent = this.store.slice(-5);
    return `Previous context: ${older.length} messages about ${this._extractTopics(older)}\n\n` +
      recent.map(m => `${m.role}: ${m.content}`).join('\n');
  }

  _extractTopics(messages) {
    const words = messages
      .map(m => m.content || '')
      .join(' ')
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 4);
    const freq = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([w]) => w)
      .join(', ') || 'general';
  }
}

class TaskMemory extends Memory {
  /**
   * Per-task memory — stores task context, subtask results, and decisions.
   */
  constructor(config = {}) {
    super(config);
    this.currentTask = null;
    this.subtasks = [];
  }

  startTask(taskDescription, context = {}) {
    this.currentTask = {
      description: taskDescription,
      context,
      startTime: new Date().toISOString(),
      decisions: [],
      results: [],
    };
    this.add({ type: 'task_started', task: taskDescription });
  }

  recordDecision(decision, reason) {
    if (this.currentTask) {
      this.currentTask.decisions.push({ decision, reason, time: new Date().toISOString() });
    }
    this.add({ type: 'decision', decision, reason });
  }

  recordResult(result) {
    if (this.currentTask) {
      this.currentTask.results.push({ ...result, time: new Date().toISOString() });
    }
    this.add({ type: 'result', ...result });
  }

  completeTask(outcome) {
    if (this.currentTask) {
      this.currentTask.endTime = new Date().toISOString();
      this.currentTask.outcome = outcome;
      this.subtasks.push(this.currentTask);
      this.currentTask = null;
    }
    this.add({ type: 'task_completed', outcome });
  }

  getCurrentTask() {
    return this.currentTask ? { ...this.currentTask } : null;
  }

  getCompletedTasks() {
    return [...this.subtasks];
  }

  getTaskSummary() {
    return {
      currentTask: this.currentTask ? this.currentTask.description : null,
      completedTasks: this.subtasks.length,
      totalDecisions: this.subtasks.reduce((sum, t) => sum + t.decisions.length, 0),
    };
  }
}

class ProjectMemory extends Memory {
  /**
   * Long-term project memory — persistent knowledge across tasks.
   */
  constructor(config = {}) {
    super({ maxSize: config.maxSize || 1000, ...config });
    this.projectInfo = {};
  }

  setProjectInfo(key, value) {
    this.projectInfo[key] = value;
  }

  getProjectInfo(key) {
    return key ? this.projectInfo[key] : { ...this.projectInfo };
  }

  addLesson(lesson, context = '') {
    this.add({ type: 'lesson', lesson, context });
  }

  addError(error, fix) {
    this.add({ type: 'error_fix', error, fix });
  }

  getLessons() {
    return this.store.filter(s => s.type === 'lesson');
  }

  getErrorFixes() {
    return this.store.filter(s => s.type === 'error_fix');
  }

  searchByType(type) {
    return this.store.filter(s => s.type === type);
  }
}

module.exports = { Memory, ShortTermMemory, TaskMemory, ProjectMemory };
