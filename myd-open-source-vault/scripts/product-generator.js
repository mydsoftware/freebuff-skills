/**
 * MYD Open Source Vault — Product Opportunity Engine
 * Generates product opportunities from scanned repository data.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function generateProductOpportunities(repos) {
  const sorted = repos
    .filter(r => r.status === 'SCANNED')
    .sort((a, b) => b.commercial_score - a.commercial_score);

  const opportunities = [];

  // For each repo, generate product ideas based on its targets and purpose
  for (const repo of sorted) {
    const repoOpps = [];

    // Persian market products for every repo
    if (repo.purpose) {
      repoOpps.push({
        repository: repo.full_name,
        name: `MYD ${repo.purpose} — Persian Edition`,
        target_market: 'Iran / Persian-speaking market',
        features: [
          'RTL UI support',
          'Persian typography (Vazirmatn/IranSans)',
          'Jalali calendar integration',
          'Toman currency',
          'Persian documentation',
        ],
        required_changes: ['i18n/fa-IR locale', 'RTL CSS framework', 'Jalali date adapter', 'Toman currency formatter'],
        estimated_complexity: 'MEDIUM',
        monetization: 'SaaS subscription',
        license_model: repo.license_classification,
        priority: repo.priority,
      });
    }

    // Target-specific products
    if (repo.targets) {
      for (const target of repo.targets) {
        repoOpps.push({
          repository: repo.full_name,
          name: target,
          target_market: 'Iran / Global Persian market',
          features: [
            `${repo.purpose}`,
            'Persian language support',
            'AI-powered features',
            'Mobile responsive',
            'API access',
          ],
          required_changes: [
            'MYD Adapter Layer integration',
            'Persian localization',
            'AI Core integration',
            'MYD authentication',
          ],
          estimated_complexity: repo.priority === 'S' ? 'HIGH' : 'MEDIUM',
          monetization: 'Freemium + SaaS',
          license_model: repo.license_classification,
          priority: repo.priority,
        });
      }
    }

    // AI-enhanced product
    if (repo.useCase && (repo.useCase.toLowerCase().includes('agent') || repo.useCase.toLowerCase().includes('ai'))) {
      repoOpps.push({
        repository: repo.full_name,
        name: `MYD AI-Enhanced ${repo.purpose}`,
        target_market: 'AI-first businesses in Iran',
        features: [
          'AI automation',
          'Natural language interface',
          'Smart recommendations',
          'Automated workflows',
          'Persian NLP support',
        ],
        required_changes: ['MYD AI Core integration', 'Persian NLP', 'Agent runtime'],
        estimated_complexity: 'HIGH',
        monetization: 'AI credits + SaaS',
        license_model: repo.license_classification,
        priority: repo.priority,
      });
    }

    opportunities.push(...repoOpps);
  }

  // Specific product pipeline (the 10 first products from spec)
  const pipelineProducts = [
    {
      name: 'MYD AI Agent Manager',
      sources: ['langchain-ai/langgraph', 'All-Hands-AI/OpenHands', 'browser-use/browser-use', 'BerriAI/litellm', 'topoteretes/cognee'],
      target_market: 'Developers, businesses, automation users in Iran',
      features: [
        'Agent orchestration and management',
        'Multi-provider AI gateway',
        'Browser automation agents',
        'Code generation agents',
        'Research agents',
        'Task management and monitoring',
        'Persian language agents',
        'Cost tracking per agent',
        'Memory and RAG integration',
        'Plugin system for custom agents',
      ],
      required_changes: [
        'Adapter pattern for each source',
        'Unified agent API',
        'Persian agent prompts',
        'MYD AI Core integration',
        'Jalali scheduling',
        'Persian UI dashboard',
      ],
      estimated_complexity: 'VERY HIGH',
      monetization: 'Freemium: free tier with limited agents, Pro with unlimited, Business with custom models',
      priority: 'S',
    },
    {
      name: 'MYD AI Game Studio',
      sources: ['4ian/GDevelop', 'pmgl/microstudio', 'godotengine/godot', 'comfyanonymous/ComfyUI'],
      target_market: 'Indie game developers, educators, game studios in Iran',
      features: [
        'Visual game editor',
        'AI game design assistant',
        'AI asset generation',
        'Multi-platform export',
        'Persian game templates',
        'Scene/level editor',
        'Physics engine',
        'Audio tools',
      ],
      required_changes: [
        'Plugin integration for each engine',
        'Persian UI overlay',
        'ComfyUI art pipeline',
        'Persian documentation and tutorials',
      ],
      estimated_complexity: 'VERY HIGH',
      monetization: 'Free editor + Pro templates + AI credits + Asset marketplace',
      priority: 'S',
    },
    {
      name: 'MYD AI WordPress Factory',
      sources: ['WordPress/wordpress-develop', 'woocommerce/woocommerce'],
      target_market: 'Iranian businesses, e-commerce, agencies',
      features: [
        'AI-powered theme generation',
        'Persian-optimized WooCommerce',
        'Smart product descriptions (Persian)',
        'SEO optimization in Persian',
        'Payment gateway integration (Zarinpal, IDPay)',
        'SMS notification (Kavenegar)',
        'Persian invoice generation',
        'AI customer support',
      ],
      required_changes: [
        'MYD WordPress plugins',
        'Persian theme templates',
        'Iranian payment gateways',
        'Iranian SMS providers',
        'Jalali date handling',
        'Persian shipping labels',
      ],
      estimated_complexity: 'HIGH',
      monetization: 'Plugin marketplace + Pro themes + Managed hosting + AI credits',
      priority: 'S',
    },
    {
      name: 'MYD AI Commerce',
      sources: ['spree/spree', 'medusajs/medusa', 'woocommerce/woocommerce'],
      target_market: 'Iranian e-commerce businesses, marketplaces',
      features: [
        'Multi-vendor marketplace',
        'AI product descriptions',
        'AI SEO optimization',
        'Persian checkout flow',
        'Multiple payment gateways',
        'Inventory management',
        'Order tracking',
        'AI recommendation engine',
      ],
      required_changes: [
        'Headless commerce adapter',
        'Persian storefront theme',
        'Iranian payment integrations',
        'Iranian shipping integrations',
        'Jalali order history',
      ],
      estimated_complexity: 'VERY HIGH',
      monetization: 'Commission on transactions + SaaS + Plugins',
      priority: 'S',
    },
    {
      name: 'MYD ERP',
      sources: ['frappe/erpnext', 'frappe/frappe'],
      target_market: 'Iranian SMEs, factories, trading companies',
      features: [
        'Full ERP: Accounting, CRM, Inventory, HR',
        'Persian accounting standards',
        'Jalali fiscal year',
        'Toman currency',
        'Iranian tax rules',
        'Persian reports and invoices',
        'SMS notifications',
        'Persian payroll',
      ],
      required_changes: [
        'Frappe adapter for Persian accounting',
        'Jalali date framework',
        'Toman currency module',
        'Iranian tax engine',
        'Persian invoice templates',
        'SMS integration',
      ],
      estimated_complexity: 'VERY HIGH',
      monetization: 'SaaS per-user pricing + Self-hosted license + Support',
      priority: 'S',
    },
    {
      name: 'MYD CRM',
      sources: ['frappe/erpnext', 'frappe/frappe'],
      target_market: 'Iranian sales teams, businesses, agencies',
      features: [
        'Lead management with AI scoring',
        'Persian communication templates',
        'SMS/WhatsApp integration',
        'Jalali calendar for follow-ups',
        'Pipeline visualization',
        'AI sales predictions',
        'Persian reports',
      ],
      required_changes: [
        'Standalone CRM module extraction',
        'Persian communication layer',
        'Iranian SMS integration',
        'Jalali scheduling',
        'AI lead scoring',
      ],
      estimated_complexity: 'HIGH',
      monetization: 'Per-user SaaS + AI credits',
      priority: 'A',
    },
    {
      name: 'MYD Forms',
      sources: ['OpnForm/OpnForm', 'appsmithorg/appsmith', 'Budibase/budibase'],
      target_market: 'Iranian businesses, schools, government, events',
      features: [
        'AI form generation from Persian prompts',
        'Drag & Drop builder',
        'Conditional logic',
        'Persian form templates',
        'File upload with Persian validation',
        'Payment integration for registration fees',
        'Webhook/API access',
        'Persian reports and analytics',
      ],
      required_changes: [
        'Persian form templates',
        'Iranian payment gateway for forms',
        'Jalali date fields',
        'Persian field validation',
        'AI form generator in Persian',
      ],
      estimated_complexity: 'MEDIUM',
      monetization: 'Free tier + Pro submissions + Enterprise',
      priority: 'A',
    },
    {
      name: 'MYD Farm AI / SheepMonitor',
      sources: ['farmOS/farmOS', 'thingsboard/thingsboard'],
      target_market: 'Iranian farmers, livestock managers, agriculture businesses',
      features: [
        'Animal tracking and management',
        'IoT weight sensors integration',
        'AI growth prediction',
        'Dynamic feed ration calculator',
        'Health monitoring',
        'Jalali date tracking',
        'Persian reports',
        'Mobile app for field use',
      ],
      required_changes: [
        'Livestock-specific modules',
        'IoT sensor adapters',
        'Persian agriculture terminology',
        'Jalali animal records',
        'AI prediction models',
      ],
      estimated_complexity: 'HIGH',
      monetization: 'Hardware + SaaS + Support',
      priority: 'A',
    },
    {
      name: 'MYD IoT',
      sources: ['thingsboard/thingsboard', 'home-assistant/core', 'chirpstack/chirpstack'],
      target_market: 'Iranian smart home, industrial IoT, agriculture',
      features: [
        'Device management dashboard',
        'Real-time telemetry',
        'Rule engine for automation',
        'MQTT/HTTP/LoRaWAN support',
        'Alert system',
        'Persian dashboard',
        'Mobile app',
      ],
      required_changes: [
        'Persian dashboard UI',
        'Iranian device marketplace',
        'Persian documentation',
        'Local MQTT broker config',
      ],
      estimated_complexity: 'HIGH',
      monetization: 'Hardware partnerships + SaaS + Enterprise',
      priority: 'A',
    },
    {
      name: 'MYD Document AI',
      sources: ['Stirling-Tools/Stirling-PDF', 'paperless-ngx/paperless-ngx', 'infiniflow/ragflow', 'Mintplex-Labs/anything-llm'],
      target_market: 'Iranian businesses, legal firms, government, education',
      features: [
        'Persian PDF processing',
        'Document OCR (Persian/Arabic)',
        'AI document classification',
        'RAG over Persian documents',
        'Smart search in Persian',
        'Document summarization',
        'Template generation',
      ],
      required_changes: [
        'Persian OCR models',
        'Jalali metadata',
        'Persian document templates',
        'RTL PDF generation',
        'Persian RAG pipeline',
      ],
      estimated_complexity: 'HIGH',
      monetization: 'SaaS per-document + Enterprise self-hosted',
      priority: 'A',
    },
  ];

  // Merge pipeline products with per-repo opportunities
  const allOpportunities = [...pipelineProducts, ...opportunities];

  return allOpportunities;
}

function generateOpportunityReport(opportunities) {
  let md = `# MYD Open Source Vault — Product Opportunities\n\n`;
  md += `> Generated: ${new Date().toISOString()}\n`;
  md += `> Total opportunities: ${opportunities.length}\n\n`;

  // Pipeline products section
  md += `## 🏭 Product Pipeline (First 10 Core Products)\n\n`;
  const pipeline = opportunities.filter(o => o.sources);
  pipeline.forEach((p, i) => {
    md += `### ${String(i + 1).padStart(2, '0')}. ${p.name}\n\n`;
    md += `- **Priority**: ${p.priority}\n`;
    md += `- **Complexity**: ${p.estimated_complexity}\n`;
    md += `- **Market**: ${p.target_market}\n`;
    md += `- **Monetization**: ${p.monetization}\n`;
    md += `- **Sources**: ${p.sources.join(', ')}\n\n`;
    md += `**Features:**\n`;
    p.features.forEach(f => md += `- ${f}\n`);
    md += `\n**Required Changes:**\n`;
    p.required_changes.forEach(c => md += `- ${c}\n`);
    md += `\n---\n\n`;
  });

  // Per-repo opportunities
  md += `## 📦 Repository Product Opportunities\n\n`;
  const byRepo = {};
  for (const opp of opportunities) {
    if (opp.repository && !opp.sources) {
      if (!byRepo[opp.repository]) byRepo[opp.repository] = [];
      byRepo[opp.repository].push(opp);
    }
  }

  for (const [repo, opps] of Object.entries(byRepo)) {
    md += `### ${repo}\n\n`;
    opps.forEach((o, i) => {
      md += `${i + 1}. **${o.name}** — ${o.estimated_complexity} — ${o.license_model}\n`;
    });
    md += `\n`;
  }

  return md;
}

function main() {
  const repoPath = path.join(DATA_DIR, 'repositories.json');
  if (!fs.existsSync(repoPath)) {
    console.error('❌ Run repo-scanner.js first to generate repositories.json');
    process.exit(1);
  }

  const repos = JSON.parse(fs.readFileSync(repoPath, 'utf8'));
  console.log(`📦 Generating product opportunities from ${repos.length} repositories...`);

  const opportunities = generateProductOpportunities(repos);

  // Save opportunities
  fs.writeFileSync(path.join(DATA_DIR, 'opportunities.json'), JSON.stringify(opportunities, null, 2));
  console.log(`💾 Saved ${opportunities.length} opportunities to data/opportunities.json`);

  // Generate report
  const report = generateOpportunityReport(opportunities);
  fs.writeFileSync(path.join(__dirname, '..', 'reports', 'product-opportunities.md'), report);
  console.log(`📊 Generated reports/product-opportunities.md`);

  // Summary
  const pipeline = opportunities.filter(o => o.sources);
  console.log(`\n📈 Summary:`);
  console.log(`   Pipeline products: ${pipeline.length}`);
  console.log(`   Per-repo opportunities: ${opportunities.length - pipeline.length}`);
  console.log(`   S Priority: ${pipeline.filter(p => p.priority === 'S').length}`);
  console.log(`   A Priority: ${pipeline.filter(p => p.priority === 'A').length}`);
}

main();
