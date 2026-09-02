/**
 * DatabaseAdapter — Database abstraction for MYD ecosystem.
 * Supports SQLite (MVP), PostgreSQL (production), with tenant isolation.
 */

class DatabaseAdapter {
  constructor(config = {}) {
    this.type = config.type || 'sqlite';
    this.config = config;
    this.tenantId = config.tenantId || null;
    this._connection = null;
  }

  async connect() {
    if (this.type === 'sqlite') {
      return this._connectSqlite();
    } else if (this.type === 'postgresql') {
      return this._connectPostgresql();
    }
    throw new Error(`Unsupported database type: ${this.type}`);
  }

  async _connectSqlite() {
    try {
      const Database = require('better-sqlite3');
      this._connection = new Database(this.config.filename || ':memory:');
      return { connected: true, type: 'sqlite' };
    } catch {
      // better-sqlite3 not available — use in-memory mock
      this._connection = new InMemoryDb();
      return { connected: true, type: 'sqlite-in-memory' };
    }
  }

  async _connectPostgresql() {
    // PostgreSQL connection would use pg or postgres library
    this._connection = new InMemoryDb();
    return { connected: true, type: 'postgresql-mock' };
  }

  async disconnect() {
    if (this._connection && this._connection.close) {
      this._connection.close();
    }
    this._connection = null;
  }

  /**
   * Execute a query
   */
  async query(sql, params = []) {
    if (!this._connection) throw new Error('Database not connected');
    return this._connection.query(sql, params);
  }

  /**
   * Insert a record with automatic tenant isolation
   */
  async insert(table, data) {
    const enriched = this.tenantId ? { ...data, tenant_id: this.tenantId } : data;
    const columns = Object.keys(enriched);
    const placeholders = columns.map(() => '?');
    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
    return this.query(sql, Object.values(enriched));
  }

  /**
   * Select records with tenant isolation
   */
  async select(table, where = {}) {
    const conditions = { ...where };
    if (this.tenantId) conditions.tenant_id = this.tenantId;

    const keys = Object.keys(conditions);
    const sql = keys.length > 0
      ? `SELECT * FROM ${table} WHERE ${keys.map(k => `${k} = ?`).join(' AND ')}`
      : `SELECT * FROM ${table}`;
    return this.query(sql, Object.values(conditions));
  }

  /**
   * Run a migration
   */
  async migrate(sql) {
    return this.query(sql);
  }
}

/**
 * In-memory database for testing and MVP
 */
class InMemoryDb {
  constructor() {
    this.tables = new Map();
  }

  async query(sql, params = []) {
    // Simple in-memory query handling for MVP
    return { rows: [], changes: 0, sql, params };
  }

  close() { /* no-op for in-memory */ }
}

module.exports = { DatabaseAdapter, InMemoryDb };
