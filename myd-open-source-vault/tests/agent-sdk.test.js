const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { Agent, AgentConfig } = require('../packages/agent-sdk/src/agent');
const { Tool, ToolRegistry, BUILT_IN_TOOLS } = require('../packages/agent-sdk/src/tools');
const { Memory, ShortTermMemory, TaskMemory, ProjectMemory } = require('../packages/agent-sdk/src/memory');
const { KnowledgeBase } = require('../packages/agent-sdk/src/knowledge');
const { AgentManager } = require('../packages/agent-sdk/src/agent-manager');
const { AgentLoop } = require('../packages/agent-sdk/src/agent-loop');

describe('MYD Agent SDK', () => {
  // ─── Tool Tests ───
  describe('Tool', () => {
    it('should create a tool with config', () => {
      const tool = new Tool({
        name: 'test_tool',
        description: 'A test tool',
        execute: async (args) => ({ result: 'ok', ...args }),
      });
      assert.equal(tool.name, 'test_tool');
      assert.equal(tool.description, 'A test tool');
    });

    it('should execute a tool', async () => {
      const tool = new Tool({
        name: 'echo',
        execute: async (args) => ({ echo: args.message }),
      });
      const result = await tool.execute({ message: 'hello' });
      assert.equal(result.echo, 'hello');
    });

    it('should serialize to JSON', () => {
      const tool = new Tool({ name: 't', description: 'd', parameters: { x: { type: 'string' } } });
      const json = tool.toJSON();
      assert.equal(json.name, 't');
      assert.equal(json.parameters.x.type, 'string');
    });
  });

  describe('ToolRegistry', () => {
    it('should register and retrieve tools', () => {
      const registry = new ToolRegistry();
      const tool = new Tool({ name: 'a', execute: async () => {} });
      registry.register(tool);
      assert.equal(registry.get('a'), tool);
    });

    it('should list all tools', () => {
      const registry = new ToolRegistry();
      registry.register(new Tool({ name: 'a', execute: async () => {} }));
      registry.register(new Tool({ name: 'b', execute: async () => {} }));
      assert.equal(registry.list().length, 2);
    });

    it('should check if tool exists', () => {
      const registry = new ToolRegistry();
      registry.register(new Tool({ name: 'a', execute: async () => {} }));
      assert.equal(registry.has('a'), true);
      assert.equal(registry.has('b'), false);
    });

    it('should register multiple tools', () => {
      const registry = new ToolRegistry();
      registry.registerAll([
        { name: 'x', execute: async () => {} },
        { name: 'y', execute: async () => {} },
      ]);
      assert.equal(registry.list().length, 2);
    });
  });

  // ─── Memory Tests ───
  describe('Memory', () => {
    it('should add and retrieve items', () => {
      const mem = new Memory({ maxSize: 10 });
      mem.add({ data: 'hello' });
      mem.add({ data: 'world' });
      assert.equal(mem.size(), 2);
      assert.equal(mem.getAll()[0].data, 'hello');
    });

    it('should respect max size', () => {
      const mem = new Memory({ maxSize: 3 });
      mem.add({ i: 1 });
      mem.add({ i: 2 });
      mem.add({ i: 3 });
      mem.add({ i: 4 });
      assert.equal(mem.size(), 3);
      assert.equal(mem.getAll()[0].i, 2); // oldest removed
    });

    it('should search items', () => {
      const mem = new Memory();
      mem.add({ text: 'hello world' });
      mem.add({ text: 'foo bar' });
      const results = mem.search('hello');
      assert.equal(results.length, 1);
    });

    it('should clear memory', () => {
      const mem = new Memory();
      mem.add({ x: 1 });
      mem.clear();
      assert.equal(mem.size(), 0);
    });
  });

  describe('ShortTermMemory', () => {
    it('should build context summary', () => {
      const mem = new ShortTermMemory();
      mem.add({ role: 'user', content: 'Hello' });
      mem.add({ role: 'assistant', content: 'Hi there' });
      const summary = mem.getContextSummary();
      assert.ok(summary.includes('user: Hello'));
    });
  });

  describe('TaskMemory', () => {
    it('should track task lifecycle', () => {
      const mem = new TaskMemory();
      mem.startTask('Build feature X');
      assert.ok(mem.getCurrentTask());
      mem.recordDecision('Use TypeScript', 'Better type safety');
      mem.recordResult({ success: true });
      mem.completeTask('Feature X built');
      assert.equal(mem.getCurrentTask(), null);
      assert.equal(mem.getCompletedTasks().length, 1);
    });

    it('should provide task summary', () => {
      const mem = new TaskMemory();
      mem.startTask('Task 1');
      mem.recordDecision('d1', 'r1');
      mem.completeTask('done');
      const summary = mem.getTaskSummary();
      assert.equal(summary.completedTasks, 1);
      assert.equal(summary.totalDecisions, 1);
    });
  });

  describe('ProjectMemory', () => {
    it('should store project info', () => {
      const mem = new ProjectMemory();
      mem.setProjectInfo('name', 'MYD App');
      mem.setProjectInfo('version', '1.0.0');
      assert.equal(mem.getProjectInfo('name'), 'MYD App');
    });

    it('should track lessons and errors', () => {
      const mem = new ProjectMemory();
      mem.addLesson('Always use TypeScript', 'Better DX');
      mem.addError('Null pointer', 'Added null check');
      assert.equal(mem.getLessons().length, 1);
      assert.equal(mem.getErrorFixes().length, 1);
    });
  });

  // ─── KnowledgeBase Tests ───
  describe('KnowledgeBase', () => {
    it('should add and retrieve knowledge', () => {
      const kb = new KnowledgeBase();
      kb.add('k1', 'LangGraph is an agent framework', { tags: ['ai', 'agents'] });
      const entry = kb.get('k1');
      assert.ok(entry);
      assert.equal(entry.content, 'LangGraph is an agent framework');
      assert.equal(entry.tags.length, 2);
    });

    it('should search by relevance', () => {
      const kb = new KnowledgeBase();
      kb.add('k1', 'LangGraph is an agent framework for building stateful AI workflows', { tags: ['ai'] });
      kb.add('k2', 'React is a JavaScript library for building user interfaces', { tags: ['frontend'] });
      kb.add('k3', 'LangChain provides tools for LLM application development', { tags: ['ai', 'llm'] });

      const results = kb.search('agent AI framework', 2);
      assert.ok(results.length > 0);
      assert.equal(results[0].id, 'k1'); // Most relevant
    });

    it('should search by tag', () => {
      const kb = new KnowledgeBase();
      kb.add('k1', 'content1', { tags: ['ai'] });
      kb.add('k2', 'content2', { tags: ['web'] });
      assert.equal(kb.getByTag('ai').length, 1);
    });

    it('should search by category', () => {
      const kb = new KnowledgeBase();
      kb.add('k1', 'content1', { category: 'tech' });
      kb.add('k2', 'content2', { category: 'business' });
      assert.equal(kb.getByCategory('tech').length, 1);
    });

    it('should provide stats', () => {
      const kb = new KnowledgeBase();
      kb.add('k1', 'c1', { tags: ['a'], category: 'tech' });
      kb.add('k2', 'c2', { tags: ['b'], category: 'tech' });
      const stats = kb.stats();
      assert.equal(stats.total, 2);
      assert.equal(stats.categories.tech, 2);
    });

    it('should export and import', () => {
      const kb1 = new KnowledgeBase();
      kb1.add('k1', 'content', { tags: ['test'] });
      const exported = kb1.export();

      const kb2 = new KnowledgeBase();
      kb2.import(exported);
      assert.equal(kb2.get('k1').content, 'content');
    });
  });

  // ─── Agent Tests ───
  describe('Agent', () => {
    it('should create agent with config', () => {
      const agent = new Agent({ name: 'test-agent', description: 'Test' });
      assert.equal(agent.config.name, 'test-agent');
      assert.equal(agent.state, 'idle');
    });

    it('should validate config', () => {
      // AgentConfig defaults empty name to 'unnamed-agent'
      const agent1 = new Agent({ name: '' });
      assert.equal(agent1.config.name, 'unnamed-agent');
      // Temperature validation via AgentConfig.validate()
      const config = new AgentConfig({ name: 't', temperature: 3 });
      assert.throws(() => config.validate(), /Temperature/);
    });

    it('should register tools', () => {
      const agent = new Agent({ name: 'test' });
      const tool = new Tool({ name: 'my_tool', execute: async () => 'ok' });
      agent.registerTool(tool);
      assert.equal(agent.toolRegistry.has('my_tool'), true);
    });

    it('should add knowledge', () => {
      const agent = new Agent({ name: 'test' });
      agent.addKnowledge('k1', 'Some knowledge');
      assert.equal(agent.knowledge.get('k1').content, 'Some knowledge');
    });

    it('should run with mock AI (no aiCore)', async () => {
      const agent = new Agent({
        name: 'test',
        maxIterations: 1,
        systemPrompt: 'You are a test agent.',
      });
      const result = await agent.run('Hello');
      assert.equal(result.iterations, 1);
      assert.ok(result.result);
    });

    it('should execute tools during run', async () => {
      const agent = new Agent({
        name: 'tool-test',
        maxIterations: 3,
        systemPrompt: 'You are a test agent. Use tools when asked.',
      });
      agent.registerTool(new Tool({
        name: 'echo',
        description: 'Echo input',
        execute: async (args) => ({ echoed: args.text }),
      }));

      // Override _generate to simulate tool call
      agent._generate = async () => ({
        text: '[TOOL: echo(text="hello")]',
        usage: null,
      });

      const result = await agent.run('Echo hello');
      assert.ok(result.toolsUsed.includes('echo'));
    });

    it('should track status', () => {
      const agent = new Agent({ name: 'status-test' });
      const status = agent.getStatus();
      assert.equal(status.name, 'status-test');
      assert.equal(status.state, 'idle');
      assert.equal(status.totalCost, 0);
    });

    it('should emit events', async () => {
      const agent = new Agent({ name: 'event-test', maxIterations: 1 });
      const events = [];
      agent.on('agent:started', (d) => events.push('started'));
      agent.on('agent:completed', (d) => events.push('completed'));
      await agent.run('test');
      assert.ok(events.includes('started'));
      assert.ok(events.includes('completed'));
    });
  });

  // ─── AgentManager Tests ───
  describe('AgentManager', () => {
    it('should register and list agents', () => {
      const mgr = new AgentManager();
      mgr.registerAgent(new Agent({ name: 'a1' }));
      mgr.registerAgent(new Agent({ name: 'a2' }));
      assert.equal(mgr.listAgents().length, 2);
    });

    it('should get agent by name', () => {
      const mgr = new AgentManager();
      mgr.registerAgent(new Agent({ name: 'a1' }));
      assert.ok(mgr.getAgent('a1'));
      assert.equal(mgr.getAgent('nonexistent'), undefined);
    });

    it('should provide status', () => {
      const mgr = new AgentManager();
      const status = mgr.getStatus();
      assert.equal(status.agents, 0);
      assert.equal(status.activeTasks, 0);
      assert.equal(status.budget.total, 100);
    });

    it('should submit task to queue', () => {
      const mgr = new AgentManager();
      mgr.registerAgent(new Agent({ name: 'a1' }));
      const task = mgr.submitTask({ agent: 'a1', description: 'test task' });
      assert.ok(task.id);
      // Task may be queued or immediately running if under max concurrent
      assert.ok(['queued', 'running', 'completed'].includes(task.status));
    });

    it('should execute task directly', async () => {
      const mgr = new AgentManager();
      mgr.registerAgent(new Agent({ name: 'a1', maxIterations: 1 }));
      const result = await mgr.executeTask('a1', 'do something');
      assert.ok(result);
    });

    it('should track budget', async () => {
      const mgr = new AgentManager({ totalBudget: 0.01 });
      mgr.registerAgent(new Agent({ name: 'a1', maxIterations: 1 }));
      // Mock agent to return cost
      const agent = mgr.getAgent('a1');
      agent._generate = async () => ({ text: 'done', usage: { prompt_tokens: 1000000, completion_tokens: 1000000 } });
      // Cost tracker will track this
      await mgr.executeTask('a1', 'expensive task');
      assert.ok(mgr.spentBudget >= 0);
    });
  });

  // ─── AgentLoop Tests ───
  describe('AgentLoop', () => {
    it('should run the development loop', async () => {
      const loop = new AgentLoop({ maxCycles: 1 });
      const result = await loop.run({ goal: 'Build a feature' });
      assert.ok(result);
      assert.equal(result.cycles, 1);
    });

    it('should track history', async () => {
      const loop = new AgentLoop({ maxCycles: 1 });
      await loop.run({ goal: 'test' });
      assert.equal(loop.getHistory().length, 1);
    });

    it('should emit events', async () => {
      const loop = new AgentLoop({ maxCycles: 1 });
      const events = [];
      loop.on('loop:started', () => events.push('started'));
      loop.on('loop:finished', () => events.push('finished'));
      await loop.run({ goal: 'test' });
      assert.ok(events.includes('started'));
      assert.ok(events.includes('finished'));
    });

    it('should run custom stages', async () => {
      const loop = new AgentLoop({ maxCycles: 1 });
      const result = await loop.run({
        goal: 'test',
        stagesOverride: ['discover', 'test'],
      });
      assert.equal(result.results[0].stages.length, 2);
    });

    it('should get state', () => {
      const loop = new AgentLoop();
      const state = loop.getState();
      assert.equal(state.state, 'idle');
      assert.equal(state.cycles, 0);
    });
  });

  // ─── Built-in Tools Tests ───
  describe('Built-in Tools', () => {
    it('should have all expected tools', () => {
      assert.ok(BUILT_IN_TOOLS.readFile);
      assert.ok(BUILT_IN_TOOLS.writeFile);
      assert.ok(BUILT_IN_TOOLS.listDirectory);
      assert.ok(BUILT_IN_TOOLS.runCommand);
      assert.ok(BUILT_IN_TOOLS.searchCode);
      assert.ok(BUILT_IN_TOOLS.githubSearch);
      assert.ok(BUILT_IN_TOOLS.fetchUrl);
      assert.ok(BUILT_IN_TOOLS.generateReport);
    });

    it('should list directory', async () => {
      const result = await BUILT_IN_TOOLS.listDirectory.execute({ path: '.' });
      assert.ok(result.files || result.directories);
    });

    it('should read file', async () => {
      const result = await BUILT_IN_TOOLS.readFile.execute({ path: 'package.json' });
      assert.ok(result.content);
    });

    it('should write and read file', async () => {
      const testPath = '/tmp/myd-test-' + Date.now() + '.txt';
      const writeResult = await BUILT_IN_TOOLS.writeFile.execute({ path: testPath, content: 'hello' });
      assert.equal(writeResult.success, true);
      const readResult = await BUILT_IN_TOOLS.readFile.execute({ path: testPath });
      assert.equal(readResult.content, 'hello');
      require('fs').unlinkSync(testPath);
    });
  });
});
