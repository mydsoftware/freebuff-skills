/**
 * MYD Open Source Vault — Seed Repository Database
 * All repositories from the specification with priority and group metadata.
 */

const seedRepositories = [
  // GROUP A: AI AGENT FOUNDATION
  {
    owner: "langchain-ai", name: "langgraph", group: "A-ai-agents",
    priority: "S", targets: ["MYD Agent Manager", "MYD Game Studio"],
    purpose: "Agent orchestration", useCase: "Stateful agents, graph workflows, persistence, human-in-the-loop, subagents, tool calling, long-running tasks"
  },
  {
    owner: "langchain-ai", name: "langchain", group: "A-ai-agents",
    priority: "S", targets: ["MYD AI Core"],
    purpose: "LLM application infrastructure", useCase: "Tools, retrieval, agents, integrations, model abstraction"
  },
  {
    owner: "langchain-ai", name: "deepagents", group: "A-ai-agents",
    priority: "S", targets: ["MYD Developer Agent"],
    purpose: "High-level coding/agent workflows", useCase: "Planning, subagents, filesystem, long-running coding tasks"
  },
  {
    owner: "All-Hands-AI", name: "OpenHands", group: "A-ai-agents",
    priority: "S", targets: ["MYD Autonomous Developer"],
    purpose: "Autonomous software development", useCase: "Coding Agent, Repository Agent, Issue Agent, Debug Agent"
  },
  {
    owner: "browser-use", name: "browser-use", group: "A-browser-agents",
    priority: "S", targets: ["MYD Browser Agent"],
    purpose: "Browser automation for AI Agents", useCase: "Web Agent, Research, Form automation, Testing, Browser QA"
  },
  {
    owner: "langgenius", name: "dify", group: "A-ai-automation",
    priority: "S", targets: ["MYD AI Studio"],
    purpose: "LLM application platform", useCase: "Workflow, Agents, RAG, Knowledge, Model management"
  },
  {
    owner: "FlowiseAI", name: "Flowise", group: "A-ai-automation",
    priority: "A", targets: ["MYD Visual Agent Builder"],
    purpose: "Visual AI workflow builder", useCase: "Visual Agent Builder, RAG, Tools, Workflow"
  },
  {
    owner: "n8n-io", name: "n8n", group: "A-ai-automation",
    priority: "S", targets: ["MYD Automation Engine"],
    purpose: "Workflow automation", useCase: "Automation, Triggers, Integrations, Webhooks"
  },
  {
    owner: "topoteretes", name: "cognee", group: "A-ai-agents",
    priority: "A", targets: ["MYD Agent Memory"],
    purpose: "AI memory / knowledge graph / RAG", useCase: "Agent Memory, Knowledge, RAG"
  },
  {
    owner: "BerriAI", name: "litellm", group: "A-llm",
    priority: "S", targets: ["MYD AI Gateway"],
    purpose: "LLM gateway/provider abstraction", useCase: "Provider Router, Model Router, Fallback, Usage Tracking"
  },

  // GROUP B: AI CODING / DEVELOPMENT
  {
    owner: "Aider-AI", name: "aider", group: "B-ai-coding",
    priority: "A", targets: ["MYD Coding Agent"],
    purpose: "AI pair programming"
  },
  {
    owner: "continuedev", name: "continue", group: "B-ai-coding",
    priority: "A", targets: ["MYD IDE Agent"],
    purpose: "Open-source AI coding assistant"
  },
  {
    owner: "cline", name: "cline", group: "B-ai-coding",
    priority: "A", targets: ["MYD Desktop Coding Agent"],
    purpose: "AI coding agent"
  },
  {
    owner: "SWE-agent", name: "SWE-agent", group: "B-ai-coding",
    priority: "A", targets: ["MYD GitHub Issue Agent"],
    purpose: "Issue-to-code automation"
  },

  // GROUP C: COMMERCE
  {
    owner: "spree", name: "spree", group: "C-ecommerce",
    priority: "S", targets: ["MYD Commerce Core"],
    purpose: "Headless eCommerce", useCase: "REST API, TypeScript SDK, Next.js storefront, Multi-region, B2B, Marketplace"
  },
  {
    owner: "medusajs", name: "medusa", group: "C-ecommerce",
    priority: "S", targets: ["MYD Commerce"],
    purpose: "Composable commerce"
  },
  {
    owner: "vendure-ecommerce", name: "vendure", group: "C-ecommerce",
    priority: "A", targets: ["MYD Commerce Alternative"],
    purpose: "TypeScript headless commerce"
  },
  {
    owner: "saleor", name: "saleor", group: "C-ecommerce",
    priority: "A", targets: ["MYD Enterprise Commerce"],
    purpose: "GraphQL-first commerce"
  },

  // GROUP D: ERP / CRM
  {
    owner: "frappe", name: "erpnext", group: "D-erp-crm",
    priority: "S", targets: ["MYD ERP"],
    purpose: "Full ERP", useCase: "Accounting, CRM, Inventory, Sales, Purchase, HR, Manufacturing, Projects"
  },
  {
    owner: "frappe", name: "frappe", group: "D-erp-crm",
    priority: "S", targets: ["MYD Business Platform"],
    purpose: "ERP/application framework"
  },
  {
    owner: "idurar", name: "idurar", group: "D-erp-crm",
    priority: "B", targets: ["MYD SME ERP"],
    purpose: "ERP / CRM / Accounting", warning: "Fair-Code license - commercial rights must be verified"
  },

  // GROUP E: FORMS / INTERNAL TOOLS
  {
    owner: "formbricks", name: "formbricks", group: "E-forms-tools",
    priority: "A", targets: ["MYD Feedback"],
    purpose: "Survey / feedback platform"
  },
  {
    owner: "OpnForm", name: "OpnForm", group: "E-forms-tools",
    priority: "A", targets: ["MYD Forms"],
    purpose: "Form builder", useCase: "Drag & Drop, Conditional Logic, Webhook, API, AI Form Generator"
  },
  {
    owner: "Budibase", name: "budibase", group: "E-forms-tools",
    priority: "A", targets: ["MYD App Builder"],
    purpose: "Internal tools / app builder"
  },
  {
    owner: "appsmithorg", name: "appsmith", group: "E-forms-tools",
    priority: "A", targets: ["MYD Business App Builder"],
    purpose: "Internal application builder"
  },

  // GROUP F: GAME DEVELOPMENT
  {
    owner: "4ian", name: "GDevelop", group: "F-games",
    priority: "S", targets: ["MYD Game Studio"],
    purpose: "Open-source game engine/editor"
  },
  {
    owner: "pmgl", name: "microstudio", group: "F-games",
    priority: "S", targets: ["MYD Web Game Studio"],
    purpose: "Browser-based game development"
  },
  {
    owner: "godotengine", name: "godot", group: "F-games",
    priority: "S", targets: ["MYD Game AI Pipeline"],
    purpose: "Open-source game engine", useCase: "Plugin, Tool, Editor extension, AI integration"
  },
  {
    owner: "phaserjs", name: "phaser", group: "F-games",
    priority: "A", targets: ["MYD Web Game Generator"],
    purpose: "HTML5 game framework"
  },

  // GROUP G: IOT
  {
    owner: "thingsboard", name: "thingsboard", group: "G-iot",
    priority: "S", targets: ["MYD IoT"],
    purpose: "IoT platform"
  },
  {
    owner: "home-assistant", name: "core", group: "G-iot",
    priority: "A", targets: ["MYD Smart Home"],
    purpose: "Home automation", note: "owner: home-assistant/core"
  },
  {
    owner: "chirpstack", name: "chirpstack", group: "G-iot",
    priority: "B", targets: ["MYD Industrial IoT"],
    purpose: "LoRaWAN network server"
  },
  {
    owner: "traccar", name: "traccar", group: "G-iot",
    priority: "A", targets: ["MYD Fleet / GPS"],
    purpose: "GPS tracking"
  },

  // GROUP H: DATA / ANALYTICS
  {
    owner: "metabase", name: "metabase", group: "H-analytics",
    priority: "A", targets: ["MYD BI"],
    purpose: "Business intelligence"
  },
  {
    owner: "apache", name: "superset", group: "H-analytics",
    priority: "A", targets: ["MYD Analytics"],
    purpose: "Data visualization"
  },
  {
    owner: "grafana", name: "grafana", group: "H-analytics",
    priority: "A", targets: ["MYD Monitoring"],
    purpose: "Monitoring and dashboards"
  },

  // GROUP I: DOCUMENT / PDF
  {
    owner: "Stirling-Tools", name: "Stirling-PDF", group: "I-document",
    priority: "A", targets: ["MYD PDF AI"],
    purpose: "PDF toolkit"
  },
  {
    owner: "paperless-ngx", name: "paperless-ngx", group: "I-document",
    priority: "A", targets: ["MYD Document AI"],
    purpose: "Document management"
  },

  // GROUP J: CMS / WORDPRESS
  {
    owner: "WordPress", name: "wordpress-develop", group: "J-cms",
    priority: "S", targets: ["MYD WordPress Factory"],
    purpose: "WordPress core", useCase: "Plugin, Theme, Agent, CLI, AI integration"
  },
  {
    owner: "woocommerce", name: "woocommerce", group: "J-cms",
    priority: "S", targets: ["MYD AI Commerce"],
    purpose: "WooCommerce"
  },

  // GROUP K: PROJECT MANAGEMENT
  {
    owner: "makeplane", name: "plane", group: "K-project-mgmt",
    priority: "A", targets: ["MYD Project Manager"],
    purpose: "Project management"
  },
  {
    owner: "opf", name: "openproject", group: "K-project-mgmt",
    priority: "B", targets: ["MYD Enterprise PM"],
    purpose: "Enterprise project management"
  },

  // GROUP L: COMMUNICATION
  {
    owner: "RocketChat", name: "Rocket.Chat", group: "L-communication",
    priority: "B", targets: ["MYD Business Chat"],
    purpose: "Open-source communication"
  },

  // GROUP M: AUTHENTICATION
  {
    owner: "keycloak", name: "keycloak", group: "M-auth",
    priority: "S", targets: ["MYD Auth"],
    purpose: "Identity and access management"
  },
  {
    owner: "goauthentik", name: "authentik", group: "M-auth",
    priority: "A", targets: ["MYD Identity Layer"],
    purpose: "Identity platform"
  },

  // GROUP N: SEARCH
  {
    owner: "meilisearch", name: "meilisearch", group: "N-search",
    priority: "A", targets: ["MYD Search"],
    purpose: "Search engine"
  },
  {
    owner: "opensearch-project", name: "OpenSearch", group: "N-search",
    priority: "B", targets: ["MYD Enterprise Search"],
    purpose: "Search and analytics"
  },

  // GROUP O: DATABASE / BACKEND
  {
    owner: "pocketbase", name: "pocketbase", group: "O-backend",
    priority: "A", targets: ["MYD Rapid App Backend"],
    purpose: "Embedded backend"
  },
  {
    owner: "supabase", name: "supabase", group: "O-backend",
    priority: "S", targets: ["MYD Backend Platform"],
    purpose: "Open-source backend platform"
  },

  // GROUP P: AUTOMATION
  {
    owner: "activepieces", name: "activepieces", group: "P-automation",
    priority: "A", targets: ["MYD Automation"],
    purpose: "Automation platform"
  },
  {
    owner: "windmill-labs", name: "windmill", group: "P-automation",
    priority: "A", targets: ["MYD Developer Automation"],
    purpose: "Developer workflow automation"
  },

  // GROUP Q: OBSERVABILITY
  {
    owner: "open-telemetry", name: "opentelemetry-collector", group: "Q-observability",
    priority: "S", targets: ["MYD Observability"],
    purpose: "Telemetry"
  },
  {
    owner: "SigNoz", name: "signoz", group: "Q-observability",
    priority: "A", targets: ["MYD Monitoring"],
    purpose: "Open-source observability"
  },

  // GROUP R: FINANCE
  {
    owner: "actualbudget", name: "actual", group: "R-finance",
    priority: "B", targets: ["MYD Finance"],
    purpose: "Personal finance"
  },
  {
    owner: "firefly-iii", name: "firefly-iii", group: "R-finance",
    priority: "B", targets: ["MYD Personal Finance"],
    purpose: "Personal finance manager"
  },

  // GROUP S: AGRICULTURE
  {
    owner: "farmOS", name: "farmOS", group: "S-agriculture",
    priority: "S", targets: ["MYD Farm AI"],
    purpose: "Farm management"
  },

  // GROUP T: AI KNOWLEDGE / DOCUMENTS
  {
    owner: "Mintplex-Labs", name: "anything-llm", group: "T-ai-knowledge",
    priority: "A", targets: ["MYD Knowledge AI"],
    purpose: "Private AI knowledge platform"
  },
  {
    owner: "infiniflow", name: "ragflow", group: "T-ai-knowledge",
    priority: "A", targets: ["MYD Document Intelligence"],
    purpose: "RAG/document intelligence"
  },

  // GROUP U: IMAGE / MEDIA AI
  {
    owner: "comfyanonymous", name: "ComfyUI", group: "U-media-ai",
    priority: "S", targets: ["MYD AI Art Pipeline"],
    purpose: "Generative image workflow"
  },
  {
    owner: "invoke-ai", name: "InvokeAI", group: "U-media-ai",
    priority: "A", targets: ["MYD Creative AI"],
    purpose: "Generative media"
  },

  // GROUP V: VIDEO
  // FFmpeg is a system dependency, not a typical JS/web integration target
  // Skipping FFmpeg as infrastructure — no fork needed

  // GROUP W: WEB / CONTENT
  {
    owner: "TryGhost", name: "Ghost", group: "W-web-content",
    priority: "B", targets: ["MYD Publishing AI"],
    purpose: "Publishing platform"
  },
  {
    owner: "strapi", name: "strapi", group: "W-web-content",
    priority: "A", targets: ["MYD CMS AI"],
    purpose: "Headless CMS"
  },
];

module.exports = seedRepositories;
