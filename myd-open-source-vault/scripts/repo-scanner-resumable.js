/**
 * MYD Open Source Vault — Resumable Repository Scanner
 * Saves progress after each repo. Can be restarted and continues from last saved point.
 * Handles rate limiting with auto-wait.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const seedRepositories = require('./seed-repositories');

const GITHUB_API = 'https://api.github.com';
const DATA_DIR = path.join(__dirname, '..', 'data');
const PROGRESS_FILE = path.join(DATA_DIR, '.scan-progress.json');
const RESULTS_FILE = path.join(DATA_DIR, 'repositories.json');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const headers = GITHUB_TOKEN
  ? { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' }
  : { Accept: 'application/vnd.github.v3+json' };

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

let rateLimitRemaining = 60;
let rateLimitReset = 0;

function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    }
  } catch {}
  return { completed: [], results: [] };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function saveResults(results) {
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
}

async function fetchRepo(owner, name) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await axios.get(`${GITHUB_API}/repos/${owner}/${name}`, { headers, timeout: 15000 });
      rateLimitRemaining = parseInt(res.headers['x-ratelimit-remaining'] || '60', 10);
      rateLimitReset = parseInt(res.headers['x-ratelimit-reset'] || '0', 10) * 1000;
      return res.data;
    } catch (err) {
      if (err.response && err.response.status === 403) {
        const reset = parseInt(err.response.headers['x-ratelimit-reset'] || '0', 10) * 1000;
        const wait = Math.max(reset - Date.now() + 2000, 10000);
        console.log(`\n  ⏳ Rate limit hit. Waiting ${Math.round(wait / 1000)}s until reset...`);
        await sleep(wait);
        continue;
      }
      if (err.response && err.response.status === 404) return null;
      if (attempt < 2) await sleep(2000);
      else return null;
    }
  }
  return null;
}

function classifyLicense(spdx) {
  if (!spdx) return 'UNKNOWN';
  const l = spdx.toUpperCase();
  const green = ['MIT','BSD-2-CLAUSE','BSD-3-CLAUSE','ISC','APACHE-2.0','BSD','0BSD','UNLICENSE','CC0-1.0','CC-BY-4.0','CC-BY-SA-4.0'];
  const yellow = ['GPL-2.0','GPL-3.0','LGPL-2.0','LGPL-2.1','LGPL-3.0','GPL-2.0-ONLY','GPL-3.0-ONLY','LGPL-2.1-ONLY','LGPL-3.0-ONLY'];
  const orange = ['AGPL-3.0','AGPL-3.0-ONLY','SSPL-1.0','BUSL-1.1','BUSL-1'];
  if (green.includes(l)) return 'GREEN';
  if (yellow.includes(l)) return 'YELLOW';
  if (orange.includes(l)) return 'ORANGE';
  return 'UNKNOWN';
}

function computeScores(seed, repo) {
  if (!repo) return { activity: 0, quality: 0, commercial: 0 };

  const now = new Date();
  const daysSince = (now - new Date(repo.pushed_at)) / 86400000;
  const stars = repo.stargazers_count || 0;
  const forks = repo.forks_count || 0;

  let activity = 0;
  activity += daysSince < 7 ? 3 : daysSince < 30 ? 2.5 : daysSince < 90 ? 2 : daysSince < 180 ? 1 : 0.5;
  activity += stars > 50000 ? 3 : stars > 10000 ? 2.5 : stars > 5000 ? 2 : stars > 1000 ? 1.5 : stars > 100 ? 1 : 0.5;
  activity += forks > 5000 ? 2 : forks > 1000 ? 1.5 : forks > 200 ? 1 : 0.5;
  activity += (repo.open_issues_count > 0 && repo.open_issues_count < 500) ? 1 : 0.5;
  activity = Math.min(Math.round(activity * 10) / 10, 10);

  let quality = 0;
  if (repo.description) quality += 1.5;
  if (repo.homepage) quality += 1;
  if (repo.has_wiki) quality += 1;
  if (repo.has_pages) quality += 1;
  if (repo.default_branch === 'main' || repo.default_branch === 'master') quality += 1;
  if (repo.has_issues) quality += 1;
  if (repo.has_projects) quality += 1;
  if (!repo.fork) quality += 1.5;
  quality = Math.min(Math.round(quality * 10) / 10, 10);

  const licenseSpdx = repo.license ? repo.license.spdx_id : null;
  const cls = classifyLicense(licenseSpdx);
  let commercial = { GREEN: 15, YELLOW: 10, ORANGE: 5, UNKNOWN: 3 }[cls] || 3;

  const allText = `${seed.purpose || ''} ${seed.useCase || ''} ${(seed.targets || []).join(' ')}`.toLowerCase();
  const commTypes = ['erp','crm','commerce','ecommerce','saas','cms','wordpress','forms','automation'];
  commercial += commTypes.some(t => allText.includes(t)) ? 18 : allText.includes('agent') || allText.includes('ai') ? 15 : allText.includes('iot') || allText.includes('farm') || allText.includes('game') ? 12 : 8;
  commercial += stars > 50000 ? 15 : stars > 20000 ? 13 : stars > 10000 ? 11 : stars > 5000 ? 9 : stars > 1000 ? 7 : 4;
  commercial += quality + activity;
  commercial += (allText.includes('erp') || allText.includes('crm') || allText.includes('commerce')) ? 10 : (allText.includes('content') || allText.includes('cms')) ? 9 : 8;
  commercial += (allText.includes('ai') || allText.includes('llm') || allText.includes('agent')) ? 10 : (allText.includes('data') || allText.includes('analytics')) ? 7 : 5;
  commercial += seed.priority === 'S' ? 10 : seed.priority === 'A' ? 8 : 6;

  return { activity, quality, commercial: Math.min(Math.round(commercial * 10) / 10, 100) };
}

async function main() {
  const progress = loadProgress();
  const completed = new Set(progress.completed);
  const results = [...progress.results];
  const remaining = seedRepositories.filter(r => !completed.has(`${r.owner}/${r.name}`));

  console.log(`🔍 MYD Vault Scanner (Resumable)`);
  console.log(`   Total: ${seedRepositories.length} | Done: ${completed.size} | Remaining: ${remaining.length}`);
  console.log(`   Token: ${GITHUB_TOKEN ? '✅' : '⚠️ 60/hr'}`);
  console.log('');

  let count = completed.size;
  for (const seed of remaining) {
    count++;
    const key = `${seed.owner}/${seed.name}`;
    process.stdout.write(`[${count}/${seedRepositories.length}] ${key}... `);

    const repo = await fetchRepo(seed.owner, seed.name);
    if (!repo) {
      console.log(`⛔`);
      results.push({ ...seed, status: 'NOT_FOUND', full_name: key, url: `https://github.com/${key}`, scanDate: new Date().toISOString() });
    } else {
      const licenseSpdx = repo.license ? repo.license.spdx_id : null;
      const cls = classifyLicense(licenseSpdx);
      const scores = computeScores(seed, repo);
      const record = {
        owner: seed.owner, name: seed.name, full_name: repo.full_name, group: seed.group,
        priority: seed.priority, targets: seed.targets, purpose: seed.purpose, useCase: seed.useCase,
        warning: seed.warning || null, url: repo.html_url, clone_url: repo.clone_url,
        default_branch: repo.default_branch, description: repo.description, language: repo.language,
        topics: repo.topics || [], stars: repo.stargazers_count, forks: repo.forks_count,
        watchers: repo.watchers_count, open_issues: repo.open_issues_count,
        created_at: repo.created_at, updated_at: repo.updated_at, pushed_at: repo.pushed_at,
        homepage: repo.homepage, archived: repo.archived, disabled: repo.disabled, fork: repo.fork,
        has_wiki: repo.has_wiki, has_pages: repo.has_pages, has_issues: repo.has_issues, has_projects: repo.has_projects,
        license_name: repo.license ? repo.license.name : null, license_spdx: licenseSpdx,
        license_url: repo.license ? repo.license.url : null, license_classification: cls,
        activity_score: scores.activity, quality_score: scores.quality, commercial_score: scores.commercial,
        status: 'SCANNED', scanDate: new Date().toISOString(),
      };
      results.push(record);
      console.log(`⭐${repo.stargazers_count} | ${licenseSpdx || 'N/A'} (${cls}) | ${scores.commercial}`);
    }

    completed.add(key);
    progress.completed = Array.from(completed);
    progress.results = results;
    saveProgress(progress);
    saveResults(results);

    await sleep(200);
  }

  // Generate final reports
  generateReports(results);
  console.log(`\n✅ Done! ${results.length} repos scanned. Reports saved.`);
}

function generateReports(results) {
  const sorted = results.filter(r => r.status === 'SCANNED').sort((a, b) => b.commercial_score - a.commercial_score);
  saveResults(results);

  const licReport = {
    generated: new Date().toISOString(),
    total: results.length, scanned: sorted.length,
    byClassification: {
      GREEN: sorted.filter(r => r.license_classification === 'GREEN').map(r => ({ name: r.full_name, spdx: r.license_spdx })),
      YELLOW: sorted.filter(r => r.license_classification === 'YELLOW').map(r => ({ name: r.full_name, spdx: r.license_spdx })),
      ORANGE: sorted.filter(r => r.license_classification === 'ORANGE').map(r => ({ name: r.full_name, spdx: r.license_spdx })),
      UNKNOWN: sorted.filter(r => r.license_classification === 'UNKNOWN').map(r => ({ name: r.full_name, spdx: r.license_spdx })),
    }
  };
  fs.writeFileSync(path.join(DATA_DIR, 'licenses.json'), JSON.stringify(licReport, null, 2));

  let topMd = `# MYD Open Source Vault — Repository Rankings\n\n> Generated: ${new Date().toISOString()} | ${sorted.length} repos\n\n`;
  topMd += `| # | Repository | ⭐ Stars | License | Classification | Score | Priority | Targets |\n`;
  topMd += `|---|-----------|---------|---------|----------------|-------|----------|----------|\n`;
  sorted.forEach((r, i) => {
    topMd += `| ${i+1} | [${r.full_name}](${r.url}) | ${r.stars.toLocaleString()} | ${r.license_spdx||'N/A'} | ${r.license_classification} | ${r.commercial_score} | ${r.priority} | ${(r.targets||[]).join(', ')} |\n`;
  });
  fs.writeFileSync(path.join(__dirname, '..', 'reports', 'top-100.md'), topMd);

  let licMd = `# License Intelligence Report\n\n> ${new Date().toISOString()}\n\n`;
  for (const [cls, repos] of Object.entries(licReport.byClassification)) {
    licMd += `## ${cls} (${repos.length})\n\n`;
    repos.forEach(r => licMd += `- **${r.name}** — ${r.spdx||'N/A'}\n`);
    licMd += '\n';
  }
  fs.writeFileSync(path.join(__dirname, '..', 'reports', 'license-report.md'), licMd);

  let secMd = `# Security Report\n\n`;
  const warned = results.filter(r => r.warning);
  warned.forEach(r => secMd += `- **${r.full_name}**: ${r.warning}\n`);
  if (!warned.length) secMd += 'No warnings.\n';
  fs.writeFileSync(path.join(__dirname, '..', 'reports', 'security-report.md'), secMd);

  let commMd = `# Commercial Opportunities\n\n`;
  sorted.slice(0, 20).forEach((r, i) => {
    commMd += `### ${i+1}. ${r.full_name}\n- Score: ${r.commercial_score} | Stars: ${r.stars.toLocaleString()} | License: ${r.license_spdx||'N/A'}\n- Purpose: ${r.purpose}\n- Targets: ${(r.targets||[]).join(', ')}\n\n`;
  });
  fs.writeFileSync(path.join(__dirname, '..', 'reports', 'top-commercial.md'), commMd);
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
