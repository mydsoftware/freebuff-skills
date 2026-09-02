const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { AgentManagerApp } = require('./index');
const ROOT = path.resolve(__dirname, '..', '..', '..');
const { Tool } = require(path.join(ROOT, 'packages', 'agent-sdk', 'src', 'tools.js'));

describe('MYD AI Agent Manager', () => {
  describe('Initialization', () => {
    it('should create app with defaults', async () => {
      const app = new AgentManagerApp();
      await app.initialize();
      const status = app.getStatus();
      assert.equal(status.name, 'MYD Agent Manager');
      assert.equal(status.version, '0.1.0');
      assert.equal(status.locale, 'fa-IR');
    });

    it('should create app with custom config', async () => {
      const app = new AgentManagerApp({ port: 8080, version: '2.0.0' });
      await app.initialize();
      const status = app.getStatus();
      assert.equal(status.version, '2.0.0');
    });
  });

  describe('Templates', () => {
    it('should list all templates', async () => {
      const app = new AgentManagerApp();
      await app.initialize();
      const templates = app.listTemplates();
      assert.ok(templates.length >= 8);
      const names = templates.map(t => t.name);
      assert.ok(names.includes('research'));
      assert.ok(names.includes('developer'));
      assert.ok(names.includes('seo'));
      assert.ok(names.includes('game'));
      assert.ok(names.includes('commerce'));
      assert.ok(names.includes('erp'));
      assert.ok(names.includes('farm'));
      assert.ok(names.includes('general'));
    });

    it('should have tools for each template', async () => {
      const app = new AgentManagerApp();
      await app.initialize();
      const templates = app.listTemplates();
      for (const t of templates) {
        assert.ok(Array.isArray(t.tools), `${t.name} should have tools array`);
        assert.ok(t.tools.length > 0, `${t.name} should have at least one tool`);
      }
    });
  });

  describe('Agent Creation', () => {
    it('should create agent from template', async () => {
      const app = new AgentManagerApp();
      await app.initialize();
      const agent = app.createAgent('research');
      assert.equal(agent.config.name, 'research-agent');
      assert.equal(agent.toolRegistry.list().length, 4); // 4 tools registered
    });

    it('should create agent with overrides', async () => {
      const app = new AgentManagerApp();
      await app.initialize();
      const agent = app.createAgent('developer', { name: 'my-dev-agent', temperature: 0.1 });
      assert.equal(agent.config.name, 'my-dev-agent');
      assert.equal(agent.config.temperature, 0.1);
    });

    it('should throw for unknown template', async () => {
      const app = new AgentManagerApp();
      await app.initialize();
      assert.throws(() => app.createAgent('nonexistent'), /Unknown template/);
    });

    it('should list created agents', async () => {
      const app = new AgentManagerApp();
      await app.initialize();
      app.createAgent('research');
      app.createAgent('developer');
      const status = app.getStatus();
      assert.equal(status.agents.length, 2);
    });
  });

  describe('Task Submission', () => {
    it('should submit and execute task', async () => {
      const app = new AgentManagerApp();
      await app.initialize();
      app.createAgent('general');
      const result = await app.submitTask('general-agent', 'List the files in the current directory');
      assert.ok(result);
      assert.ok(result.result || result.error);
    });
  });

  describe('Custom Tools', () => {
    it('should register custom tool', async () => {
      const app = new AgentManagerApp();
      await app.initialize();
      // Tool already imported at top of file
      app.registerTool(new Tool({
        name: 'custom_tool',
        description: 'A custom tool',
        execute: async (args) => ({ custom: true, ...args }),
      }));
      const status = app.getStatus();
      assert.ok(status.tools.includes('custom_tool'));
    });
  });

  describe('Agent Loop', () => {
    it('should run development loop', async () => {
      const app = new AgentManagerApp();
      await app.initialize();
      const result = await app.runLoop('Build a feature', { stagesOverride: ['discover', 'test'] });
      assert.ok(result);
      assert.equal(result.cycles, 1);
    });
  });

  describe('Status', () => {
    it('should report complete status', async () => {
      const app = new AgentManagerApp();
      await app.initialize();
      app.createAgent('research');
      const status = app.getStatus();
      assert.ok(status.name);
      assert.ok(status.version);
      assert.ok(status.locale);
      assert.ok(Array.isArray(status.agents));
      assert.ok(status.manager);
      assert.ok(Array.isArray(status.tools));
      assert.ok(Array.isArray(status.templates));
    });
  });

  describe('Persian Localization', () => {
    it('should use Persian locale by default', async () => {
      const app = new AgentManagerApp();
      await app.initialize();
      assert.equal(app.i18n.locale, 'fa-IR');
    });

    it('should format dates in Jalali', async () => {
      const app = new AgentManagerApp();
      await app.initialize();
      const jalaliDate = app.i18n.formatJalali(new Date());
      assert.ok(jalaliDate.includes('/'));
    });

    it('should format currency in Toman', async () => {
      const app = new AgentManagerApp();
      await app.initialize();
      const toman = app.i18n.formatToman(1000000);
      assert.ok(toman.includes('تومان'));
    });
  });
});
