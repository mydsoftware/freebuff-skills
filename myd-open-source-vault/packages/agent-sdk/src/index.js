/**
 * @myd/agent-sdk
 * Runtime framework for building, deploying, and managing AI agents.
 *
 * Architecture:
 *   Agent → has Tools, Memory, Knowledge, Model
 *   AgentManager → orchestrates multiple agents
 *   AgentLoop → autonomous development cycle
 */

const { Agent, AgentConfig } = require('./agent');
const { Tool, ToolRegistry, BUILT_IN_TOOLS } = require('./tools');
const { Memory, ShortTermMemory, TaskMemory, ProjectMemory } = require('./memory');
const { AgentManager } = require('./agent-manager');
const { AgentLoop } = require('./agent-loop');
const { KnowledgeBase } = require('./knowledge');

module.exports = {
  Agent, AgentConfig,
  Tool, ToolRegistry, BUILT_IN_TOOLS,
  Memory, ShortTermMemory, TaskMemory, ProjectMemory,
  AgentManager,
  AgentLoop,
  KnowledgeBase,
};
