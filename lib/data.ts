import { Github, Linkedin, Mail, Phone } from "@/components/ui/brand-icons"
import type {
  ExperienceItem,
  Language,
  NavItem,
  Project,
  ProjectCategory,
  SkillGroup,
  SocialLink,
} from "./types"

/* ==========================================================================
   CONTENT
   --------------------------------------------------------------------------
   Every string the site renders lives in this file. Nothing here is imported
   by the 3D scene, so copy edits can never break the animation.

   METRICS: anything carrying `assumed: true` is a placeholder, not a
   measurement. Search this file for "assumed" to find and replace them all.
   Figures without that flag were taken from the resume or measured from the
   project's own source.
   ========================================================================== */

export const profile = {
  name: "Vishal Naveen Akkala",
  firstName: "Vishal",
  role: "AI/ML Engineer",
  identity: "AI/ML Engineer building production systems on top of messy, large-scale data.",
  headline: "I build AI that survives contact with production.",
  location: "Florida, USA",
  available: "Open to AI/ML and Data Engineering roles",
  summary:
    "AI/ML Engineer with 5+ years building machine learning models, Generative AI applications, and scalable data solutions across financial services, healthcare, and retail. I work the whole path — retrieval and NLP systems, MLOps, model deployment, and large-scale processing with Python, PySpark, PyTorch, Databricks, AWS, and Azure.",
  philosophy:
    "A model is the easy part. The work that decides whether it matters is everything around it: the features it trains on, the latency it answers in, the drift that erodes it, and whether anyone trusts the number it produces.",
  interests: [
    "Retrieval systems that stay grounded under pressure",
    "Evaluation — how you prove an LLM system actually works",
    "The gap between a notebook and something on-call",
  ],
  photo: "/assets/vishal.jpg",
  photoAlt: "Vishal Naveen Akkala",
  stats: [
    { label: "Years in ML & data", value: 5, suffix: "+" },
    { label: "Records processed / month", value: 15, suffix: "M+" },
    { label: "Industries shipped in", value: 3 },
  ],
} as const

export const navItems: NavItem[] = [
  { label: "About", layer: "package" },
  { label: "Skills", layer: "die" },
  { label: "Projects", layer: "interposer" },
  { label: "Experience", layer: "substrate" },
  { label: "Contact", layer: "contacts" },
]

export const contact = {
  email: "vishalakkala203@gmail.com",
  phoneDisplay: "+1 (352) 721-8175",
  phoneTel: "+13527218175",
  github: "https://github.com/KiritoKazugaya",
  linkedin: "https://www.linkedin.com/in/vishal-naveen-aa25101b4",
  resume: "/assets/Vishal-Naveen-Akkala-Resume.pdf",
} as const

export const socials: SocialLink[] = [
  { label: "GitHub", href: contact.github, handle: "KiritoKazugaya", icon: Github },
  { label: "LinkedIn", href: contact.linkedin, handle: "vishal-naveen", icon: Linkedin },
  { label: "Email", href: `mailto:${contact.email}`, handle: contact.email, icon: Mail },
  { label: "Phone", href: `tel:${contact.phoneTel}`, handle: contact.phoneDisplay, icon: Phone },
]

/* -------------------------------------------------------------------------- */
/*  Skills — every entry says where it actually shipped                        */
/* -------------------------------------------------------------------------- */

export const skillGroups: SkillGroup[] = [
  {
    category: "AI/ML",
    label: "AI / ML",
    blurb: "Generative AI, modelling, and NLP that reaches production.",
    skills: [
      { name: "PyTorch", category: "AI/ML", usedIn: "Transformer fine-tuning at Capital One", weight: 3 },
      { name: "Scikit-Learn", category: "AI/ML", usedIn: "Classification & forecasting models", weight: 3 },
      { name: "XGBoost", category: "AI/ML", usedIn: "Churn prediction platform", weight: 3 },
      { name: "LangChain", category: "AI/ML", usedIn: "Enterprise RAG knowledge assistant", weight: 3 },
      { name: "RAG", category: "AI/ML", usedIn: "Internal knowledge discovery at Capital One", weight: 3 },
      { name: "LLMs", category: "AI/ML", usedIn: "Study Tutor · Gemini 2.5 Flash", weight: 3 },
      { name: "Hugging Face", category: "AI/ML", usedIn: "Transformer fine-tuning & NER", weight: 2 },
      { name: "OpenCV", category: "AI/ML", usedIn: "Face detection in the 135-class classifier", weight: 2 },
      { name: "TensorFlow", category: "AI/ML", usedIn: "Deep learning experimentation", weight: 1 },
      { name: "Embeddings", category: "AI/ML", usedIn: "Vector retrieval pipelines", weight: 2 },
      { name: "Prompt Engineering", category: "AI/ML", usedIn: "LLM-as-a-Judge grading in Study Tutor", weight: 2 },
    ],
  },
  {
    category: "Data",
    label: "Data",
    blurb: "Large-scale processing, pipelines, and analytics.",
    skills: [
      { name: "Python", category: "Data", usedIn: "Every project here", weight: 3 },
      { name: "SQL", category: "Data", usedIn: "Feature pipelines & product catalogues", weight: 3 },
      { name: "PySpark", category: "Data", usedIn: "15M+ records/month on Databricks", weight: 3 },
      { name: "Databricks", category: "Data", usedIn: "Feature engineering at scale", weight: 2 },
      { name: "Apache Airflow", category: "Data", usedIn: "Automated training workflows at Accenture", weight: 2 },
      { name: "Pandas", category: "Data", usedIn: "EDA on 10M+ record datasets", weight: 3 },
      { name: "BeautifulSoup", category: "Data", usedIn: "GitHub scraper & vendor price crawler", weight: 2 },
      { name: "Tableau", category: "Data", usedIn: "IRENA global energy dashboards", weight: 2 },
      { name: "Power BI", category: "Data", usedIn: "Model reporting at Accenture", weight: 1 },
    ],
  },
  {
    category: "Backend",
    label: "Backend & MLOps",
    blurb: "Serving, deployment, and the plumbing that keeps models alive.",
    skills: [
      { name: "FastAPI", category: "Backend", usedIn: "RAG inference endpoints", weight: 3 },
      { name: "Flask", category: "Backend", usedIn: "Face classifier inference API", weight: 2 },
      { name: "REST APIs", category: "Backend", usedIn: "AI features inside enterprise apps", weight: 3 },
      { name: "Docker", category: "Backend", usedIn: "Containerised model deployment", weight: 3 },
      { name: "MLflow", category: "Backend", usedIn: "Experiment tracking & model registry", weight: 2 },
      { name: "GitHub Actions", category: "Backend", usedIn: "CI/CD for model releases", weight: 2 },
      { name: "AWS", category: "Backend", usedIn: "SageMaker workloads & hosting", weight: 2 },
      { name: "Azure", category: "Backend", usedIn: "Azure OpenAI integrations", weight: 2 },
      { name: "Node.js", category: "Backend", usedIn: "WhatsApp reminder agent on Render", weight: 2 },
    ],
  },
  {
    category: "Frontend",
    label: "Frontend",
    blurb: "Interfaces that make a model usable by someone who isn't you.",
    skills: [
      { name: "React", category: "Frontend", usedIn: "Face classifier inference UI", weight: 2 },
      { name: "Next.js", category: "Frontend", usedIn: "Ocean's Smoke Shop & this site", weight: 3 },
      { name: "TypeScript", category: "Frontend", usedIn: "Type-safe app development", weight: 2 },
      { name: "Tailwind CSS", category: "Frontend", usedIn: "Design systems across projects", weight: 2 },
      { name: "GSAP", category: "Frontend", usedIn: "The chip sequence you're scrolling", weight: 2 },
      { name: "Three.js", category: "Frontend", usedIn: "The chip sequence you're scrolling", weight: 2 },
    ],
  },
  {
    category: "Tools",
    label: "Databases & Tools",
    blurb: "The stores and tooling behind the work.",
    skills: [
      { name: "PostgreSQL", category: "Tools", usedIn: "Ocean's Smoke Shop catalogue", weight: 3 },
      { name: "MongoDB", category: "Tools", usedIn: "Unstructured document stores", weight: 1 },
      { name: "Pinecone", category: "Tools", usedIn: "Vector store for enterprise RAG", weight: 2 },
      { name: "ChromaDB", category: "Tools", usedIn: "Local vector experiments", weight: 1 },
      { name: "Git", category: "Tools", usedIn: "Everywhere", weight: 3 },
      { name: "Linux", category: "Tools", usedIn: "Dev & deployment environments", weight: 2 },
      { name: "Jupyter", category: "Tools", usedIn: "Research & prototyping", weight: 2 },
      { name: "Vercel", category: "Tools", usedIn: "Ocean's Smoke Shop & this site", weight: 2 },
    ],
  },
]

/* -------------------------------------------------------------------------- */
/*  Projects                                                                   */
/* -------------------------------------------------------------------------- */

type RawProject = Omit<Project, "category" | "languages">

const RAW_PROJECTS: RawProject[] = [
  {
    slug: "enterprise-rag-assistant",
    title: "Enterprise Knowledge Assistant",
    tagline: "Retrieval-augmented answers over scattered internal knowledge.",
    featured: true,
    domain: "Generative AI",
    year: "2025",
    accent: "--accent-violet",
    tech: ["Python", "LangChain", "OpenAI", "Pinecone", "FastAPI", "Docker"],
    problem:
      "Business users lost hours hunting through internal knowledge repositories. Keyword search returned matches with no context, so people asked colleagues instead of asking the system.",
    goal:
      "Return context-aware, cited answers across unstructured enterprise content, behind an API fast enough to sit inside existing tools.",
    architecture: [
      { title: "Ingest", detail: "Documents are loaded, cleaned, and split into overlapping chunks with source metadata preserved." },
      { title: "Embed", detail: "Chunks are embedded and upserted into a Pinecone index alongside their provenance." },
      { title: "Retrieve", detail: "Each query pulls top-k semantic matches, filtered by metadata where the caller scopes it." },
      { title: "Generate", detail: "LangChain conditions the LLM on retrieved context so every answer carries citations." },
      { title: "Serve", detail: "FastAPI endpoints in Docker containers keep inference consistent across environments." },
    ],
    decisions: [
      "Chunk overlap tuned against retrieval relevance rather than a default — small chunks lost context, large ones diluted the embedding.",
      "Citations returned as structured metadata, not parsed out of the model's prose, so the UI can link them reliably.",
      "Containerised inference so the same image runs in every environment and latency stops depending on the host.",
    ],
    challenges:
      "Keeping retrieval relevant as the corpus grew, and holding inference latency stable once several teams were querying concurrently.",
    result:
      "Cut research effort for business users and improved answer relevance, with consistent inference performance across environments.",
    learned:
      "Retrieval quality, not model size, decides whether a RAG system feels trustworthy. Nearly every bad answer traced back to what was retrieved, not to how it was written.",
    metrics: [
      { label: "Relevance lift", value: 38, suffix: "%", assumed: true },
      { label: "P95 latency", value: 900, suffix: "ms", assumed: true },
      { label: "Documents indexed", value: 12, suffix: "K+", assumed: true },
    ],
    repo: null,
    demo: null,
  },
  {
    slug: "churn-mlops-platform",
    title: "Customer Churn & MLOps Platform",
    tagline: "Churn models wrapped in a lifecycle that keeps them healthy.",
    featured: true,
    domain: "MLOps",
    year: "2024",
    accent: "--accent-cyan",
    tech: ["Python", "XGBoost", "MLflow", "Airflow", "AWS", "Docker"],
    problem:
      "Retention teams couldn't see which customers were about to leave, and every model update was a manual, untracked event that nobody could reproduce.",
    goal:
      "Predict at-risk customers and put the model inside an automated lifecycle — training, tracking, deployment, and monitoring.",
    architecture: [
      { title: "Features", detail: "Behavioural signals are engineered into a versioned training set." },
      { title: "Train", detail: "XGBoost models are tuned and every run is logged to MLflow with its parameters." },
      { title: "Orchestrate", detail: "Airflow schedules retraining and promotion so releases stop being manual." },
      { title: "Monitor", detail: "Prediction quality and feature drift are checked continuously against the training distribution." },
    ],
    decisions: [
      "The churn label was defined with the business before any modelling — the first definition looked reasonable and produced a model nobody could act on.",
      "Drift monitoring watches input features, not just output quality, so degradation is visible before it reaches predictions.",
      "Every training run is reproducible from its MLflow record, which is what made automated promotion safe.",
    ],
    challenges:
      "Defining a churn label that matched what the business actually meant, and catching drift early enough that it never showed up as a bad quarter.",
    result:
      "Surfaced at-risk customers for retention campaigns and removed manual intervention from the model lifecycle.",
    learned:
      "The model is maybe a fifth of the work. The rest is the loop that keeps it alive — and that loop is what fails first.",
    metrics: [
      { label: "ROC-AUC", value: 91, suffix: "%", assumed: true },
      { label: "Manual steps removed", value: 80, suffix: "%", assumed: true },
      { label: "Drift checks / day", value: 24, assumed: true },
    ],
    repo: null,
    demo: null,
  },
  {
    slug: "oceans-smoke-shop",
    title: "Ocean's Smoke Shop",
    tagline: "A live retail catalogue running on a real POS, for a real store.",
    featured: true,
    domain: "Full-Stack · Commerce",
    year: "2026",
    accent: "--accent-emerald",
    tech: ["Next.js", "TypeScript", "PostgreSQL", "EposNow API", "Cloudflare R2", "Vercel"],
    problem:
      "An independent retail store had 1,700+ products locked inside an EposNow point-of-sale system with no web presence. Stock and pricing lived only on the till, so nothing customers could see was ever current.",
    goal:
      "Put the entire catalogue online, driven by the same data the store actually runs on, and give the owner control without asking him to touch a database.",
    architecture: [
      { title: "Sync", detail: "Product, price, and stock data is pulled from the EposNow API into Postgres on a schedule." },
      { title: "Catalogue", detail: "1,721 products render through Next.js with search, category browsing, and per-product pages." },
      { title: "Images", detail: "A Google Drive to Cloudflare R2 pipeline ingests product photography and links it by SKU." },
      { title: "Merchandising", detail: "An admin surface drives seasonal themes, promotions, and price/inventory visibility toggles." },
      { title: "Deploy", detail: "Continuous deployment to Vercel, with the store account owning the production project." },
    ],
    decisions: [
      "The site reads from the POS and never writes back to it — the till is the source of truth for a business that runs on it daily.",
      "Images resolve by file ID rather than filename, so re-uploads and renames in Drive never orphan a product photo.",
      "The owner gets toggles, not a CMS. Every merchandising control is a switch with one obvious effect.",
    ],
    challenges:
      "Reconciling a POS catalogue built for a till — inconsistent naming, missing categories, duplicate SKUs — into something a customer could actually browse.",
    result:
      "Live and serving the full catalogue. The store's inventory, pricing, and promotions are online and current for the first time.",
    learned:
      "Building for a non-technical owner changes every interface decision. The feature that mattered most wasn't a feature — it was making sure nothing he clicked could break the shop.",
    metrics: [
      { label: "Products live", value: 1721 },
      { label: "Product photos linked", value: 286 },
      { label: "Deal types supported", value: 5 },
    ],
    repo: null,
    demo: "https://www.oceanssmokeshop.com",
    note: "Live and in active development — the customer-facing catalogue is complete; admin tooling and remaining photography are still landing.",
  },
  {
    slug: "study-tutor",
    title: "Study Tutor",
    tagline: "Upload your notes, get summaries, quizzes, and graded feedback.",
    featured: true,
    domain: "LLM Application",
    year: "2026",
    accent: "--accent-violet",
    tech: ["Python", "Flask", "Gemini 2.5 Flash", "pypdf", "Render"],
    problem:
      "Revision material is passive. Reading your own notes back tells you nothing about what you don't know yet, and building quizzes by hand is exactly the work you're avoiding.",
    goal:
      "Turn a folder of notes into active study material — summaries, quizzes in several formats, flashcards, and grading that remembers what you got wrong.",
    architecture: [
      { title: "Ingest", detail: "Notes are uploaded as .txt, .md, or .pdf and grouped into a subject." },
      { title: "Pre-warm", detail: "A background thread generates the summary and a question pool on upload, so the first click is instant." },
      { title: "Generate", detail: "Gemini produces summaries, MCQs, short-answer, interview, and coding questions from the source material." },
      { title: "Grade", detail: "An evaluator scores free-text answers 0-10 with written feedback at temperature zero." },
      { title: "Remember", detail: "Wrong answers write their topic tag to persistent memory, which biases later quizzes toward weak areas." },
    ],
    decisions: [
      "Subjects are fingerprinted by file name, size, and mtime — edit a note and the cache invalidates itself, with no manual refresh.",
      "The question pool is served destructively and refilled in the background, so personalisation costs zero extra model calls.",
      "Thinking budget set to zero: the latency win was worth far more than the reasoning depth for this workload.",
    ],
    challenges:
      "Every answer is a network round-trip to a hosted model, so the honest version of this app would make a student wait several seconds on every click. Waiting is where attention goes.",
    result:
      "The cache layer means the wait lands where nobody notices it. Upload your notes, and by the time you have finished reading the page the summary and a full question pool already exist — every click after that is served from disk, instantly, with no spinner to break concentration.",
    learned:
      "Latency is a study-tool feature, not an engineering vanity metric. A three-second pause is enough for a student to pick up their phone, and no amount of answer quality wins that attention back.",
    metrics: [
      { label: "Questions pre-built on upload", value: 12 },
      { label: "Question formats", value: 4 },
      { label: "API calls to personalise", value: 0 },
    ],
    repo: "https://github.com/KiritoKazugaya/study-tutor-agent",
    demo: null,
  },
  {
    slug: "face-recognition-135",
    title: "135-Class Face Recognition",
    tagline: "Classic computer vision, end to end, from raw pixels to a web UI.",
    domain: "Computer Vision",
    year: "2025",
    accent: "--accent-amber",
    tech: ["Python", "OpenCV", "scikit-learn", "PyWavelets", "Flask", "React"],
    problem:
      "Identify which of 135 film actors appears in an uploaded photo — a hard multi-class problem with a badly imbalanced, scraped dataset.",
    goal:
      "Build the whole path: face detection, feature engineering, classifier training, and a served inference API behind a real interface.",
    architecture: [
      { title: "Detect", detail: "OpenCV Haar cascades crop faces, rejecting any candidate without two visible eyes." },
      { title: "Transform", detail: "Each face becomes a 4096-dim vector: a 32x32 raw image stacked with its 32x32 Haar-wavelet detail image." },
      { title: "Classify", detail: "An SVM tuned by grid search predicts across 135 classes and returns probabilities." },
      { title: "Serve", detail: "A Flask endpoint loads the pickled pipeline; a React UI posts images and renders the ranked result." },
    ],
    decisions: [
      "Requiring two detected eyes before accepting a crop threw away usable images but removed most of the garbage the scraper collected.",
      "Wavelet detail stacked with raw pixels — the frequency information carried facial structure that raw pixels alone kept losing to lighting.",
      "Probabilities returned alongside the label, because on 135 classes a bare prediction tells the user nothing about confidence.",
    ],
    challenges:
      "Severe class imbalance — the rarest class had a single usable image — and a scraped dataset where a meaningful share of photos weren't the labelled person at all.",
    result:
      "37.5% top-1 accuracy across 135 classes against a 0.74% random baseline — roughly a 50x lift, with a working end-to-end inference path.",
    learned:
      "A classical feature stack takes you surprisingly far, and then stops hard. The ceiling here is the architecture: this problem wants learned embeddings, not engineered ones.",
    metrics: [
      { label: "Classes", value: 135 },
      { label: "Top-1 accuracy", value: 37.5, suffix: "%" },
      { label: "Lift over baseline", value: 50, suffix: "x" },
    ],
    repo: null,
    demo: null,
    note: "Reported honestly: 37.5% is weak in absolute terms and strong against a 1-in-135 baseline. The write-up is about why the ceiling is where it is.",
  },
  {
    slug: "github-popularity-study",
    title: "What Makes a Repo Take Off",
    tagline: "300M repositories in, 29K out, and a negative result worth keeping.",
    domain: "Data Science",
    year: "2025",
    accent: "--accent-cyan",
    tech: ["Python", "scikit-learn", "XGBoost", "statsmodels", "BigQuery", "GitHub API"],
    problem:
      "Everyone believes a good README drives GitHub stars. Nobody had checked, and the belief shapes how a lot of people spend their time.",
    goal:
      "Start from the whole of GitHub — roughly 300 million public repositories — and narrow it, by engineered criteria rather than convenience, down to a population where the question can actually be answered.",
    architecture: [
      { title: "Query at source", detail: "Google BigQuery over the GH Archive public dataset puts all ~300M public repositories in scope, rather than whatever the search API happens to rank first." },
      { title: "Engineer the filter", detail: "Activity, age, star-threshold, and language features cut that population down to the ~29K repositories that can support the question — the funnel is the method, not a sampling shortcut." },
      { title: "Enrich", detail: "A GitHub API crawler recursively bisects date windows to beat the 1,000-result search cap, pulling full README text for the surviving set." },
      { title: "Join", detail: "1.81M daily star events are joined to repository metadata to reconstruct each project's growth curve." },
      { title: "Model", detail: "OLS, Ridge, Lasso, Random Forest, and XGBoost are compared under cross-validation on README features." },
      { title: "Predict", detail: "A growth model trained on early star curves is scored against 16,594 unseen repositories." },
      { title: "Forecast", detail: "Holt-Winters smoothing projects repository creation by language and field across three horizons." },
    ],
    decisions: [
      "Reported the null result rather than hunting for a specification that produced a positive one.",
      "Recursive date-window bisection to defeat the search API's result cap — the difference between a biased sample and a usable one.",
      "Cross-validated every model, because the holdout R² alone would have made a weak result look stronger than it was.",
    ],
    challenges:
      "The GitHub search API caps results at 1,000 per query, which quietly biases any naive collection toward whatever it ranks first.",
    result:
      "README structure does not predict stars — best cross-validated R² of 0.056 across five model families. Only link count showed any significant relationship.",
    learned:
      "A well-measured negative result is more useful than a positive one you had to torture the data for. The interesting output here was the pipeline, not the coefficient.",
    metrics: [
      { label: "Repositories in scope", value: 300, suffix: "M" },
      { label: "Survived feature filtering", value: 29, suffix: "K" },
      { label: "Best CV R²", value: 0.056 },
    ],
    repo: null,
    demo: null,
  },
  {
    slug: "whatsapp-supplement-agent",
    title: "WhatsApp Reminder Agent",
    tagline: "A deployed service that turns a daily routine into a conversation.",
    domain: "Automation · Integration",
    year: "2026",
    accent: "--accent-emerald",
    tech: ["Node.js", "Express", "WhatsApp Cloud API", "Google Sheets API", "node-cron", "Render"],
    problem:
      "Getting a family member to keep a daily supplement routine. Phone alarms get dismissed without being read; a paper checklist gets lost.",
    goal:
      "Deliver reminders where the person already is — WhatsApp — and record what actually got taken, without asking them to learn anything new.",
    architecture: [
      { title: "Schedule", detail: "Four cron jobs fire morning, afternoon, evening, and night on Asia/Kolkata time." },
      { title: "Send", detail: "Each reminder posts a WhatsApp interactive list containing only the items still outstanding." },
      { title: "Receive", detail: "A verified webhook receives the tapped reply and maps the selection to per-item completion." },
      { title: "Record", detail: "Completions append to a Google Sheet through a service account, and a confirmation goes back out." },
      { title: "Derive", detail: "Pending state is read back from the day's rows, so the system holds no state of its own." },
    ],
    decisions: [
      "State is derived from the sheet rather than stored in the service — a restart on free-tier hosting loses nothing.",
      "Each reminder lists only what's still outstanding, so the last message of the day is short instead of nagging.",
      "An external scheduler triggers the jobs, because free-tier instances sleep and an internal cron would sleep with them.",
    ],
    challenges:
      "Free-tier hosting sleeps after inactivity, which makes an internally-scheduled cron unreliable — the fix was to stop trusting the process to stay awake.",
    result:
      "Deployed and running daily against a real WhatsApp Business number, writing to a live spreadsheet.",
    learned:
      "The channel mattered more than the logic. The same reminder in the right place gets acted on; in the wrong place it gets swiped away.",
    metrics: [
      { label: "Reminders / day", value: 4 },
      { label: "Items tracked", value: 4 },
      { label: "Uptime", value: 99, suffix: "%", assumed: true },
    ],
    repo: null,
    demo: null,
  },
  {
    slug: "global-energy-dashboards",
    title: "Global Energy Transition",
    tagline: "Twenty-four years of world electricity generation, made readable.",
    domain: "Data Visualisation",
    year: "2025",
    accent: "--accent-amber",
    tech: ["Tableau", "Excel", "IRENA dataset", "LOD & table calcs"],
    problem:
      "IRENA publishes 90,000 rows of global energy statistics. The renewables transition is in there, and it is completely invisible to anyone reading the spreadsheet.",
    goal:
      "Build an interactive view of generation and installed capacity that makes the shift from non-renewable to renewable legible at a glance.",
    architecture: [
      { title: "Model", detail: "The IRENA 2024 extract is shaped across country, region, and global grains." },
      { title: "Encode", detail: "A world choropleth carries generation; stacked bars split the top emitters by fuel technology." },
      { title: "Contrast", detail: "A dual line chart tracks total renewable against total non-renewable across the full period." },
      { title: "Explore", detail: "Year sliders and country, region, and technology filters drive every view live." },
    ],
    decisions: [
      "A generation-versus-capacity bubble scatter, because the ratio says something neither axis says alone — how hard installed capacity is actually working.",
      "Fuel technologies grouped into renewable and non-renewable at the data layer, so every view tells the same story consistently.",
    ],
    challenges:
      "Inconsistent country naming and unit conventions across the source's regional groupings, which quietly break any join done naively.",
    result:
      "A dashboard set covering 2000-2023 where the renewables crossover is immediately visible instead of buried.",
    learned:
      "The hardest decision in a dashboard is what to leave out. The first version answered every question and communicated nothing.",
    metrics: [
      { label: "Rows modelled", value: 90, suffix: "K" },
      { label: "Years covered", value: 24 },
      { label: "Dashboard views", value: 13 },
    ],
    repo: null,
    demo: null,
    note: "Built as group coursework at the University of Florida — the energy workbooks and analysis were my contribution.",
  },
  {
    slug: "vendor-price-scraper",
    title: "Vendor Price & Volume Scraper",
    tagline: "A purchasing decision, answered with a crawler instead of a spreadsheet.",
    domain: "Data Engineering",
    year: "2026",
    accent: "--accent-violet",
    tech: ["Python", "BeautifulSoup", "requests", "openpyxl"],
    problem:
      "Choosing retail display cases across two vendors meant comparing hundreds of products on price and physical capacity — and the dimensions were written inconsistently on every single page.",
    goal:
      "Crawl both catalogues, normalise the dimension text, and rank every case by storage volume bought per dollar.",
    architecture: [
      { title: "Discover", detail: "Subcategory and paginated grid pages are found automatically from the catalogue root." },
      { title: "Parse", detail: "Each product page yields name, price, image, and dimensions through a four-strategy fallback chain." },
      { title: "Normalise", detail: "Mixed fractions like '16 1/4' become 16.25, and labels are stripped before volume is computed." },
      { title: "Report", detail: "An Excel workbook is written with embedded thumbnails, source links, and a volume-per-dollar column." },
      { title: "Audit", detail: "Every product whose dimensions failed to parse is written to a separate sheet rather than dropped." },
    ],
    decisions: [
      "Four cascading extraction strategies per vendor — spec table, definition list, bullets, then block-text regex — because no single one covered the catalogue.",
      "Failures are written to an audit sheet instead of being silently skipped, so the gap in the data is visible rather than invisible.",
      "Output files are auto-versioned, so a re-run never overwrites the comparison someone is already reading.",
    ],
    challenges:
      "One vendor wrote dimensions as unstructured prose. Extraction succeeded on roughly a quarter of those products, which the audit sheet reports rather than hides.",
    result:
      "366 products across two vendors ranked by storage volume per dollar, with every unparsed product accounted for.",
    learned:
      "The audit sheet turned out to be the most valuable column in the workbook. Knowing what the scraper missed is what made the rest of it trustworthy.",
    metrics: [
      { label: "Products crawled", value: 366 },
      { label: "Vendors", value: 2 },
      { label: "Extraction strategies", value: 4 },
    ],
    repo: null,
    demo: null,
  },
  {
    slug: "mariposa-care",
    title: "mariposa.care",
    tagline: "Marketing site for a senior-care software platform.",
    domain: "Client Web",
    year: "2025",
    accent: "--accent-cyan",
    tech: ["WordPress", "Elementor Pro", "HubSpot", "Google Tag Manager"],
    problem:
      "A senior-care SaaS company needed a marketing site that spoke to three different audiences — home care agencies, families, and health partners — without splitting into three different products.",
    goal:
      "Deliver a live marketing presence with a clear path from each audience to a demo request, handed over in a stack the client's own team could maintain.",
    architecture: [
      { title: "Structure", detail: "Three audience paths branch from a single hero into their own feature narratives." },
      { title: "Build", detail: "Page-built in Elementor Pro so the client's team can edit copy without a developer." },
      { title: "Capture", detail: "HubSpot handles demo requests and feeds the company's existing sales pipeline." },
      { title: "Measure", detail: "Tag Manager and Hotjar instrument the funnel from landing to demo request." },
    ],
    decisions: [
      "WordPress and Elementor over a coded build, deliberately — the client needed to own edits after handover, and a bespoke front end would have made them dependent on me.",
      "Testimonials placed directly beneath each audience path, because the objection they answer is different for an agency than for a family.",
    ],
    challenges:
      "Serving three audiences with genuinely different vocabularies from one navigation without the page turning into a menu of menus.",
    result:
      "Live at mariposa.care, running the company's demo funnel.",
    learned:
      "Picking the boring stack was the right call. The measure of a client site is whether they can still change it a year later without calling you.",
    metrics: [
      { label: "Audience paths", value: 3 },
      { label: "Pages", value: 9 },
    ],
    repo: null,
    demo: "https://www.mariposa.care",
    note: "Client web work, built on WordPress and Elementor rather than a coded front end — included here as delivery work, not as an engineering piece.",
  },
]

/* -------------------------------------------------------------------------- */
/*  Project taxonomy + language mix                                            */
/* -------------------------------------------------------------------------- */

export const projectCategories: ProjectCategory[] = [
  "AI / ML",
  "Data",
  "Full-Stack",
  "Automation",
]

const CATEGORY: Record<string, ProjectCategory> = {
  "enterprise-rag-assistant": "AI / ML",
  "churn-mlops-platform": "AI / ML",
  "study-tutor": "AI / ML",
  "face-recognition-135": "AI / ML",
  "github-popularity-study": "Data",
  "global-energy-dashboards": "Data",
  "vendor-price-scraper": "Data",
  "oceans-smoke-shop": "Full-Stack",
  "mariposa-care": "Full-Stack",
  "whatsapp-supplement-agent": "Automation",
}

/** GitHub's own language colours, so the bars read as familiar. */
const LANG = {
  python: "#3572A5",
  ts: "#3178c6",
  js: "#f1e05a",
  html: "#e34c26",
  css: "#563d7c",
  sql: "#e38c00",
  r: "#198CE7",
  jupyter: "#DA5B0B",
  php: "#4F5D95",
  shell: "#89e051",
  yaml: "#cb171e",
} as const

const LANGUAGES: Record<string, Language[]> = {
  "enterprise-rag-assistant": [
    { name: "Python", pct: 86.4, color: LANG.python },
    { name: "Dockerfile", pct: 8.1, color: LANG.shell },
    { name: "YAML", pct: 5.5, color: LANG.yaml },
  ],
  "churn-mlops-platform": [
    { name: "Python", pct: 78.2, color: LANG.python },
    { name: "Jupyter", pct: 12.9, color: LANG.jupyter },
    { name: "YAML", pct: 8.9, color: LANG.yaml },
  ],
  "oceans-smoke-shop": [
    { name: "TypeScript", pct: 91.3, color: LANG.ts },
    { name: "CSS", pct: 5.2, color: LANG.css },
    { name: "SQL", pct: 3.5, color: LANG.sql },
  ],
  "study-tutor": [
    { name: "Python", pct: 68.7, color: LANG.python },
    { name: "HTML", pct: 21.4, color: LANG.html },
    { name: "CSS", pct: 9.9, color: LANG.css },
  ],
  "face-recognition-135": [
    { name: "Jupyter", pct: 54.1, color: LANG.jupyter },
    { name: "Python", pct: 28.8, color: LANG.python },
    { name: "TypeScript", pct: 17.1, color: LANG.ts },
  ],
  "github-popularity-study": [
    { name: "Jupyter", pct: 82.6, color: LANG.jupyter },
    { name: "Python", pct: 11.9, color: LANG.python },
    { name: "SQL", pct: 5.5, color: LANG.sql },
  ],
  "whatsapp-supplement-agent": [
    { name: "JavaScript", pct: 96.8, color: LANG.js },
    { name: "JSON", pct: 3.2, color: LANG.yaml },
  ],
  "global-energy-dashboards": [
    { name: "Tableau", pct: 88.0, color: LANG.r },
    { name: "SQL", pct: 12.0, color: LANG.sql },
  ],
  "vendor-price-scraper": [
    { name: "Jupyter", pct: 71.5, color: LANG.jupyter },
    { name: "Python", pct: 28.5, color: LANG.python },
  ],
  "mariposa-care": [
    { name: "PHP", pct: 62.4, color: LANG.php },
    { name: "CSS", pct: 24.1, color: LANG.css },
    { name: "JavaScript", pct: 13.5, color: LANG.js },
  ],
}

export const projects: Project[] = RAW_PROJECTS.map((p) => ({
  ...p,
  category: CATEGORY[p.slug],
  languages: LANGUAGES[p.slug] ?? [],
}))

/* -------------------------------------------------------------------------- */
/*  Experience & education                                                     */
/* -------------------------------------------------------------------------- */

export const experience: ExperienceItem[] = [
  {
    kind: "work",
    role: "AI/ML Engineer",
    org: "Capital One",
    location: "Florida, USA",
    start: "Apr 2025",
    end: "Present",
    summary:
      "Building Generative AI and machine learning systems on enterprise-scale data, behind production APIs.",
    highlights: [
      "Built RAG applications with LangChain, vector databases, and LLMs, improving information discovery across internal knowledge repositories.",
      "Developed classification, forecasting, and anomaly-detection models in Python, Scikit-Learn, XGBoost, and PyTorch.",
      "Processed 15M+ records monthly through PySpark and Databricks pipelines, accelerating feature engineering across teams.",
      "Fine-tuned transformer models on domain data to improve document classification, information extraction, and search relevance.",
      "Automated deployment with MLflow, Docker, and GitHub Actions, and monitored prediction quality, feature drift, and model health in production.",
    ],
    tags: ["RAG", "LangChain", "PyTorch", "Databricks", "MLOps"],
    accent: "#7dd3fc",
    stats: [
      { label: "Records / month", value: 15, suffix: "M+" },
      { label: "Years in role", value: 1.4 },
      { label: "Model families shipped", value: 4, assumed: true },
    ],
    bars: [
      { label: "Generative AI & RAG", value: 88 },
      { label: "Predictive modelling", value: 74 },
      { label: "Data engineering at scale", value: 81 },
      { label: "MLOps & monitoring", value: 76 },
    ],
  },
  {
    kind: "work",
    role: "ML Engineer",
    org: "Accenture",
    location: "India",
    start: "Feb 2020",
    end: "Dec 2023",
    summary:
      "Delivered end-to-end machine learning for financial services, healthcare, and retail clients.",
    highlights: [
      "Constructed full ML pipelines covering ingestion, transformation, feature engineering, training, validation, deployment, and monitoring.",
      "Built regression, classification, and forecasting models that surfaced business trends, risks, and improvement opportunities.",
      "Performed exploratory analysis on datasets exceeding 10M records to uncover patterns and improve data quality.",
      "Delivered NLP for sentiment analysis, document categorisation, and text classification, reducing manual processing effort.",
      "Automated data preparation and training workflows with Python and Apache Airflow, and migrated ML workloads to AWS and Azure.",
    ],
    tags: ["Python", "NLP", "Airflow", "AWS", "Azure", "Tableau"],
    accent: "#34d399",
    stats: [
      { label: "Years in role", value: 3.9 },
      { label: "Rows in EDA", value: 10, suffix: "M+" },
      { label: "Client domains", value: 3 },
    ],
    bars: [
      { label: "End-to-end ML pipelines", value: 86 },
      { label: "NLP & text classification", value: 72 },
      { label: "Cloud migration (AWS/Azure)", value: 68 },
      { label: "BI & stakeholder reporting", value: 79 },
    ],
  },
  {
    kind: "education",
    role: "M.S. Information Systems & Operations Management",
    org: "University of Florida",
    location: "Florida, USA",
    start: "2024",
    end: "Dec 2025",
    summary: "Graduate study bridging information systems, analytics, and operations.",
    highlights: [
      "Focused on data systems, applied analytics, and AI for business operations.",
      "Capstone data-science work on GitHub repository growth using self-collected data at scale.",
    ],
    tags: ["Information Systems", "Analytics", "Operations"],
    accent: "#a78bfa",
    stats: [
      { label: "Graduated", value: 2025 },
      { label: "Repos in capstone scope", value: 300, suffix: "M" },
      { label: "Star events joined", value: 1.81, suffix: "M" },
    ],
    bars: [
      { label: "Applied analytics", value: 84 },
      { label: "Data systems", value: 78 },
      { label: "Operations & decision support", value: 71 },
    ],
  },
  {
    kind: "education",
    role: "B.Tech. Electrical & Electronics Engineering",
    org: "NIT Warangal",
    location: "India",
    start: "2017",
    end: "Jun 2021",
    summary: "Engineering foundation in signals, systems, and computation.",
    highlights: [
      "Grounding in mathematics, signals, and systems thinking.",
      "Started working in machine learning before graduating.",
    ],
    tags: ["Engineering", "Signals", "Mathematics"],
    accent: "#f0b429",
    stats: [
      { label: "Graduated", value: 2021 },
      { label: "Years overlapping work", value: 1.4 },
      { label: "NIT rank tier", value: 1, assumed: true },
    ],
    bars: [
      { label: "Mathematics & signals", value: 82 },
      { label: "Systems thinking", value: 76 },
      { label: "Programming foundation", value: 69 },
    ],
  },
]
