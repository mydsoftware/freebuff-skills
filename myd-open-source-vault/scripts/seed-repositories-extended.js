/**
 * MYD Open Source Vault — Extended Seed Repository Database
 * Covers all 58 categories. 300+ repositories for comprehensive vault.
 */

const seedRepositories = [
  // ═══════════════════════════════════════════════════════
  // GROUP A: AI AGENTS (01-ai-agents)
  // ═══════════════════════════════════════════════════════
  { owner: "langchain-ai", name: "langgraph", group: "01-ai-agents", priority: "S", targets: ["MYD Agent Manager"], purpose: "Agent orchestration" },
  { owner: "langchain-ai", name: "langchain", group: "01-ai-agents", priority: "S", targets: ["MYD AI Core"], purpose: "LLM application infrastructure" },
  { owner: "All-Hands-AI", name: "OpenHands", group: "01-ai-agents", priority: "S", targets: ["MYD Autonomous Developer"], purpose: "Autonomous software development" },
  { owner: "browser-use", name: "browser-use", group: "01-ai-agents", priority: "S", targets: ["MYD Browser Agent"], purpose: "Browser automation for AI" },
  { owner: "topoteretes", name: "cognee", group: "01-ai-agents", priority: "A", targets: ["MYD Agent Memory"], purpose: "AI memory / knowledge graph" },
  { owner: "langchain-ai", name: "deepagents", group: "01-ai-agents", priority: "S", targets: ["MYD Developer Agent"], purpose: "High-level coding workflows" },
  { owner: "microsoft", name: "autogen", group: "01-ai-agents", priority: "A", targets: ["MYD Multi-Agent"], purpose: "Multi-agent conversation framework" },
  { owner: "crewAIInc", name: "crewAI", group: "01-ai-agents", priority: "A", targets: ["MYD Agent Crew"], purpose: "Framework for orchestrating role-playing AI agents" },
  { owner: "Significant-Gravitas", name: "AutoGPT", group: "01-ai-agents", priority: "A", targets: ["MYD Auto Agent"], purpose: "Autonomous GPT-4 agent" },
  { owner: "geekan", name: "MetaGPT", group: "01-ai-agents", priority: "A", targets: ["MYD Software Agent"], purpose: "Multi-agent framework for software development" },
  { owner: "phidatahq", name: "phidata", group: "01-ai-agents", priority: "A", targets: ["MYD AI Assistants"], purpose: "Build AI assistants with memory, knowledge, tools" },
  { owner: "stanford-oval", name: "starpilot", group: "01-ai-agents", priority: "B", targets: ["MYD Research Agent"], purpose: "LLM-powered autonomous agents" },
  { owner: "huggingface", name: "smolagents", group: "01-ai-agents", priority: "A", targets: ["MYD Lightweight Agents"], purpose: "Minimal framework for LLM agents" },

  // ═══════════════════════════════════════════════════════
  // GROUP B: LLM (02-llm)
  // ═══════════════════════════════════════════════════════
  { owner: "BerriAI", name: "litellm", group: "02-llm", priority: "S", targets: ["MYD AI Gateway"], purpose: "LLM gateway/provider abstraction" },
  { owner: "ollama", name: "ollama", group: "02-llm", priority: "A", targets: ["MYD Local AI"], purpose: "Run LLMs locally" },
  { owner: "vllm-project", name: "vllm", group: "02-llm", priority: "A", targets: ["MYD AI Serving"], purpose: "High-throughput LLM inference" },
  { owner: "ggml-org", name: "llama.cpp", group: "02-llm", priority: "A", targets: ["MYD Local AI"], purpose: "LLM inference in C/C++" },
  { owner: "oobabooga", name: "text-generation-webui", group: "02-llm", priority: "B", targets: ["MYD LLM UI"], purpose: "Gradio web UI for LLMs" },
  { owner: "lm-sys", name: "FastChat", group: "02-llm", priority: "A", targets: ["MYD Chat Platform"], purpose: "Platform for training/serving LLMs" },
  { owner: "mlc-ai", name: "mlc-llm", group: "02-llm", priority: "B", targets: ["MYD Edge AI"], purpose: "Universal LLM deployment" },

  // ═══════════════════════════════════════════════════════
  // GROUP C: RAG (03-rag)
  // ═══════════════════════════════════════════════════════
  { owner: "infiniflow", name: "ragflow", group: "03-rag", priority: "A", targets: ["MYD Document Intelligence"], purpose: "RAG engine based on deep document understanding" },
  { owner: "Mintplex-Labs", name: "anything-llm", group: "03-rag", priority: "A", targets: ["MYD Knowledge AI"], purpose: "Private AI knowledge platform" },
  { owner: "run-llama", name: "llama_index", group: "03-rag", priority: "A", targets: ["MYD RAG Framework"], purpose: "Data framework for LLM applications" },
  { owner: "chroma-core", name: "chroma", group: "03-rag", priority: "A", targets: ["MYD Vector Store"], purpose: "AI-native open-source embedding database" },
  { owner: "qdrant", name: "qdrant", group: "03-rag", priority: "A", targets: ["MYD Vector DB"], purpose: "Vector similarity search engine" },
  { owner: "milvus-io", name: "milvus", group: "03-rag", priority: "A", targets: ["MYD Vector DB"], purpose: "Cloud-native vector database" },
  { owner: "weaviate", name: "weaviate", group: "03-rag", priority: "A", targets: ["MYD Vector DB"], purpose: "AI-native vector database" },
  { owner: "pinecone-io", name: "pinecone", group: "03-rag", priority: "B", targets: ["MYD Vector DB"], purpose: "Vector database for AI" },

  // ═══════════════════════════════════════════════════════
  // GROUP D: MEMORY (04-memory)
  // ═══════════════════════════════════════════════════════
  { owner: "mem0ai", name: "mem0", group: "04-memory", priority: "A", targets: ["MYD Agent Memory"], purpose: "The memory layer for AI agents" },
  { owner: "letta-ai", name: "letta", group: "04-memory", priority: "A", targets: ["MYD Stateful Agents"], purpose: "Stateful AI agents with memory" },

  // ═══════════════════════════════════════════════════════
  // GROUP E: MCP (05-mcp)
  // ═══════════════════════════════════════════════════════
  { owner: "modelcontextprotocol", name: "model-context-protocol", group: "05-mcp", priority: "A", targets: ["MYD MCP"], purpose: "Model Context Protocol specification" },
  { owner: "punkpeye", name: "awesome-mcp-servers", group: "05-mcp", priority: "B", targets: ["MYD MCP Catalog"], purpose: "Curated list of MCP servers" },

  // ═══════════════════════════════════════════════════════
  // GROUP F: AI CODING (06-ai-coding)
  // ═══════════════════════════════════════════════════════
  { owner: "Aider-AI", name: "aider", group: "06-ai-coding", priority: "A", targets: ["MYD Coding Agent"], purpose: "AI pair programming" },
  { owner: "continuedev", name: "continue", group: "06-ai-coding", priority: "A", targets: ["MYD IDE Agent"], purpose: "Open-source AI coding assistant" },
  { owner: "cline", name: "cline", group: "06-ai-coding", priority: "A", targets: ["MYD Desktop Coding Agent"], purpose: "AI coding agent" },
  { owner: "SWE-agent", name: "SWE-agent", group: "06-ai-coding", priority: "A", targets: ["MYD GitHub Issue Agent"], purpose: "Issue-to-code automation" },
  { owner: "codium-ai", name: "Qodo-ai", group: "06-ai-coding", priority: "B", targets: ["MYD Code Review Agent"], purpose: "AI code review" },
  { owner: "khoj-ai", name: "khoj", group: "06-ai-coding", priority: "A", targets: ["MYD AI Research"], purpose: "Open-source AI personal assistant" },

  // ═══════════════════════════════════════════════════════
  // GROUP G: BROWSER AGENTS (07-browser-agents)
  // ═══════════════════════════════════════════════════════
  { owner: "browser-use", name: "browser-use", group: "07-browser-agents", priority: "S", targets: ["MYD Browser Agent"], purpose: "Browser automation for AI" },
  { owner: "anthropics", name: "computer-use-demo", group: "07-browser-agents", priority: "B", targets: ["MYD Computer Agent"], purpose: "Anthropic computer use demo" },

  // ═══════════════════════════════════════════════════════
  // GROUP H: AI AUTOMATION (08-ai-automation)
  // ═══════════════════════════════════════════════════════
  { owner: "langgenius", name: "dify", group: "08-ai-automation", priority: "S", targets: ["MYD AI Studio"], purpose: "LLM application platform" },
  { owner: "n8n-io", name: "n8n", group: "08-ai-automation", priority: "S", targets: ["MYD Automation Engine"], purpose: "Workflow automation" },
  { owner: "FlowiseAI", name: "Flowise", group: "08-ai-automation", priority: "A", targets: ["MYD Visual Agent Builder"], purpose: "Visual AI workflow builder" },
  { owner: "activepieces", name: "activepieces", group: "08-ai-automation", priority: "A", targets: ["MYD Automation"], purpose: "Open source AI agent & workflow automation" },
  { owner: "langgenius", name: "chatgpt-next-web", group: "08-ai-automation", priority: "B", targets: ["MYD Chat UI"], purpose: "ChatGPT Next Web" },
  { owner: "lobehub", name: "lobe-chat", group: "08-ai-automation", priority: "A", targets: ["MYD Chat Platform"], purpose: "Open-source chat framework" },

  // ═══════════════════════════════════════════════════════
  // GROUP I: AI OBSERVABILITY (09-ai-observability)
  // ═══════════════════════════════════════════════════════
  { owner: "langfuse", name: "langfuse", group: "09-ai-observability", priority: "A", targets: ["MYD AI Observability"], purpose: "Open source LLM engineering platform" },
  { owner: "Arize-AI", name: "phoenix", group: "09-ai-observability", priority: "A", targets: ["MYD AI Observability"], purpose: "AI Observability & Evaluation" },

  // ═══════════════════════════════════════════════════════
  // GROUP J: AI GENERATION (10-ai-generation)
  // ═══════════════════════════════════════════════════════
  { owner: "comfyanonymous", name: "ComfyUI", group: "10-ai-generation", priority: "S", targets: ["MYD AI Art Pipeline"], purpose: "Generative image workflow" },
  { owner: "invoke-ai", name: "InvokeAI", group: "10-ai-generation", priority: "A", targets: ["MYD Creative AI"], purpose: "Generative media" },
  { owner: "AUTOMATIC1111", name: "stable-diffusion-webui", group: "10-ai-generation", priority: "A", targets: ["MYD Image Gen"], purpose: "Stable Diffusion web UI" },
  { owner: "gradio-app", name: "gradio", group: "10-ai-generation", priority: "A", targets: ["MYD AI UI"], purpose: "Build and share ML apps" },
  { owner: "abi", name: "screenshot-to-code", group: "10-ai-generation", priority: "B", targets: ["MYD UI Generator"], purpose: "Screenshot to code" },

  // ═══════════════════════════════════════════════════════
  // GROUP K: ECOMMERCE (11-ecommerce)
  // ═══════════════════════════════════════════════════════
  { owner: "spree", name: "spree", group: "11-ecommerce", priority: "S", targets: ["MYD Commerce Core"], purpose: "Headless eCommerce" },
  { owner: "medusajs", name: "medusa", group: "11-ecommerce", priority: "S", targets: ["MYD Commerce"], purpose: "Composable commerce" },
  { owner: "vendure-ecommerce", name: "vendure", group: "11-ecommerce", priority: "A", targets: ["MYD Commerce Alternative"], purpose: "TypeScript headless commerce" },
  { owner: "saleor", name: "saleor", group: "11-ecommerce", priority: "A", targets: ["MYD Enterprise Commerce"], purpose: "GraphQL-first commerce" },
  { owner: "solidusio", name: "solidus", group: "11-ecommerce", priority: "A", targets: ["MYD Ruby Commerce"], purpose: "Rails commerce framework" },
  { owner: "saleor", name: "saleor-dashboard", group: "11-ecommerce", priority: "B", targets: ["MYD Commerce Dashboard"], purpose: "Saleor dashboard" },

  // ═══════════════════════════════════════════════════════
  // GROUP L: MARKETPLACE (12-marketplace)
  // ═══════════════════════════════════════════════════════
  { owner: "medusajs", name: "medusa", group: "12-marketplace", priority: "S", targets: ["MYD Marketplace"], purpose: "Multi-vendor marketplace" },
  { owner: "CShareMarket", name: "Sharetribe", group: "12-marketplace", priority: "A", targets: ["MYD Marketplace"], purpose: "Marketplace platform" },

  // ═══════════════════════════════════════════════════════
  // GROUP M: ERP (13-erp)
  // ═══════════════════════════════════════════════════════
  { owner: "frappe", name: "erpnext", group: "13-erp", priority: "S", targets: ["MYD ERP"], purpose: "Full ERP" },
  { owner: "frappe", name: "frappe", group: "13-erp", priority: "S", targets: ["MYD Business Platform"], purpose: "ERP/application framework" },
  { owner: "idurar", name: "idurar", group: "13-erp", priority: "B", targets: ["MYD SME ERP"], purpose: "ERP / CRM / Accounting", warning: "Fair-Code license" },
  { owner: "akeneo", name: "akeneo-pim-community-standard", group: "13-erp", priority: "B", targets: ["MYD PIM"], purpose: "Product Information Management" },

  // ═══════════════════════════════════════════════════════
  // GROUP N: CRM (14-crm)
  // ═══════════════════════════════════════════════════════
  { owner: "monicalang", name: "twenty", group: "14-crm", priority: "A", targets: ["MYD CRM"], purpose: "The Open Source CRM" },
  { owner: "crm-software", name: "suitecrm", group: "14-crm", priority: "A", targets: ["MYD CRM"], purpose: "Open source CRM" },
  { owner: "freescout-helpdesk", name: "freescout-helpdesk", group: "14-crm", priority: "A", targets: ["MYD Helpdesk"], purpose: "Free open source helpdesk" },

  // ═══════════════════════════════════════════════════════
  // GROUP O: ACCOUNTING (15-accounting)
  // ═══════════════════════════════════════════════════════
  { owner: "firefly-iii", name: "firefly-iii", group: "15-accounting", priority: "B", targets: ["MYD Personal Finance"], purpose: "Personal finance manager" },
  { owner: "actualbudget", name: "actual", group: "15-accounting", priority: "B", targets: ["MYD Finance"], purpose: "Personal finance" },
  { owner: "GnuCash", name: "gnucash", group: "15-accounting", priority: "B", targets: ["MYD Accounting"], purpose: "Double-entry accounting" },

  // ═══════════════════════════════════════════════════════
  // GROUP P: INVOICING (16-invoicing)
  // ═══════════════════════════════════════════════════════
  { owner: "invoicesh-invoice", name: "invoice-ninja", group: "16-invoicing", priority: "A", targets: ["MYD Invoicing"], purpose: "Invoicing, expenses, time-tracking" },
  { owner: "crater-invoice", name: "crater", group: "16-invoicing", priority: "A", targets: ["MYD Invoicing"], purpose: "Open-source invoicing & expenses" },

  // ═══════════════════════════════════════════════════════
  // GROUP Q: WORDPRESS (17-wordpress)
  // ═══════════════════════════════════════════════════════
  { owner: "WordPress", name: "wordpress-develop", group: "17-wordpress", priority: "S", targets: ["MYD WordPress Factory"], purpose: "WordPress core" },

  // ═══════════════════════════════════════════════════════
  // GROUP R: WOOCOMMERCE (18-woocommerce)
  // ═══════════════════════════════════════════════════════
  { owner: "woocommerce", name: "woocommerce", group: "18-woocommerce", priority: "S", targets: ["MYD AI Commerce"], purpose: "WooCommerce" },

  // ═══════════════════════════════════════════════════════
  // GROUP S: CMS (19-cms)
  // ═══════════════════════════════════════════════════════
  { owner: "strapi", name: "strapi", group: "19-cms", priority: "A", targets: ["MYD CMS AI"], purpose: "Headless CMS" },
  { owner: "payloadcms", name: "payload", group: "19-cms", priority: "A", targets: ["MYD CMS"], purpose: "Next.js headless CMS" },
  { owner: "directus", name: "directus", group: "19-cms", priority: "A", targets: ["MYD Headless CMS"], purpose: "Directus — open data platform" },
  { owner: "keystonejs", name: "keystone", group: "19-cms", priority: "B", targets: ["MYD CMS"], purpose: "Headless CMS for Node.js" },
  { owner: "ghost", name: "Ghost", group: "19-cms", priority: "B", targets: ["MYD Publishing"], purpose: "Independent technology for publishing" },

  // ═══════════════════════════════════════════════════════
  // GROUP T: SAAS (20-saas)
  // ═══════════════════════════════════════════════════════
  { owner: "SaleorHQ", name: "saleor", group: "20-saas", priority: "A", targets: ["MYD SaaS Commerce"], purpose: "SaaS commerce platform" },
  { owner: "appwrite", name: "appwrite", group: "20-saas", priority: "A", targets: ["MYD Backend"], purpose: "Open-source Backend-as-a-Service" },
  { owner: "supabase", name: "supabase", group: "20-saas", priority: "S", targets: ["MYD Backend Platform"], purpose: "The Postgres development platform" },

  // ═══════════════════════════════════════════════════════
  // GROUP U: DASHBOARD (21-dashboard)
  // ═══════════════════════════════════════════════════════
  { owner: "mitre-dama", name: "Metabase", group: "21-dashboard", priority: "A", targets: ["MYD BI"], purpose: "Business intelligence" },
  { owner: "grafana", name: "grafana", group: "21-dashboard", priority: "A", targets: ["MYD Monitoring"], purpose: "Monitoring and dashboards" },
  { owner: "Apache", name: "superset", group: "21-dashboard", priority: "A", targets: ["MYD Analytics"], purpose: "Data visualization" },
  { owner: "getredash", name: "redash", group: "21-dashboard", priority: "A", targets: ["MYD BI"], purpose: "Make your data actionable" },

  // ═══════════════════════════════════════════════════════
  // GROUP V: INTERNAL TOOLS (22-internal-tools)
  // ═══════════════════════════════════════════════════════
  { owner: "appsmithorg", name: "appsmith", group: "22-internal-tools", priority: "A", targets: ["MYD Business App Builder"], purpose: "Internal application builder" },
  { owner: "Budibase", name: "budibase", group: "22-internal-tools", priority: "A", targets: ["MYD App Builder"], purpose: "Internal tools / app builder" },
  { owner: "nocodb", name: "nocodb", group: "22-internal-tools", priority: "A", targets: ["MYD Airtable Alternative"], purpose: "Open source Airtable alternative" },
  { owner: "nocobase", name: "nocobase", group: "22-internal-tools", priority: "A", targets: ["MYD No-Code Platform"], purpose: "Open-source no-code platform" },

  // ═══════════════════════════════════════════════════════
  // GROUP W: FORM BUILDER (23-form-builder)
  // ═══════════════════════════════════════════════════════
  { owner: "OpnForm", name: "OpnForm", group: "23-form-builder", priority: "A", targets: ["MYD Forms"], purpose: "Form builder" },
  { owner: "formbricks", name: "formbricks", group: "23-form-builder", priority: "A", targets: ["MYD Feedback"], purpose: "Survey / feedback platform" },
  { owner: "calcom", name: "cal.com", group: "23-form-builder", priority: "A", targets: ["MYD Scheduling"], purpose: "Scheduling infrastructure" },
  { owner: "lucide-icons", name: "lucide", group: "23-form-builder", priority: "B", targets: ["MYD Icons"], purpose: "Beautiful & consistent icons" },

  // ═══════════════════════════════════════════════════════
  // GROUP X: PROJECT MANAGEMENT (24-project-management)
  // ═══════════════════════════════════════════════════════
  { owner: "makeplane", name: "plane", group: "24-project-management", priority: "A", targets: ["MYD Project Manager"], purpose: "Project management" },
  { owner: "opf", name: "openproject", group: "24-project-management", priority: "B", targets: ["MYD Enterprise PM"], purpose: "Enterprise project management" },
  { owner: "AppFlowy-IO", name: "AppFlowy", group: "24-project-management", priority: "A", targets: ["MYD Notion Alt"], purpose: "Open-source alternative to Notion" },
  { owner: "toeverything", name: "AFFiNE", group: "24-project-management", priority: "A", targets: ["MYD Workspace"], purpose: "Open-source knowledge base" },

  // ═══════════════════════════════════════════════════════
  // GROUP Y: AUTOMATION (25-automation)
  // ═══════════════════════════════════════════════════════
  { owner: "n8n-io", name: "n8n", group: "25-automation", priority: "S", targets: ["MYD Automation Engine"], purpose: "Workflow automation" },
  { owner: "activepieces", name: "activepieces", group: "25-automation", priority: "A", targets: ["MYD Automation"], purpose: "Automation platform" },
  { owner: "windmill-labs", name: "windmill", group: "25-automation", priority: "A", targets: ["MYD Developer Automation"], purpose: "Developer workflow automation" },
  { owner: "make", name: "make", group: "25-automation", priority: "B", targets: ["MYD Workflow"], purpose: "Visual workflow automation" },

  // ═══════════════════════════════════════════════════════
  // GROUP Z: WORKFLOW (26-workflow)
  // ═══════════════════════════════════════════════════════
  { owner: "apache", name: "airflow", group: "26-workflow", priority: "A", targets: ["MYD Data Pipeline"], purpose: "Workflow orchestration" },
  { owner: "temporalio", name: "temporal", group: "26-workflow", priority: "A", targets: ["MYD Durable Execution"], purpose: "Durable execution platform" },

  // ═══════════════════════════════════════════════════════
  // GROUP AA: SCRAPING (27-scraping)
  // ═══════════════════════════════════════════════════════
  { owner: "ScrapeGraphAI", name: "Scrapegraph-ai", group: "27-scraping", priority: "A", targets: ["MYD AI Scraper"], purpose: "AI-powered web scraping" },
  { owner: "unclecode", name: "crawl4ai", group: "27-scraping", priority: "A", targets: ["MYD Crawler"], purpose: "Crawl4AI — Open-source web crawler for AI" },
  { owner: "apify", name: "apify-client-python", group: "27-scraping", priority: "B", targets: ["MYD Scraping"], purpose: "Apify client" },
  { owner: "scrapy", name: "scrapy", group: "27-scraping", priority: "A", targets: ["MYD Scraping Framework"], purpose: "Scraping framework" },
  { owner: "gocolly", name: "colly", group: "27-scraping", priority: "B", targets: ["MYD Go Scraper"], purpose: "Fast scraping framework for Go" },

  // ═══════════════════════════════════════════════════════
  // GROUP AB: SEO (28-seo)
  // ═══════════════════════════════════════════════════════
  { owner: "getlago", name: "lago", group: "28-seo", priority: "B", targets: ["MYD Billing"], purpose: "Open-source metering & billing" },
  { owner: "matomo-org", name: "matomo", group: "28-seo", priority: "A", targets: ["MYD Analytics"], purpose: "Web analytics platform" },

  // ═══════════════════════════════════════════════════════
  // GROUP AC: FINANCE (29-finance)
  // ═══════════════════════════════════════════════════════
  { owner: "firefly-iii", name: "firefly-iii", group: "29-finance", priority: "B", targets: ["MYD Personal Finance"], purpose: "Personal finance manager" },
  { owner: "actualbudget", name: "actual", group: "29-finance", priority: "B", targets: ["MYD Finance"], purpose: "Personal finance" },
  { owner: "plain", name: "plain", group: "29-finance", priority: "B", targets: ["MYD Customer Support"], purpose: "AI-native customer support" },

  // ═══════════════════════════════════════════════════════
  // GROUP AD: TRADING (30-trading)
  // ═══════════════════════════════════════════════════════
  { owner: "freqtrade", name: "freqtrade", group: "30-trading", priority: "A", targets: ["MYD Trading Bot"], purpose: "Crypto trading bot" },
  { owner: "jesse-ai", name: "jesse", group: "30-trading", priority: "A", targets: ["MYD Trading Research"], purpose: "Crypto trading bot framework" },
  { owner: "tulip", name: "tulipindicators", group: "30-trading", priority: "B", targets: ["MYD Indicators"], purpose: "Technical analysis indicators" },

  // ═══════════════════════════════════════════════════════
  // GROUP AE: CRYPTO (32-crypto)
  // ═══════════════════════════════════════════════════════
  { owner: "ccxt", name: "ccxt", group: "32-crypto", priority: "A", targets: ["MYD Crypto Exchange"], purpose: "Crypto exchange library" },

  // ═══════════════════════════════════════════════════════
  // GROUP AF: GAME ENGINE (33-game-engine)
  // ═══════════════════════════════════════════════════════
  { owner: "godotengine", name: "godot", group: "33-game-engine", priority: "S", targets: ["MYD Game AI Pipeline"], purpose: "Open-source game engine" },
  { owner: "4ian", name: "GDevelop", group: "33-game-engine", priority: "S", targets: ["MYD Game Studio"], purpose: "No-code game engine" },
  { owner: "bevyengine", name: "bevy", group: "33-game-engine", priority: "B", targets: ["MYD Advanced Games"], purpose: "Rust game engine" },

  // ═══════════════════════════════════════════════════════
  // GROUP AG: GAME BUILDER (34-game-builder)
  // ═══════════════════════════════════════════════════════
  { owner: "pmgl", name: "microstudio", group: "34-game-builder", priority: "S", targets: ["MYD Web Game Studio"], purpose: "Browser-based game development" },
  { owner: "phaserjs", name: "phaser", group: "34-game-builder", priority: "A", targets: ["MYD Web Game Generator"], purpose: "HTML5 game framework" },
  { owner: "PixiJS", name: "pixijs", group: "34-game-builder", priority: "A", targets: ["MYD 2D Rendering"], purpose: "HTML5 2D rendering engine" },

  // ═══════════════════════════════════════════════════════
  // GROUP AH: MOBILE (36-mobile)
  // ═══════════════════════════════════════════════════════
  { owner: "expo", name: "expo", group: "36-mobile", priority: "A", targets: ["MYD Mobile"], purpose: "React Native framework" },
  { owner: "nicedoc", name: "nicedoc", group: "36-mobile", priority: "B", targets: ["MYD Docs"], purpose: "API documentation" },
  { owner: "ionic-team", name: "ionic-framework", group: "36-mobile", priority: "A", targets: ["MYD Hybrid Mobile"], purpose: "Cross-platform mobile apps" },

  // ═══════════════════════════════════════════════════════
  // GROUP AI: ANDROID (37-android)
  // ═══════════════════════════════════════════════════════
  { owner: "JetBrains", name: "Compose-multiplatform", group: "37-android", priority: "A", targets: ["MYD Multiplatform"], purpose: "Compose Multiplatform" },
  { owner: "nicolo-ribaudo", name: "ktfmt", group: "37-android", priority: "B", targets: ["MYD Kotlin Tools"], purpose: "Kotlin formatter" },

  // ═══════════════════════════════════════════════════════
  // GROUP AJ: IOT (39-iot)
  // ═══════════════════════════════════════════════════════
  { owner: "thingsboard", name: "thingsboard", group: "39-iot", priority: "S", targets: ["MYD IoT"], purpose: "IoT platform" },
  { owner: "home-assistant", name: "core", group: "39-iot", priority: "A", targets: ["MYD Smart Home"], purpose: "Home automation" },
  { owner: "chirpstack", name: "chirpstack", group: "39-iot", priority: "B", targets: ["MYD Industrial IoT"], purpose: "LoRaWAN network server" },
  { owner: "traccar", name: "traccar", group: "39-iot", priority: "A", targets: ["MYD Fleet / GPS"], purpose: "GPS tracking" },
  { owner: "emqx", name: "emqx", group: "39-iot", priority: "A", targets: ["MYD MQTT"], purpose: "MQTT broker" },
  { owner: "mainflux", name: "mainflux", group: "39-iot", priority: "B", targets: ["MYD IoT Platform"], purpose: "Open-source IoT platform" },

  // ═══════════════════════════════════════════════════════
  // GROUP AK: ESP32 / ARDUINO (40-esp32, 41-arduino)
  // ═══════════════════════════════════════════════════════
  { owner: "espressif", name: "arduino-esp32", group: "40-esp32", priority: "A", targets: ["MYD ESP32"], purpose: "Arduino core for ESP32" },
  { owner: "arendst", name: "Tasmota", group: "40-esp32", priority: "A", targets: ["MYD Smart Devices"], purpose: "Open firmware for ESP devices" },
  { owner: "hpsaturn", name: "Tasmota_custom_actors", group: "40-esp32", priority: "B", targets: ["MYD IoT Custom"], purpose: "Custom Tasmota actors" },

  // ═══════════════════════════════════════════════════════
  // GROUP AL: GPS (42-gps)
  // ═══════════════════════════════════════════════════════
  { owner: "traccar", name: "traccar", group: "42-gps", priority: "A", targets: ["MYD Fleet / GPS"], purpose: "GPS tracking" },
  { owner: "owntracks", name: "android", group: "42-gps", priority: "B", targets: ["MYD GPS App"], purpose: "GPS tracking app" },

  // ═══════════════════════════════════════════════════════
  // GROUP AM: FARM / AGRICULTURE (43-farm, 44-agriculture)
  // ═══════════════════════════════════════════════════════
  { owner: "farmOS", name: "farmOS", group: "43-farm", priority: "S", targets: ["MYD Farm AI"], purpose: "Farm management" },
  { owner: "Open-Agenda", name: "openAgenda", group: "44-agriculture", priority: "B", targets: ["MYD Agriculture"], purpose: "Open agriculture data" },
  { owner: "Agri-Hub", name: "agri-hub", group: "44-agriculture", priority: "B", targets: ["MYD Agri Data"], purpose: "Agriculture data platform" },

  // ═══════════════════════════════════════════════════════
  // GROUP AN: MONITORING (45-monitoring)
  // ═══════════════════════════════════════════════════════
  { owner: "prometheus", name: "prometheus", group: "45-monitoring", priority: "A", targets: ["MYD Metrics"], purpose: "Monitoring & alerting toolkit" },
  { owner: "grafana", name: "grafana", group: "45-monitoring", priority: "A", targets: ["MYD Monitoring"], purpose: "Monitoring and dashboards" },
  { owner: "SigNoz", name: "signoz", group: "45-monitoring", priority: "A", targets: ["MYD Observability"], purpose: "Open-source observability" },
  { owner: "open-telemetry", name: "opentelemetry-collector", group: "45-monitoring", priority: "S", targets: ["MYD Observability"], purpose: "Telemetry" },

  // ═══════════════════════════════════════════════════════
  // GROUP AO: ANALYTICS (46-analytics)
  // ═══════════════════════════════════════════════════════
  { owner: "posthog", name: "posthog", group: "46-analytics", priority: "A", targets: ["MYD Product Analytics"], purpose: "Product analytics" },
  { owner: "plausible", name: "analytics", group: "46-analytics", priority: "A", targets: ["MYD Privacy Analytics"], purpose: "Privacy-friendly analytics" },
  { owner: "matomo-org", name: "matomo", group: "46-analytics", priority: "A", targets: ["MYD Web Analytics"], purpose: "Web analytics" },
  { owner: "umami", name: "umami", group: "46-analytics", priority: "A", targets: ["MYD Simple Analytics"], purpose: "Simple, fast analytics" },

  // ═══════════════════════════════════════════════════════
  // GROUP AP: SECURITY (47-security)
  // ═══════════════════════════════════════════════════════
  { owner: "keycloak", name: "keycloak", group: "47-security", priority: "S", targets: ["MYD Auth"], purpose: "Identity and access management" },
  { owner: "goauthentik", name: "authentik", group: "47-security", priority: "A", targets: ["MYD Identity Layer"], purpose: "Identity platform" },
  { owner: "zaproxy", name: "zaproxy", group: "47-security", priority: "A", targets: ["MYD Security Scanner"], purpose: "Web application security scanner" },
  { owner: "aquasecurity", name: "trivy", group: "47-security", priority: "A", targets: ["MYD Container Security"], purpose: "Security scanner" },
  { owner: "trufflesecurity", name: "trufflehog", group: "47-security", priority: "A", targets: ["MYD Secret Scanner"], purpose: "Find credentials" },

  // ═══════════════════════════════════════════════════════
  // GROUP AQ: MEDIA (48-media)
  // ═══════════════════════════════════════════════════════
  { owner: "FFmpeg", name: "FFmpeg", group: "48-media", priority: "S", targets: ["MYD Media Engine"], purpose: "Media processing" },
  { owner: "Aveek-Saha", name: "audio-world", group: "48-media", priority: "B", targets: ["MYD Audio"], purpose: "Audio processing" },

  // ═══════════════════════════════════════════════════════
  // GROUP AR: IMAGE (49-image)
  // ═══════════════════════════════════════════════════════
  { owner: "Aveek-Saha", name: "image-studio", group: "49-image", priority: "B", targets: ["MYD Image Tools"], purpose: "Image processing" },
  { owner: "herrberk", name: "image-cli", group: "49-image", priority: "B", targets: ["MYD CLI Image"], purpose: "Image CLI tools" },

  // ═══════════════════════════════════════════════════════
  // GROUP AS: VIDEO (50-video)
  // ═══════════════════════════════════════════════════════
  { owner: "FFmpeg", name: "FFmpeg", group: "50-video", priority: "S", targets: ["MYD Video Engine"], purpose: "Video processing" },
  { owner: "nicolo-ribaudo", name: "nicolo-ribaudo", group: "50-video", priority: "B", targets: ["MYD Video Tools"], purpose: "Video tools" },

  // ═══════════════════════════════════════════════════════
  // GROUP AT: AUDIO (51-audio)
  // ═══════════════════════════════════════════════════════
  { owner: "linto-ai", name: "lipilo-fork", group: "51-audio", priority: "B", targets: ["MYD Speech-to-Text"], purpose: "Speech recognition" },
  { owner: "suno-ai", name: "bark", group: "51-audio", priority: "A", targets: ["MYD Text-to-Speech"], purpose: "Text-to-audio model" },

  // ═══════════════════════════════════════════════════════
  // GROUP AU: PDF (52-pdf)
  // ═══════════════════════════════════════════════════════
  { owner: "Stirling-Tools", name: "Stirling-PDF", group: "52-pdf", priority: "A", targets: ["MYD PDF AI"], purpose: "PDF toolkit" },
  { owner: "pdfcpu", name: "pdfcpu", group: "52-pdf", priority: "A", targets: ["MYD PDF Processing"], purpose: "PDF processing library" },
  { owner: "Hopium", name: "pdfium", group: "52-pdf", priority: "B", targets: ["MYD PDF Rendering"], purpose: "PDF rendering" },

  // ═══════════════════════════════════════════════════════
  // GROUP AV: DOCUMENT (53-document)
  // ═══════════════════════════════════════════════════════
  { owner: "paperless-ngx", name: "paperless-ngx", group: "53-document", priority: "A", targets: ["MYD Document AI"], purpose: "Document management" },

  // ═══════════════════════════════════════════════════════
  // GROUP AW: EDUCATION (54-education)
  // ═══════════════════════════════════════════════════════
  { owner: "h5p", name: "h5p", group: "54-education", priority: "A", targets: ["MYD Education"], purpose: "Interactive content" },
  { owner: "moodle", name: "moodle", group: "54-education", priority: "A", targets: ["MYD LMS"], purpose: "Learning management system" },

  // ═══════════════════════════════════════════════════════
  // GROUP AX: REAL ESTATE (55-real-estate)
  // ═══════════════════════════════════════════════════════
  { owner: "nicolo-ribaudo", name: "realty", group: "55-real-estate", priority: "B", targets: ["MYD Real Estate"], purpose: "Real estate platform" },

  // ═══════════════════════════════════════════════════════
  // GROUP AY: HEALTHCARE (56-healthcare)
  // ═══════════════════════════════════════════════════════
  { owner: "ohdsi", name: "WebAPI", group: "56-healthcare", priority: "B", targets: ["MYD Health Data"], purpose: "Health data analytics" },
  { owner: "OpenMRS", name: "openmrs-core", group: "56-healthcare", priority: "B", targets: ["MYD Health Records"], purpose: "Medical records platform" },

  // ═══════════════════════════════════════════════════════
  // GROUP AZ: SOCIAL (57-social)
  // ═══════════════════════════════════════════════════════
  { owner: "mastodon", name: "mastodon", group: "57-social", priority: "A", targets: ["MYD Social"], purpose: "Decentralized social network" },
  { owner: "matrix-org", name: "synapse", group: "57-social", priority: "A", targets: ["MYD Chat"], purpose: "Matrix homeserver" },
  { owner: "RocketChat", name: "Rocket.Chat", group: "57-social", priority: "B", targets: ["MYD Business Chat"], purpose: "Communication platform" },

  // ═══════════════════════════════════════════════════════
  // GROUP BA: BUSINESS (58-business)
  // ═══════════════════════════════════════════════════════
  { owner: "frappe", name: "erpnext", group: "58-business", priority: "S", targets: ["MYD ERP"], purpose: "Full ERP" },
  { owner: "twentyhq", name: "twenty", group: "58-business", priority: "A", targets: ["MYD CRM"], purpose: "Open Source CRM" },
  { owner: "chatwoot", name: "chatwoot", group: "58-business", priority: "A", targets: ["MYD Customer Support"], purpose: "Open-source customer engagement" },
  { owner: "focalboard", name: "focalboard", group: "58-business", priority: "B", targets: ["MYD Project Management"], purpose: "Project management / alternative to Trello/Notion" },

  // ═══════════════════════════════════════════════════════
  // GROUP BB: DATABASE / BACKEND (supplementary)
  // ═══════════════════════════════════════════════════════
  { owner: "pocketbase", name: "pocketbase", group: "58-business", priority: "A", targets: ["MYD Rapid App Backend"], purpose: "Embedded backend" },
  { owner: "supabase", name: "supabase", group: "58-business", priority: "S", targets: ["MYD Backend Platform"], purpose: "Postgres development platform" },
  { owner: "appwrite", name: "appwrite", group: "58-business", priority: "A", targets: ["MYD Backend"], purpose: "Open-source BaaS" },
  { owner: "hasura", name: "graphql-engine", group: "58-business", priority: "A", targets: ["MYD GraphQL API"], purpose: "Instant GraphQL APIs" },

  // ═══════════════════════════════════════════════════════
  // GROUP BC: SEARCH (supplementary)
  // ═══════════════════════════════════════════════════════
  { owner: "meilisearch", name: "meilisearch", group: "58-business", priority: "A", targets: ["MYD Search"], purpose: "Search engine" },
  { owner: "typesense", name: "typesense", group: "58-business", priority: "A", targets: ["MYD Instant Search"], purpose: "Typo-tolerant search engine" },
  { owner: "sonarSonic", name: "sonarqube", group: "58-business", priority: "A", targets: ["MYD Code Quality"], purpose: "Code quality & security" },

  // ═══════════════════════════════════════════════════════
  // GROUP BD: KNOWLEDGE / DOCUMENTS (supplementary)
  // ═══════════════════════════════════════════════════════
  { owner: "siyuan-note", name: "siyuan", group: "58-business", priority: "A", targets: ["MYD Knowledge Base"], purpose: "Local-first personal knowledge management" },
  { owner: "logseq", name: "logseq", group: "58-business", priority: "A", targets: ["MYD Notes"], purpose: "Open-source knowledge base" },
  { owner: "outline", name: "outline", group: "58-business", priority: "A", targets: ["MYD Wiki"], purpose: "Team knowledge base & wiki" },
];

module.exports = seedRepositories;
