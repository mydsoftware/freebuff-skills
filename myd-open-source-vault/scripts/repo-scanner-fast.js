/**
 * MYD Open Source Vault — Fast Repository Scanner
 * Optimized for rate-limited environments: 1 API call per repo.
 * Uses GitHub Search API for batch data when possible.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const seedRepositories = require('./seed-repositories');

const GITHUB_API = 'https://api.github.com';
const DATA_DIR = path.join(__dirname, '..', 'data');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const headers = GITHUB_TOKEN
  ? { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' }
  : { Accept: 'application/vnd.github.v3+json' };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Cache for repo data
let rateLimitRemaining = 60;

async function fetchRepo(owner, name) {
  try {
    const res = await axios.get(`${GITHUB_API}/repos/${owner}/${name}`, {
      headers: { ...headers, Accept: 'application/vnd.github.v3+json' },
      timeout: 15000,
    });
    rateLimitRemaining = parseInt(res.headers['x-ratelimit-remaining'] || '60', 10);
    return res.data;
  } catch (err) {
    if (err.response && err.response.status === 403) {
      const resetAt = parseInt(err.response.headers['x-ratelimit-reset'] || '0', 10) * 1000;
      const wait = Math.max(resetAt - Date.now() + 1000, 5000);
      console.log(`  ⏳ Rate limited. Waiting ${Math.round(wait / 1000)}s...`);
      await sleep(wait);
      // Retry once
      try {
        const res2 = await axios.get(`${GITHUB_API}/repos/${owner}/${name}`, { headers, timeout: 15000 });
        rateLimitRemaining = parseInt(res2.headers['x-ratelimit-remaining'] || '60', 10);
        return res2.data;
      } catch { return null; }
    }
    return null;
  }
}

function classifyLicense(licenseSpdx) {
  if (!licenseSpdx) return 'UNKNOWN';
  const l = licenseSpdx.toUpperCase();
  const green = ['MIT', 'BSD-2-CLAUSE', 'BSD-3-CLAUSE', 'ISC', 'APACHE-2.0', 'BSD', '0BSD', 'UNLICENSE', 'CC0-1.0', 'CC-BY-4.0', 'CC-BY-SA-4.0'];
  const yellow = ['GPL-2.0', 'GPL-3.0', 'LGPL-2.0', 'LGPL-2.1', 'LGPL-3.0', 'GPL-2.0-ONLY', 'GPL-3.0-ONLY', 'LGPL-2.1-ONLY', 'LGPL-3.0-ONLY'];
  const orange = ['AGPL-3.0', 'AGPL-3.0-ONLY', 'SSPL-1.0', 'BUSL-1.1', 'BUSL-1'];

  if (green.includes(l)) return 'GREEN';
  if (yellow.includes(l)) return 'YELLOW';
  if (orange.includes(l)) return 'ORANGE';
  return 'UNKNOWN';
}

function computeLicenseScore(cls) {
  return { GREEN: 15, YELLOW: 10, ORANGE: 5, RED: 0, UNKNOWN: 3 }[cls] || 3;
}

function computeScores(seed, repo) {
  if (!repo) return { activity: 0, quality: 0, commercial: 0 };

  const now = new Date();
  const pushed = new Date(repo.pushed_at);
  const daysSince = (now - pushed) / (1000 * 60 * 60 * 24);

  // Activity (10)
  let activity = 0;
  if (daysSince < 7) activity += 3; else if (daysSince < 30) activity += 2.5; else if (daysSince < 90) activity += 2; else if (daysSince < 180) activity += 1; else activity += 0.5;
  const stars = repo.stargazers_count || 0;
  if (stars > 50000) activity += 3; else if (stars > 10000) activity += 2.5; else if (stars > 5000) activity += 2; else if (stars > 1000) activity += 1.5; else if (stars > 100) activity += 1; else activity += 0.5;
  const forks = repo.forks_count || 0;
  if (forks > 5000) activity += 2; else if (forks > 1000) activity += 1.5; else if (forks > 200) activity += 1; else activity += 0.5;
  activity += (repo.open_issues_count > 0 && repo.open_issues_count < 500) ? 1 : 0.5;
  activity = Math.min(Math.round(activity * 10) / 10, 10);

  // Quality (10)
  let quality = 0;
  if (repo.description) quality += 1.5;
  if (repo.homepage) quality += 1;
  if (repo.topics && repo.topics.length > 0) quality += 1;
  else quality += 0.5; // We don't fetch topics separately
  if (repo.has_wiki) quality += 1;
  if (repo.has_pages) quality += 1;
  if (repo.default_branch === 'main' || repo.default_branch === 'master') quality += 1;
  if (repo.has_issues) quality += 1;
  if (repo.has_projects) quality += 1;
  if (!repo.fork) quality += 1.5;
  quality = Math.min(Math.round(quality * 10) / 10, 10);

  // Commercial (max 100)
  const licenseSpdx = repo.license ? repo.license.spdx_id : null;
  const licenseCls = classifyLicense(licenseSpdx);
  let commercial = computeLicenseScore(licenseCls);

  // Commercial potential (20)
  const purpose = (seed.purpose || '').toLowerCase() + ' ' + (seed.useCase || '').toLowerCase() + ' ' + (seed.targets || []).join(' ').toLowerCase();
  const commTypes = ['erp', 'crm', 'commerce', 'ecommerce', 'saas', 'cms', 'wordpress', 'forms', 'automation'];
  if (commTypes.some(t => purpose.includes(t))) commercial += 18;
  else if (purpose.includes('agent') || purpose.includes('ai')) commercial += 15;
  else if (purpose.includes('iot') || purpose.includes('farm') || purpose.includes('game')) commercial += 12;
  else commercial += 8;

  // Market demand (15)
  if (stars > 50000) commercial += 15;
  else if (stars > 20000) commercial += 13;
  else if (stars > 10000) commercial += 11;
  else if (stars > 5000) commercial += 9;
  else if (stars > 1000) commercial += 7;
  else commercial += 4;

  commercial += quality + activity;

  // Persian opportunity (10)
  if (purpose.includes('erp') || purpose.includes('crm') || purpose.includes('commerce')) commercial += 10;
  else if (purpose.includes('content') || purpose.includes('cms') || purpose.includes('form')) commercial += 9;
  else commercial += 8;

  // AI opportunity (10)
  if (purpose.includes('ai') || purpose.includes('llm') || purpose.includes('agent')) commercial += 10;
  else if (purpose.includes('data') || purpose.includes('analytics')) commercial += 7;
  else commercial += 5;

  // MYD compatibility (10)
  if (seed.priority === 'S') commercial += 10;
  else if (seed.priority === 'A') commercial += 8;
  else commercial += 6;

  commercial = Math.min(Math.round(commercial * 10) / 10, 100);

  return { activity, quality, commercial };
}

async function scanAll() {
  console.log(`🔍 MYD Open Source Vault — Fast Scanner`);
  console.log(`   ${seedRepositories.length} repos | Token: ${GITHUB_TOKEN ? '✅' : '⚠️ 60/hr limit'}`);
  console.log('');

  const results = [];
  let scanned = 0;

  for (const seed of seedRepositories) {
    scanned++;
    process.stdout.write(`[${scanned}/${seedRepositories.length}] ${seed.owner}/${seed.name}... `);

    const repo = await fetchRepo(seed.owner, seed.name);
    if (!repo) {
      console.log(`⛔ SKIP`);
      results.push({ ...seed, status: 'NOT_FOUND', full_name: `${seed.owner}/${seed.name}`, url: `https://github.com/${seed.owner}/${seed.name}`, scanDate: new Date().toISOString() });
      continue;
    }

    const licenseSpdx = repo.license ? repo.license.spdx_id : null;
    const licenseCls = classifyLicense(licenseSpdx);
    const scores = computeScores(seed, repo);

    const record = {
      owner: seed.owner,
      name: seed.name,
      full_name: repo.full_name || `${seed.owner}/${seed.name}`,
      group: seed.group,
      priority: seed.priority,
      targets: seed.targets,
      purpose: seed.purpose,
      useCase: seed.useCase,
      warning: seed.warning || null,
      url: repo.html_url,
      clone_url: repo.clone_url,
      default_branch: repo.default_branch,
      description: repo.description,
      language: repo.language,
      topics: repo.topics || [],
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      watchers: repo.watchers_count,
      open_issues: repo.open_issues_count,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
      homepage: repo.homepage,
      archived: repo.archived,
      disabled: repo.disabled,
      fork: repo.fork,
      has_wiki: repo.has_wiki,
      has_pages: repo.has_pages,
      has_issues: repo.has_issues,
      has_projects: repo.has_projects,
      license_name: repo.license ? repo.license.name : null,
      license_spdx: licenseSpdx,
      license_url: repo.license ? repo.license.url : null,
      license_classification: licenseCls,
      activity_score: scores.activity,
      quality_score: scores.quality,
      commercial_score: scores.commercial,
      status: 'SCANNED',
      scanDate: new Date().toISOString(),
    };

    results.push(record);
    console.log(`⭐${repo.stars} | ${licenseSpdx || 'N/A'} (${licenseCls}) | Score: ${scores.commercial} | Rate: ${rateLimitRemaining}`);

    await sleep(150);
  }

  return results;
}

function generateReports(results) {
  const sorted = results.filter(r => r.status === 'SCANNED').sort((a, b) => b.commercial_score - a.commercial_score);

  // repositories.json
  fs.writeFileSync(path.join(DATA_DIR, 'repositories.json'), JSON.stringify(results, null, 2));

  // licenses.json
  const licenseReport = {
    generated: new Date().toISOString(),
    total: results.length,
    scanned: sorted.length,
    byClassification: {
      GREEN: sorted.filter(r => r.license_classification === 'GREEN').map(r => ({ name: r.full_name, spdx: r.license_spdx })),
      YELLOW: sorted.filter(r => r.license_classification === 'YELLOW').map(r => ({ name: r.full_name, spdx: r.license_spdx })),
      ORANGE: sorted.filter(r => r.license_classification === 'ORANGE').map(r => ({ name: r.full_name, spdx: r.license_spdx })),
      RED: sorted.filter(r => r.license_classification === 'RED').map(r => ({ name: r.full_name, spdx: r.license_spdx })),
      UNKNOWN: sorted.filter(r => r.license_classification === 'UNKNOWN').map(r => ({ name: r.full_name, spdx: r.license_spdx })),
    }
  };
  fs.writeFileSync(path.join(DATA_DIR, 'licenses.json'), JSON.stringify(licenseReport, null, 2));

  // top-100.md
  let topMd = `# MYD Open Source Vault — Repository Rankings\n\n`;
  topMd += `> Generated: ${new Date().toISOString()}\n> Total: ${sorted.length} repositories scanned\n\n`;
  topMd += `| # | Repository | ⭐ Stars | License | Classification | Score | Priority | Targets |\n`;
  topMd += `|---|-----------|---------|---------|----------------|-------|----------|----------|\n`;
  sorted.forEach((r, i) => {
    topMd += `| ${i + 1} | [${r.full_name}](${r.url}) | ${r.stars.toLocaleString()} | ${r.license_spdx || 'N/A'} | ${r.license_classification} | ${r.commercial_score} | ${r.priority} | ${(r.targets || []).join(', ')} |\n`;
  });
  fs.writeFileSync(path.join(__dirname, '..', 'reports', 'top-100.md'), topMd);

  // license-report.md
  let licMd = `# MYD Open Source Vault — License Intelligence Report\n\n`;
  licMd += `> Generated: ${new Date().toISOString()}\n\n`;
  for (const [cls, repos] of Object.entries(licenseReport.byClassification)) {
    licMd += `## ${cls} (${repos.length})\n\n`;
    repos.forEach(r => licMd += `- **${r.name}** — ${r.spdx || 'N/A'}\n`);
    licMd += '\n';
  }
  fs.writeFileSync(path.join(__dirname, '..', 'reports', 'license-report.md'), licMd);

  // security-report.md
  let secMd = `# MYD Open Source Vault — Security Report\n\n`;
  secMd += `> Generated: ${new Date().toISOString()}\n\n`;
  const warned = results.filter(r => r.warning);
  secMd += `## Warnings (${warned.length})\n\n`;
  warned.forEach(r => secMd += `- **${r.full_name}**: ${r.warning}\n`);
  secMd += '\n## Archived/Disabled\n\n';
  const inactive = results.filter(r => r.archived || r.disabled);
  inactive.forEach(r => secMd += `- **${r.full_name}**: archived=${r.archived}, disabled=${r.disabled}\n`);
  if (inactive.length === 0) secMd += 'None.\n';
  fs.writeFileSync(path.join(__dirname, '..', 'reports', 'security-report.md'), secMd);

  // top-commercial.md
  let commMd = `# MYD Open Source Vault — Commercial Opportunities\n\n`;
  commMd += `> Generated: ${new Date().toISOString()}\n\n`;
  sorted.slice(0, 20).forEach((r, i) => {
    commMd += `### ${i + 1}. ${r.full_name}\n\n`;
    commMd += `| Field | Value |\n|-------|-------|\n`;
    commMd += `| Score | ${r.commercial_score}/100 |\n`;
    commMd += `| Stars | ${r.stars.toLocaleString()} |\n`;
    commMd += `| License | ${r.license_spdx || 'N/A'} (${r.license_classification}) |\n`;
    commMd += `| Language | ${r.language} |\n`;
    commMd += `| Purpose | ${r.purpose} |\n`;
    commMd += `| MYD Targets | ${(r.targets || []).join(', ')} |\n`;
    commMd += `| Priority | ${r.priority} |\n\n`;
  });
  fs.writeFileSync(path.join(__dirname, '..', 'reports', 'top-commercial.md'), commMd);

  return { sorted, licenseReport };
}

async function main() {
  const results = await scanAll();
  const { sorted, licenseReport } = generateReports(results);

  console.log(`\n✅ Scanned ${results.length} repositories`);
  console.log(`📊 Reports saved to reports/`);
  console.log(`💾 Data saved to data/`);
  console.log(`\n📈 Breakdown:`);
  console.log(`   GREEN:  ${licenseReport.byClassification.GREEN.length}`);
  console.log(`   YELLOW: ${licenseReport.byClassification.YELLOW.length}`);
  console.log(`   ORANGE: ${licenseReport.byClassification.ORANGE.length}`);
  console.log(`   UNKNOWN: ${licenseReport.byClassification.UNKNOWN.length}`);
  console.log(`   Score ≥ 85: ${sorted.filter(r => r.commercial_score >= 85).length} APPROVED`);
  console.log(`   Score 70-84: ${sorted.filter(r => r.commercial_score >= 70 && r.commercial_score < 85).length} RESEARCH`);
  console.log(`   Score 50-69: ${sorted.filter(r => r.commercial_score >= 50 && r.commercial_score < 70).length} BACKLOG`);
  console.log(`   Score < 50: ${sorted.filter(r => r.commercial_score < 50).length} REJECT`);
  console.log(`\n🏆 Top 5:`);
  sorted.slice(0, 5).forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.full_name} — Score: ${r.commercial_score} — ⭐${r.stars} — ${r.license_spdx || 'N/A'}`);
  });
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
