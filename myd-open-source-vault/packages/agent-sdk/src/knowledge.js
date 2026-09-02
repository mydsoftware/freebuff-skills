/**
 * KnowledgeBase — Stores and retrieves domain knowledge for agents.
 * Supports text search, tagging, and relevance scoring.
 */

class KnowledgeBase {
  constructor(config = {}) {
    this.entries = new Map();
    this.maxSize = config.maxSize || 500;
  }

  /**
   * Add a knowledge entry.
   * @param {string} id
   * @param {string} content
   * @param {object} metadata - { tags: [], source: '', category: '' }
   */
  add(id, content, metadata = {}) {
    this.entries.set(id, {
      id,
      content,
      tags: metadata.tags || [],
      source: metadata.source || '',
      category: metadata.category || '',
      addedAt: new Date().toISOString(),
      accessCount: 0,
    });

    // Evict oldest if over limit
    if (this.entries.size > this.maxSize) {
      const oldest = Array.from(this.entries.values())
        .sort((a, b) => a.accessCount - b.accessCount)[0];
      if (oldest) this.entries.delete(oldest.id);
    }
  }

  /**
   * Get a knowledge entry by ID.
   */
  get(id) {
    const entry = this.entries.get(id);
    if (entry) entry.accessCount++;
    return entry || null;
  }

  /**
   * Search knowledge entries by relevance.
   * Simple TF-based scoring (no vector embeddings needed).
   */
  search(query, limit = 5) {
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    if (queryWords.length === 0) return [];

    const scored = [];
    for (const [, entry] of this.entries) {
      const contentLower = entry.content.toLowerCase();
      let score = 0;

      for (const word of queryWords) {
        // Count occurrences in content
        const matches = contentLower.split(word).length - 1;
        score += matches;

        // Bonus for tag matches
        if (entry.tags.some(t => t.toLowerCase().includes(word))) {
          score += 3;
        }

        // Bonus for category match
        if (entry.category.toLowerCase().includes(word)) {
          score += 2;
        }
      }

      if (score > 0) {
        entry.accessCount++;
        scored.push({ ...entry, score });
      }
    }

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Search by tag.
   */
  getByTag(tag) {
    return Array.from(this.entries.values())
      .filter(e => e.tags.includes(tag));
  }

  /**
   * Search by category.
   */
  getByCategory(category) {
    return Array.from(this.entries.values())
      .filter(e => e.category === category);
  }

  /**
   * Remove a knowledge entry.
   */
  remove(id) {
    return this.entries.delete(id);
  }

  /**
   * Get all entries.
   */
  list() {
    return Array.from(this.entries.values());
  }

  /**
   * Get stats.
   */
  stats() {
    const entries = Array.from(this.entries.values());
    const categories = {};
    const allTags = new Set();
    entries.forEach(e => {
      categories[e.category || 'uncategorized'] = (categories[e.category || 'uncategorized'] || 0) + 1;
      e.tags.forEach(t => allTags.add(t));
    });

    return {
      total: entries.length,
      categories,
      tags: Array.from(allTags),
      avgAccessCount: entries.length > 0 ? entries.reduce((s, e) => s + e.accessCount, 0) / entries.length : 0,
    };
  }

  /**
   * Export knowledge as JSON.
   */
  export() {
    return Array.from(this.entries.values());
  }

  /**
   * Import knowledge from JSON.
   */
  import(data) {
    for (const entry of data) {
      this.entries.set(entry.id, { ...entry, accessCount: 0 });
    }
  }
}

module.exports = { KnowledgeBase };
