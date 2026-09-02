/**
 * MYD Open Source Vault — GitHub Repository Scanner
 * Fetches live metadata from GitHub API for seed repositories.
 * Handles rate limiting, retries, and produces enriched repository records.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const seedRepositories = require('./seed-repositories');

const GITHUB_API = 'https://api.github.com';
const DATA_DIR = path.join(__dirname, '..', 'data');

// Rate limit awareness
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const headers = GITHUB_TOKEN
  ? { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' }
  : { Accept: 'application/vnd.github.v3+json' };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.get(url, { headers, timeout: 15000 });
      // Respect rate limits
      const remaining = parseInt(res.headers['x-ratelimit-remaining'] || '999', 10);
      if (remaining < 5) {
        const resetAt = parseInt(res.headers['x-ratelimit-reset'] || '0', 10) * 1000;
        const wait = Math.max(resetAt - Date.now() + 1000, 5000);
        console.log(`  ⏳ Rate limit near. Waiting ${Math.round(wait / 1000)}s...`);
        await sleep(wait);
      }
      return res.data;
    } catch (err) {
      if (err.response && err.response.status === 403) {
        const resetAt = parseInt(err.response.headers['x-ratelimit-reset'] || '0', 10) * 1000;
        const wait = Math.max(resetAt - Date.now() + 1000, 10000);
        console.log(`  ⏳ Rate limited. Waiting ${Math.round(wait / 1000)}s...`);
        await sleep(wait);
        continue;
      }
      if (err.response && err.response.status === 404) {
        console.log(`  ⚠️  Not found: ${url}`);
        return null;
      }
      if (i < retries - 1) {
        console.log(`  ⚠️  Retry ${i + 1} for ${url}: ${err.message}`);
        await sleep(2000 * (i + 1));
      } else {
        console.log(`  ❌ Failed: ${url}: ${err.message}`);
        return null;
      }
    }
  }
  return null;
}

async function fetchRepo(owner, name) {
  return fetchWithRetry(`${GITHUB_API}/repos/${owner}/${name}`);
}

async function fetchLanguages(owner, name) {
  return fetchWithRetry(`${GITHUB_API}/repos/${owner}/${name}/languages`);
}

async function fetchLicense(owner, name) {
  const data = await fetchWithRetry(`${GITHUB_API}/repos/${owner}/${name}/license`);
  return data ? data.license : null;
}

async function fetchContributors(owner, name) {
  const data = await fetchWithRetry(`${GITHUB_API}/repos/${owner}/${name}/contributors?per_page=1&anon=true`);
  // We use the Link header count from the first page
  return data;
}

async function fetchTopics(owner, name) {
  // Topics require custom accept header
  const topicHeaders = { ...headers, Accept: 'application/vnd.github.mercy-preview+json' };
  try {
    const res = await axios.get(`${GITHUB_API}/repos/${owner}/${name}/topics`, {
      headers: topicHeaders, timeout: 10000
    });
    return res.data && res.data.names ? res.data.names : [];
  } catch {
    return [];
  }
}

function classifyLicense(licenseSpdx) {
  if (!licenseSpdx) return 'UNKNOWN';
  const l = licenseSpdx.toUpperCase();
  const green = ['MIT', 'BSD-2-CLAUSE', 'BSD-3-CLAUSE', 'ISC', 'APACHE-2.0', 'BSD', '0BSD'];
  const yellow = ['GPL-2.0', 'GPL-3.0', 'LGPL-2.0', 'LGPL-2.1', 'LGPL-3.0', 'GPL-2.0-ONLY', 'GPL-3.0-ONLY', 'LGPL-2.1-ONLY', 'LGPL-3.0-ONLY'];
  const orange = ['AGPL-3.0', 'AGPL-3.0-ONLY', 'SSPL-1.0', 'BUSL-1.1', 'BUSL-1'];

  if (green.includes(l)) return 'GREEN';
  if (yellow.includes(l)) return 'YELLOW';
  if (orange.includes(l)) return 'ORANGE';
  if (l === 'UNLICENSE' || l === 'CC0-1.0' || l === 'CC-BY-4.0' || l === 'CC-BY-SA-4.0') return 'GREEN';
  return 'UNKNOWN';
}

function computeLicenseScore(classification) {
  switch (classification) {
    case 'GREEN': return 15;
    case 'YELLOW': return 10;
    case 'ORANGE': return 5;
    case 'RED': return 0;
    default: return 3;
  }
}

function computeActivityScore(repo) {
  let score = 0;
  const now = new Date();
  const pushed = new Date(repo.pushed_at);
  const daysSinceUpdate = (now - pushed) / (1000 * 60 * 60 * 24);

  if (daysSinceUpdate < 7) score += 3;
  else if (daysSinceUpdate < 30) score += 2.5;
  else if (daysSinceUpdate < 90) score += 2;
  else if (daysSinceUpdate < 180) score += 1;
  else score += 0.5;

  const stars = repo.stargazers_count || 0;
  if (stars > 50000) score += 3;
  else if (stars > 10000) score += 2.5;
  else if (stars > 5000) score += 2;
  else if (stars > 1000) score += 1.5;
  else if (stars > 100) score += 1;
  else score += 0.5;

  const forks = repo.forks_count || 0;
  if (forks > 5000) score += 2;
  else if (forks > 1000) score += 1.5;
  else if (forks > 200) score += 1;
  else score += 0.5;

  const openIssues = repo.open_issues_count || 0;
  if (openIssues > 0 && openIssues < 500) score += 1;
  else if (openIssues === 0) score += 0.5;

  // Clamp to 10
  return Math.min(Math.round(score * 10) / 10, 10);
}

function computeQualityScore(repo) {
  let score = 0;
  if (repo.description) score += 1.5;
  if (repo.homepage) score += 1;
  if (repo.topics && repo.topics.length > 0) score += 1;
  if (repo.has_wiki) score += 1;
  if (repo.has_pages) score += 1;
  if (repo.default_branch === 'main' || repo.default_branch === 'master') score += 1;
  if (repo.has_issues) score += 1;
  if (repo.has_projects) score += 1;
  if (repo.fork === false) score += 1.5;
  return Math.min(Math.round(score * 10) / 10, 10);
}

function computeCommercialScore(seed, repoData, licenseClass) {
  let score = 0;

  // License (max 15)
  score += computeLicenseScore(licenseClass);

  // Commercial potential (max 20) — based on type of software
  const commercialTypes = ['erp', 'crm', 'commerce', 'ecommerce', 'saas', 'cms', 'wordpress', 'forms', 'automation'];
  const purpose = (seed.purpose || '').toLowerCase() + ' ' + (seed.useCase || '').toLowerCase();
  const targets = (seed.targets || []).join(' ').toLowerCase();
  const allText = purpose + ' ' + targets;

  if (commercialTypes.some(t => allText.includes(t))) score += 18;
  else if (allText.includes('agent') || allText.includes('ai')) score += 15;
  else if (allText.includes('iot') || allText.includes('farm') || allText.includes('game')) score += 12;
  else score += 8;

  // Market demand (max 15) — based on stars as proxy
  const stars = repoData ? (repoData.stargazers_count || 0) : 0;
  if (stars > 50000) score += 15;
  else if (stars > 20000) score += 13;
  else if (stars > 10000) score += 11;
  else if (stars > 5000) score += 9;
  else if (stars > 1000) score += 7;
  else score += 4;

  // Project quality (max 10)
  score += computeQualityScore(repoData || {});

  // Activity (max 10)
  score += computeActivityScore(repoData || {});

  // Persian opportunity (max 10) — all repos score well for Persian market
  if (allText.includes('erp') || allText.includes('crm') || allText.includes('commerce')) score += 10;
  else if (allText.includes('content') || allText.includes('cms') || allText.includes('form')) score += 9;
  else if (allText.includes('agent') || allText.includes('ai')) score += 8;
  else score += 7;

  // AI opportunity (max 10)
  if (allText.includes('ai') || allText.includes('llm') || allText.includes('agent')) score += 10;
  else if (allText.includes('data') || allText.includes('analytics')) score += 7;
  else score += 5;

  // MYD compatibility (max 10) — based on priority
  if (seed.priority === 'S') score += 10;
  else if (seed.priority === 'A') score += 8;
  else if (seed.priority === 'B') score += 6;
  else score += 3;

  return Math.min(Math.round(score * 10) / 10, 100);
}

async function scanAll() {
  console.log(`🔍 MYD Open Source Vault — Repository Scanner`);
  console.log(`   Scanning ${seedRepositories.length} seed repositories...`);
  console.log(`   GitHub Token: ${GITHUB_TOKEN ? 'configured ✅' : 'not set (rate-limited to 60/hr) ⚠️'}`);
  console.log('');

  const results = [];
  let scanned = 0;

  for (const seed of seedRepositories) {
    scanned++;
    console.log(`[${scanned}/${seedRepositories.length}] Scanning ${seed.owner}/${seed.name}...`);

    const repoData = await fetchRepo(seed.owner, seed.name);
    if (!repoData) {
      console.log(`  ⛔ Skipped (not found or error)`);
      results.push({
        ...seed,
        status: 'NOT_FOUND',
        full_name: `${seed.owner}/${seed.name}`,
        url: `https://github.com/${seed.owner}/${seed.name}`,
        scanDate: new Date().toISOString(),
      });
      continue;
    }

    const [languages, licenseData, topics] = await Promise.all([
      fetchLanguages(seed.owner, seed.name),
      fetchLicense(seed.owner, seed.name),
      fetchTopics(seed.owner, seed.name),
    ]);

    const licenseSpdx = licenseData && licenseData.spdx_id ? licenseData.spdx_id : (repoData.license ? repoData.license.spdx_id : null);
    const licenseClassification = classifyLicense(licenseSpdx);

    const commercialScore = computeCommercialScore(seed, repoData, licenseClassification);

    const record = {
      // Seed metadata
      owner: seed.owner,
      name: seed.name,
      full_name: repoData.full_name || `${seed.owner}/${seed.name}`,
      group: seed.group,
      priority: seed.priority,
      targets: seed.targets,
      purpose: seed.purpose,
      useCase: seed.useCase,
      warning: seed.warning || null,

      // GitHub metadata
      url: repoData.html_url,
      clone_url: repoData.clone_url,
      default_branch: repoData.default_branch,
      description: repoData.description,
      language: repoData.language,
      languages: languages || {},
      topics: topics,

      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      watchers: repoData.watchers_count,
      open_issues: repoData.open_issues_count,

      created_at: repoData.created_at,
      updated_at: repoData.updated_at,
      pushed_at: repoData.pushed_at,

      homepage: repoData.homepage,
      archived: repoData.archived,
      disabled: repoData.disabled,
      fork: repoData.fork,

      has_wiki: repoData.has_wiki,
      has_pages: repoData.has_pages,
      has_issues: repoData.has_issues,
      has_projects: repoData.has_projects,

      // License
      license_name: licenseData ? licenseData.name : (repoData.license ? repoData.license.name : null),
      license_spdx: licenseSpdx,
      license_url: licenseData ? licenseData.html_url : (repoData.license ? repoData.license.url : null),
      license_classification: licenseClassification,

      // Scores
      activity_score: computeActivityScore(repoData),
      quality_score: computeQualityScore(repoData),
      commercial_score: commercialScore,

      // Status
      status: 'SCANNED',
      scanDate: new Date().toISOString(),
    };

    results.push(record);
    console.log(`  ✅ Stars: ${record.stars} | License: ${record.license_spdx || 'N/A'} (${record.license_classification}) | Score: ${record.commercial_score}`);

    // Small delay to be polite to GitHub API
    await sleep(200);
  }

  return results;
}

function generateReports(results) {
  // Sort by commercial score
  const sorted = [...results].filter(r => r.status === 'SCANNED').sort((a, b) => b.commercial_score - a.commercial_score);

  // License report
  const licenseReport = {
    generated: new Date().toISOString(),
    total: results.length,
    scanned: results.filter(r => r.status === 'SCANNED').length,
    byClassification: {
      GREEN: results.filter(r => r.license_classification === 'GREEN'),
      YELLOW: results.filter(r => r.license_classification === 'YELLOW'),
      ORANGE: results.filter(r => r.license_classification === 'ORANGE'),
      RED: results.filter(r => r.license_classification === 'RED'),
      UNKNOWN: results.filter(r => r.license_classification === 'UNKNOWN'),
    }
  };

  // Top repositories markdown
  let topMd = `# MYD Open Source Vault — Top ${sorted.length} Repositories\n\n`;
  topMd += `> Generated: ${new Date().toISOString()}\n`;
  topMd += `> Total scanned: ${results.filter(r => r.status === 'SCANNED').length} repositories\n\n`;
  topMd += `| # | Repository | Stars | License | Classification | Score | Priority | Targets |\n`;
  topMd += `|---|-----------|-------|---------|----------------|-------|----------|----------|\n`;

  sorted.forEach((r, i) => {
    const targets = (r.targets || []).join(', ');
    topMd += `| ${i + 1} | [${r.full_name}](${r.url}) | ${r.stars} | ${r.license_spdx || 'N/A'} | ${r.license_classification} | ${r.commercial_score} | ${r.priority} | ${targets} |\n`;
  });

  // License report markdown
  let licMd = `# MYD Open Source Vault — License Intelligence Report\n\n`;
  licMd += `> Generated: ${new Date().toISOString()}\n\n`;
  licMd += `## Summary\n\n`;
  licMd += `| Classification | Count | Repositories |\n`;
  licMd += `|---------------|-------|-------------|\n`;
  for (const [cls, repos] of Object.entries(licenseReport.byClassification)) {
    const names = repos.map(r => r.full_name).join(', ');
    licMd += `| ${cls} | ${repos.length} | ${names} |\n`;
  }

  // Security report
  let secMd = `# MYD Open Source Vault — Security Report\n\n`;
  secMd += `> Generated: ${new Date().toISOString()}\n\n`;
  secMd += `## Repositories with Warnings\n\n`;
  const warned = results.filter(r => r.warning);
  if (warned.length === 0) {
    secMd += `No warnings flagged.\n`;
  } else {
    warned.forEach(r => {
      secMd += `- **${r.full_name}**: ${r.warning}\n`;
    });
  }
  secMd += `\n## Archived / Disabled Repositories\n\n`;
  const inactive = results.filter(r => r.archived || r.disabled);
  if (inactive.length === 0) {
    secMd += `None.\n`;
  } else {
    inactive.forEach(r => {
      secMd += `- **${r.full_name}**: archived=${r.archived}, disabled=${r.disabled}\n`;
    });
  }

  // Commercial opportunities markdown
  let commMd = `# MYD Open Source Vault — Commercial Opportunities\n\n`;
  commMd += `> Generated: ${new Date().toISOString()}\n\n`;
  commMd += `## Top 20 by Commercial Score\n\n`;
  sorted.slice(0, 20).forEach((r, i) => {
    commMd += `### ${i + 1}. ${r.full_name}\n\n`;
    commMd += `- **Score**: ${r.commercial_score}/100\n`;
    commMd += `- **Stars**: ${r.stars}\n`;
    commMd += `- **License**: ${r.license_spdx || 'N/A'} (${r.license_classification})\n`;
    commMd += `- **Language**: ${r.language}\n`;
    commMd += `- **Purpose**: ${r.purpose}\n`;
    commMd += `- **MYD Targets**: ${(r.targets || []).join(', ')}\n`;
    commMd += `- **Priority**: ${r.priority}\n\n`;
  });

  return { topMd, licMd, secMd, commMd, licenseReport };
}

async function main() {
  const results = await scanAll();

  // Save raw data
  fs.writeFileSync(path.join(DATA_DIR, 'repositories.json'), JSON.stringify(results, null, 2));
  console.log(`\n💾 Saved ${results.length} repository records to data/repositories.json`);

  // Generate and save reports
  const { topMd, licMd, secMd, commMd, licenseReport } = generateReports(results);
  fs.writeFileSync(path.join(DATA_DIR, 'licenses.json'), JSON.stringify(licenseReport, null, 2));
  fs.writeFileSync(path.join(__dirname, '..', 'reports', 'top-100.md'), topMd);
  fs.writeFileSync(path.join(__dirname, '..', 'reports', 'license-report.md'), licMd);
  fs.writeFileSync(path.join(__dirname, '..', 'reports', 'security-report.md'), secMd);
  fs.writeFileSync(path.join(__dirname, '..', 'reports', 'top-commercial.md'), commMd);

  console.log(`📊 Generated reports in reports/`);
  console.log(`   - top-100.md`);
  console.log(`   - license-report.md`);
  console.log(`   - security-report.md`);
  console.log(`   - top-commercial.md`);

  // Summary
  const scanned = results.filter(r => r.status === 'SCANNED');
  console.log(`\n📈 Summary:`);
  console.log(`   Total: ${results.length}`);
  console.log(`   Scanned: ${scanned.length}`);
  console.log(`   GREEN: ${scanned.filter(r => r.license_classification === 'GREEN').length}`);
  console.log(`   YELLOW: ${scanned.filter(r => r.license_classification === 'YELLOW').length}`);
  console.log(`   ORANGE: ${scanned.filter(r => r.license_classification === 'ORANGE').length}`);
  console.log(`   UNKNOWN: ${scanned.filter(r => r.license_classification === 'UNKNOWN').length}`);
  console.log(`   Score ≥ 85 (APPROVED): ${scanned.filter(r => r.commercial_score >= 85).length}`);
  console.log(`   Score 70-84 (RESEARCH): ${scanned.filter(r => r.commercial_score >= 70 && r.commercial_score < 85).length}`);
  console.log(`   Score 50-69 (BACKLOG): ${scanned.filter(r => r.commercial_score >= 50 && r.commercial_score < 70).length}`);
  console.log(`   Score < 50 (REJECT): ${scanned.filter(r => r.commercial_score < 50).length}`);
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
