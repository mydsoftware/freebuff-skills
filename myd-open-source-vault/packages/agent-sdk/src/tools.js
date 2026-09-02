/**
 * Tool & ToolRegistry — Tool system for agents.
 * Agents use tools to interact with external systems.
 */

class Tool {
  /**
   * @param {object} config
   * @param {string} config.name
   * @param {string} config.description
   * @param {object} config.parameters - JSON schema for parameters
   * @param {Function} config.execute - async function(args) => result
   * @param {boolean} config.requiresPermission - if true, needs execute permission
   */
  constructor(config) {
    this.name = config.name;
    this.description = config.description || '';
    this.parameters = config.parameters || {};
    this._execute = config.execute;
    this.requiresPermission = config.requiresPermission ?? false;
  }

  async execute(args = {}) {
    if (!this._execute) throw new Error(`Tool "${this.name}" has no execute function`);
    return this._execute(args);
  }

  toJSON() {
    return {
      name: this.name,
      description: this.description,
      parameters: this.parameters,
      requiresPermission: this.requiresPermission,
    };
  }
}

class ToolRegistry {
  constructor() {
    this.tools = new Map();
  }

  register(tool) {
    if (!(tool instanceof Tool)) throw new Error('Must register a Tool instance');
    this.tools.set(tool.name, tool);
    return this;
  }

  get(name) {
    return this.tools.get(name);
  }

  list() {
    return Array.from(this.tools.values());
  }

  has(name) {
    return this.tools.has(name);
  }

  remove(name) {
    return this.tools.delete(name);
  }

  /**
   * Register multiple tools from an array of configs.
   */
  registerAll(toolConfigs) {
    for (const config of toolConfigs) {
      this.register(config instanceof Tool ? config : new Tool(config));
    }
    return this;
  }
}

// ─── Built-in Tools ───

const BUILT_IN_TOOLS = {
  readFile: new Tool({
    name: 'read_file',
    description: 'Read contents of a file',
    parameters: { path: { type: 'string', required: true } },
    execute: async ({ path }) => {
      const fs = require('fs');
      try {
        return { content: fs.readFileSync(path, 'utf8'), path };
      } catch (err) {
        return { error: err.message, path };
      }
    },
  }),

  writeFile: new Tool({
    name: 'write_file',
    description: 'Write content to a file',
    parameters: { path: { type: 'string', required: true }, content: { type: 'string', required: true } },
    requiresPermission: true,
    execute: async ({ path, content }) => {
      const fs = require('fs');
      const dir = require('path').dirname(path);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path, content, 'utf8');
      return { success: true, path, bytes: content.length };
    },
  }),

  listDirectory: new Tool({
    name: 'list_directory',
    description: 'List files and directories',
    parameters: { path: { type: 'string', required: false } },
    execute: async ({ path = '.' }) => {
      const fs = require('fs');
      try {
        const items = fs.readdirSync(path, { withFileTypes: true });
        return {
          files: items.filter(i => i.isFile()).map(i => i.name),
          directories: items.filter(i => i.isDirectory()).map(i => i.name),
        };
      } catch (err) {
        return { error: err.message };
      }
    },
  }),

  runCommand: new Tool({
    name: 'run_command',
    description: 'Run a shell command',
    parameters: { command: { type: 'string', required: true }, cwd: { type: 'string' } },
    requiresPermission: true,
    execute: async ({ command, cwd = '.' }) => {
      const { execSync } = require('child_process');
      try {
        const output = execSync(command, { cwd, timeout: 30000, encoding: 'utf8' });
        return { output, exitCode: 0 };
      } catch (err) {
        return { output: err.stdout || err.message, exitCode: err.status || 1 };
      }
    },
  }),

  searchCode: new Tool({
    name: 'search_code',
    description: 'Search for patterns in code files',
    parameters: { pattern: { type: 'string', required: true }, path: { type: 'string' } },
    execute: async ({ pattern, path = '.' }) => {
      const { execSync } = require('child_process');
      try {
        const output = execSync(`grep -r "${pattern}" ${path} --include="*.js" --include="*.ts" --include="*.py" --include="*.json" -l 2>/dev/null || true`, { encoding: 'utf8' });
        return { files: output.trim().split('\n').filter(Boolean) };
      } catch {
        return { files: [] };
      }
    },
  }),

  githubSearch: new Tool({
    name: 'github_search',
    description: 'Search GitHub repositories',
    parameters: { query: { type: 'string', required: true }, limit: { type: 'number' } },
    execute: async ({ query, limit = 10 }) => {
      const axios = require('axios');
      try {
        const res = await axios.get(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=${limit}`, {
          headers: { Accept: 'application/vnd.github.v3+json' },
          timeout: 10000,
        });
        return {
          total: res.data.total_count,
          items: res.data.items.map(r => ({
            full_name: r.full_name,
            description: r.description,
            stars: r.stargazers_count,
            license: r.license ? r.license.spdx_id : null,
            language: r.language,
            url: r.html_url,
          })),
        };
      } catch (err) {
        return { error: err.message };
      }
    },
  }),

  fetchUrl: new Tool({
    name: 'fetch_url',
    description: 'Fetch content from a URL',
    parameters: { url: { type: 'string', required: true } },
    execute: async ({ url }) => {
      const axios = require('axios');
      try {
        const res = await axios.get(url, { timeout: 15000, maxContentLength: 1000000 });
        return { status: res.status, content: typeof res.data === 'string' ? res.data.slice(0, 50000) : JSON.stringify(res.data).slice(0, 50000) };
      } catch (err) {
        return { error: err.message };
      }
    },
  }),

  generateReport: new Tool({
    name: 'generate_report',
    description: 'Generate a markdown report',
    parameters: { title: { type: 'string', required: true }, content: { type: 'string', required: true }, path: { type: 'string' } },
    execute: async ({ title, content, path }) => {
      const fs = require('fs');
      const reportContent = `# ${title}\n\n> Generated: ${new Date().toISOString()}\n\n${content}`;
      if (path) {
        fs.mkdirSync(require('path').dirname(path), { recursive: true });
        fs.writeFileSync(path, reportContent, 'utf8');
        return { success: true, path };
      }
      return { content: reportContent };
    },
  }),
};

module.exports = { Tool, ToolRegistry, BUILT_IN_TOOLS };
