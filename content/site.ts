/**
 * Every piece of copy, project, internship entry, stack item and link on the
 * site. Components read from here and hold no content of their own, so copy
 * can be edited without touching a component.
 */

/* ------------------------------------------------------------------ site */

export const site = {
  name: 'Shresht Ashish',
  shortMark: 'S.',
  title: 'Shresht Ashish — CS student building systems that ship',
  description:
    'Second-year CS student at Nirma University. I build systems that ship — RAG pipelines, multi-agent orchestration, full-stack apps.',
  url: 'https://shresht2107.github.io',
  ogImage: '/og.png',
  locale: 'en_US',
} as const;

export const links = {
  github: 'https://github.com/Shresht2107',
  linkedin: 'https://linkedin.com/in/shresht-ashish',
  email: 'shresht.ashish18@gmail.com',
  resume: '/Shresht_Ashish_Resume.pdf',
} as const;

export const resumeLabel = 'resume.pdf ↗';

/* ------------------------------------------------------------------- nav */

export type SectionKey = 'about' | 'internship' | 'projects' | 'stack' | 'now' | 'contact';

export const sectionKeys: readonly SectionKey[] = [
  'about',
  'internship',
  'projects',
  'stack',
  'now',
  'contact',
] as const;

export const navItems: readonly { key: SectionKey; label: string }[] = [
  { key: 'about', label: 'about' },
  { key: 'internship', label: 'experience' },
  { key: 'projects', label: 'projects' },
  { key: 'stack', label: 'stack' },
  { key: 'now', label: 'now' },
  { key: 'contact', label: 'contact' },
] as const;

/* ------------------------------------------------------------------ hero */

export const hero = {
  /** Typed character by character once the intro hands over. */
  typedText: "Hi, I'm Shresht. Welcome to my portfolio.",
  subline:
    'Second-year CS student at Nirma University. I build systems that ship — RAG pipelines, multi-agent orchestration, full-stack apps.',
  scrollCue: 'scroll',
} as const;

/* ----------------------------------------------------------------- about */

export const about = {
  heading: 'About',
  watermark: '>_',
  paragraphs: [
    'I work mostly on applied AI: retrieval pipelines, agent workflows, and the engineering that makes them dependable in real use. A lot of that comes down to knowing when a model should make the call and when it shouldn\'t. During my internship at Amnex, I built the agent behind AIRA, an HR assistant that hands a question to a human whenever it isn\'t confident enough to answer. On ArogyaLink, a rural health-data platform, AI turns voice notes and photos of health records into structured data, but medical decisions are made by fixed rules, not the AI.',
    'I\'m in my second year of B.Tech in Computer Science, and I\'m currently researching failure modes in agentic federated learning with collaborators at Nirma University and the University of Messina. I also enjoy working below the usual abstractions, which led me to build a RISC-V assembler and a C syntax checker from scratch.',
    'I\'m looking for internships and research roles where I can keep building AI systems that are both capable and reliable.',
  ],
} as const;

/* ------------------------------------------------------------ internship */

export type InternshipEntry = { title: string; description: string };

export const internship = {
  heading: 'Internship Experience',
  role: 'Software Engineering Intern — Amnex Infotechnologies',
  entries: [
    {
      title: 'AIRA — Enterprise RAG HR Assistant',
      description:
        'Built ingestion pipelines and retrieval infrastructure for AIRA, an enterprise RAG-based HR assistant — including pgvector-backed vector storage and LangGraph orchestration for multi-step retrieval and reasoning.',
    },
    {
      title: 'Government Data-Analytics Platform',
      description:
        'Contributed frontend engineering for a government data-analytics platform, building interfaces to explore and visualize large public datasets.',
    },
  ] satisfies InternshipEntry[],
} as const;

/* -------------------------------------------------------------- diagrams */

export type DiagramAccent = 'blue' | 'coral';

export type DiagramText = {
  x: number;
  y: number;
  text: string;
  anchor: 'start' | 'middle';
};

/** Edge keys are 'e'-prefixed: they draw in as stroke-dashoffset falls to 0. */
export type DiagramEdge = { key: string; d: string; width: number };

/** Node keys are 'n'-prefixed: they fade in. */
export type DiagramNode = {
  key: string;
  cx: number;
  cy: number;
  /** Solid accent disc (pipeline endpoint) vs outlined (processing step). */
  filled: boolean;
  labels: DiagramText[];
};

/** Annotation that fades in as its paired edge finishes drawing. */
export type DiagramAnnotation = { key: string; lines: DiagramText[] };

/** Looping tick that runs the finished pipeline once it has built. */
export type DiagramPulse = { d: string; dashArray: string; durationSec: number; delaySec: number };

/** Static dashes laid over an edge so it reads as a break in the flow. */
export type DiagramOverlay = { d: string };

export type DiagramSpec = {
  accent: DiagramAccent;
  viewBox: string;
  edges: DiagramEdge[];
  overlays: DiagramOverlay[];
  pulses: DiagramPulse[];
  annotations: DiagramAnnotation[];
  nodes: DiagramNode[];
  /** Build order: one step per node-appear / edge-draw, in pipeline order. */
  sequence: string[];
  /** Edge keys whose paired annotation fades in as they draw. */
  labelled: string[];
};

const f1Diagram: DiagramSpec = {
  accent: 'blue',
  viewBox: '0 0 260 195',
  edges: [
    { key: 'e0', d: 'M30 90 L30 55 Q30 48 37 48 L86 48', width: 1.1 },
    { key: 'e1', d: 'M98 48 L161 48', width: 1.1 },
    { key: 'e2', d: 'M174 48 L217 48', width: 1.1 },
    { key: 'e3', d: 'M30 102 L30 141 Q30 148 37 148 L86 148', width: 1.1 },
    { key: 'e4', d: 'M98 148 L161 148', width: 1.1 },
    { key: 'e5', d: 'M174 148 L217 148', width: 1.1 },
  ],
  overlays: [],
  pulses: [
    { d: 'M30 96 L30 48 L224 48', dashArray: '8 392', durationSec: 4.6, delaySec: 0 },
    { d: 'M30 96 L30 148 L224 148', dashArray: '8 392', durationSec: 4.6, delaySec: 2.3 },
  ],
  annotations: [
    {
      key: 'l1',
      lines: [
        { x: 130, y: 33, text: 'pace output', anchor: 'middle' },
        { x: 130, y: 41, text: 'feeds classifier', anchor: 'middle' },
      ],
    },
  ],
  nodes: [
    {
      key: 'n0',
      cx: 30,
      cy: 96,
      filled: true,
      labels: [{ x: 40, y: 99, text: 'Race Data', anchor: 'start' }],
    },
    {
      key: 'n1',
      cx: 92,
      cy: 48,
      filled: false,
      labels: [
        { x: 92, y: 61, text: 'Pace', anchor: 'middle' },
        { x: 92, y: 70, text: 'Regression', anchor: 'middle' },
        { x: 92, y: 79, text: 'XGBoost', anchor: 'middle' },
      ],
    },
    {
      key: 'n2',
      cx: 168,
      cy: 48,
      filled: false,
      labels: [
        { x: 168, y: 61, text: 'Podium', anchor: 'middle' },
        { x: 168, y: 70, text: 'Classifier', anchor: 'middle' },
        { x: 168, y: 79, text: 'XGBoost', anchor: 'middle' },
      ],
    },
    {
      key: 'n3',
      cx: 224,
      cy: 48,
      filled: true,
      labels: [
        { x: 224, y: 61, text: 'Predicted', anchor: 'middle' },
        { x: 224, y: 70, text: 'Outcome', anchor: 'middle' },
      ],
    },
    {
      key: 'n4',
      cx: 92,
      cy: 148,
      filled: false,
      labels: [{ x: 92, y: 161, text: 'Embeddings', anchor: 'middle' }],
    },
    {
      key: 'n5',
      cx: 168,
      cy: 148,
      filled: false,
      labels: [{ x: 168, y: 161, text: 'Qdrant', anchor: 'middle' }],
    },
    {
      key: 'n6',
      cx: 224,
      cy: 148,
      filled: true,
      labels: [{ x: 224, y: 161, text: 'RAG Q&A', anchor: 'middle' }],
    },
  ],
  sequence: ['n0', 'e0', 'n1', 'e1', 'n2', 'e2', 'n3', 'e3', 'n4', 'e4', 'n5', 'e5', 'n6'],
  labelled: ['e1'],
};

const arogyaDiagram: DiagramSpec = {
  accent: 'coral',
  viewBox: '0 0 260 195',
  edges: [
    { key: 'e0', d: 'M33 34 L87 34', width: 1.1 },
    { key: 'e1', d: 'M33 104 L87 104', width: 1.1 },
    { key: 'e2', d: 'M100 34 L138 34 Q144 34 144 40 L144 63 Q144 69 150 69', width: 1.1 },
    { key: 'e3', d: 'M100 104 L138 104 Q144 104 144 98 L144 75 Q144 69 150 69', width: 1.1 },
    { key: 'e4', d: 'M162 66 L192 66 Q199 66 199 59 L199 41 Q199 34 206 34 L220 34', width: 1.1 },
    { key: 'e5', d: 'M156 76 L156 127', width: 2 },
    { key: 'e6', d: 'M162 134 L220 134', width: 2 },
  ],
  overlays: [{ d: 'M156 76 L156 127' }, { d: 'M162 134 L220 134' }],
  pulses: [
    {
      d: 'M30 34 L144 34 L144 69 L199 69 L199 34 L226 34',
      dashArray: '8 392',
      durationSec: 5.2,
      delaySec: 0,
    },
    { d: 'M30 104 L144 104 L144 69', dashArray: '6 394', durationSec: 5.2, delaySec: 2.6 },
  ],
  annotations: [
    {
      key: 'l5',
      lines: [
        { x: 164, y: 112, text: 'deterministic', anchor: 'start' },
        { x: 164, y: 121, text: 'rules, no model', anchor: 'start' },
      ],
    },
  ],
  nodes: [
    {
      key: 'n0',
      cx: 26,
      cy: 34,
      filled: true,
      labels: [
        { x: 26, y: 47, text: 'Field', anchor: 'middle' },
        { x: 26, y: 56, text: 'Audio', anchor: 'middle' },
      ],
    },
    {
      key: 'n1',
      cx: 94,
      cy: 34,
      filled: false,
      labels: [
        { x: 94, y: 47, text: 'ASR', anchor: 'middle' },
        { x: 94, y: 56, text: 'indic-conformer', anchor: 'middle' },
      ],
    },
    {
      key: 'n2',
      cx: 26,
      cy: 104,
      filled: true,
      labels: [
        { x: 26, y: 117, text: 'Register', anchor: 'middle' },
        { x: 26, y: 126, text: 'Photo', anchor: 'middle' },
      ],
    },
    {
      key: 'n3',
      cx: 94,
      cy: 104,
      filled: false,
      labels: [{ x: 94, y: 117, text: 'OCR', anchor: 'middle' }],
    },
    {
      key: 'n4',
      cx: 156,
      cy: 69,
      filled: false,
      labels: [
        { x: 165, y: 80, text: 'Structured', anchor: 'start' },
        { x: 165, y: 89, text: 'Extraction', anchor: 'start' },
        { x: 165, y: 98, text: 'Gemma-4', anchor: 'start' },
      ],
    },
    {
      key: 'n5',
      cx: 226,
      cy: 34,
      filled: true,
      labels: [
        { x: 226, y: 47, text: 'Swasth Bharat', anchor: 'middle' },
        { x: 226, y: 56, text: 'Fields', anchor: 'middle' },
      ],
    },
    {
      key: 'n6',
      cx: 156,
      cy: 134,
      filled: false,
      labels: [
        { x: 156, y: 147, text: 'Clinical Rule', anchor: 'middle' },
        { x: 156, y: 156, text: 'Engine', anchor: 'middle' },
        { x: 156, y: 165, text: 'CBAC / PHQ-2', anchor: 'middle' },
      ],
    },
    {
      key: 'n7',
      cx: 226,
      cy: 134,
      filled: true,
      labels: [{ x: 226, y: 147, text: 'Flags', anchor: 'middle' }],
    },
  ],
  sequence: [
    'n0', 'e0', 'n1', 'n2', 'e1', 'n3', 'e2', 'e3',
    'n4', 'e4', 'n5', 'e5', 'n6', 'e6', 'n7',
  ],
  labelled: ['e5'],
};

/* -------------------------------------------------------------- projects */

export type ProjectId = 'f1' | 'arogya';

export type Project = {
  id: ProjectId;
  title: string;
  description: string;
  tags: string[];
  accent: DiagramAccent;
  /** Diagram sits left of the copy on the first row, right on the second. */
  diagramFirst: boolean;
  diagram: DiagramSpec;
};

export const projects: readonly Project[] = [
  {
    id: 'f1',
    title: 'F1 Race Prediction & Q&A Platform',
    description:
      'A two-stage XGBoost pipeline predicts race outcomes, paired with a RAG layer over Qdrant that answers natural-language questions about drivers, teams, and race history.',
    tags: ['XGBoost', 'RAG', 'Qdrant', 'Python'],
    accent: 'blue',
    diagramFirst: true,
    diagram: f1Diagram,
  },
  {
    id: 'arogya',
    title: 'ArogyaLink',
    description:
      'A rural health-data platform combining automatic speech recognition and OCR for data capture with a deterministic clinical rule engine, built to work in low-connectivity settings.',
    tags: ['ASR', 'OCR', 'Rule Engine', 'Full-stack'],
    accent: 'coral',
    diagramFirst: false,
    diagram: arogyaDiagram,
  },
] as const;

export const projectsHeading = 'Projects';

export type OtherProject = {
  /** Also the constellation project id, so hovering a row lights its tools. */
  id: string;
  name: string;
  description: string;
  tag: string;
  /** Set to a URL to render a repo link; 'TODO' renders none. */
  repoUrl: string;
};

export const otherProjects = {
  heading: "Other things I've built",
  items: [
    {
      id: 'syntaxChecker',
      name: 'C Language Syntax Checker',
      description: 'A syntax checker for C source code, written in C from scratch.',
      tag: 'C',
      repoUrl: 'TODO',
    },
    {
      id: 'riscvAssembler',
      name: 'RISC-V Assembler and Simulator',
      description: 'Translates RISC-V assembly into machine code and simulates its execution.',
      tag: 'Python',
      repoUrl: 'TODO',
    },
  ] satisfies OtherProject[],
} as const;

/* ----------------------------------------------------------------- stack */

export type StackTier = 'prod' | 'proj' | 'found' | 'artifact';

/**
 * Visual weight in the constellation:
 *   core     filled disc + halo   — production work
 *   node     outlined disc        — project work
 *   root     large open ring      — foundational languages
 *   leaf     small open ring      — foundational libraries
 *   artifact coral square         — built from scratch
 */
export type StackShape = 'core' | 'node' | 'root' | 'leaf' | 'artifact';

export type StackTool = {
  id: string;
  label: string;
  tier: StackTier;
  shape: StackShape;
  x: number;
  y: number;
  detail: string;
};

export const stackTools: readonly StackTool[] = [
  { id: 'c', label: 'C', tier: 'found', shape: 'root', x: 110, y: 240, detail: 'C syntax checker and RISC-V assembler, both written from scratch.' },
  { id: 'cpp', label: 'C++', tier: 'found', shape: 'root', x: 110, y: 330, detail: 'systems work, including the RISC-V assembler.' },
  { id: 'syntax', label: 'C syntax checker', tier: 'artifact', shape: 'artifact', x: 250, y: 190, detail: 'tokeniser and parser for a C syntax checker, written in C.' },
  { id: 'riscv', label: 'RISC-V assembler', tier: 'artifact', shape: 'artifact', x: 250, y: 380, detail: 'two-pass RISC-V assembler emitting machine code.' },
  { id: 'python', label: 'Python', tier: 'proj', shape: 'node', x: 390, y: 285, detail: 'shared runtime across F1 Prediction, ArogyaLink, AIRA and npm triage.' },
  { id: 'pandas', label: 'Pandas', tier: 'found', shape: 'leaf', x: 480, y: 60, detail: 'data preparation across ML coursework and feature prep.' },
  { id: 'xgboost', label: 'XGBoost', tier: 'proj', shape: 'node', x: 500, y: 155, detail: 'two-stage race outcome model in F1 Prediction.' },
  { id: 'sklearn', label: 'Scikit-learn', tier: 'proj', shape: 'node', x: 600, y: 105, detail: 'feature pipeline and baselines in F1 Prediction.' },
  { id: 'tensorflow', label: 'TensorFlow', tier: 'found', shape: 'leaf', x: 630, y: 40, detail: 'deep-learning coursework models.' },
  { id: 'keras', label: 'Keras', tier: 'found', shape: 'leaf', x: 720, y: 70, detail: 'model definitions on top of TensorFlow.' },
  { id: 'qdrant', label: 'Qdrant', tier: 'proj', shape: 'node', x: 700, y: 165, detail: "vector store behind F1 Prediction's RAG Q&A layer." },
  { id: 'pgvector', label: 'pgvector', tier: 'prod', shape: 'core', x: 810, y: 120, detail: "vector storage for AIRA's retrieval layer." },
  { id: 'langgraph', label: 'LangGraph', tier: 'prod', shape: 'core', x: 700, y: 250, detail: 'agent orchestration in AIRA and npm vulnerability triage.' },
  { id: 'pymupdf', label: 'PyMuPDF', tier: 'prod', shape: 'core', x: 815, y: 215, detail: "document parsing in AIRA's ingestion pipeline." },
  { id: 'ast', label: 'AST analysis', tier: 'proj', shape: 'node', x: 610, y: 305, detail: 'static analysis for npm vulnerability triage.' },
  { id: 'fastapi', label: 'FastAPI', tier: 'proj', shape: 'node', x: 505, y: 355, detail: 'prediction and Q&A serving layer in F1 Prediction.' },
  { id: 'django', label: 'Django', tier: 'proj', shape: 'node', x: 395, y: 420, detail: 'backend for ArogyaLink.' },
  { id: 'asr', label: 'ASR', tier: 'proj', shape: 'node', x: 320, y: 480, detail: 'indic-conformer speech capture in ArogyaLink.' },
  { id: 'ocr', label: 'OCR', tier: 'proj', shape: 'node', x: 410, y: 505, detail: 'register digitisation in ArogyaLink.' },
  { id: 'gemma', label: 'Gemma-4', tier: 'proj', shape: 'node', x: 500, y: 480, detail: 'structured field extraction in ArogyaLink.' },
  { id: 'node', label: 'Node.js', tier: 'proj', shape: 'node', x: 585, y: 430, detail: 'backend services alongside Express.' },
  { id: 'express', label: 'Express', tier: 'found', shape: 'leaf', x: 670, y: 470, detail: 'REST APIs in coursework services.' },
  { id: 'mongodb', label: 'MongoDB', tier: 'found', shape: 'leaf', x: 765, y: 435, detail: 'document storage behind those Express services.' },
  { id: 'nextjs', label: 'Next.js', tier: 'prod', shape: 'core', x: 875, y: 320, detail: 'front end for F1 Prediction and the government data platform.' },
  { id: 'react', label: 'React', tier: 'prod', shape: 'core', x: 935, y: 390, detail: 'government data platform UI.' },
  { id: 'typescript', label: 'TypeScript', tier: 'prod', shape: 'core', x: 860, y: 425, detail: 'government data platform, end to end.' },
  { id: 'tailwind', label: 'Tailwind', tier: 'prod', shape: 'core', x: 930, y: 480, detail: 'styling for the government data platform.' },
  { id: 'zustand', label: 'Zustand', tier: 'prod', shape: 'core', x: 815, y: 495, detail: 'client state in the government data platform.' },
] as const;

/** Edge order is load-bearing: opacity keys are assigned by index. */
export const stackEdges: readonly { from: string; to: string; width: number }[] = [
  { from: 'python', to: 'xgboost', width: 1 },
  { from: 'xgboost', to: 'sklearn', width: 1 },
  { from: 'python', to: 'qdrant', width: 1 },
  { from: 'python', to: 'fastapi', width: 1 },
  { from: 'fastapi', to: 'nextjs', width: 1 },
  { from: 'python', to: 'django', width: 1 },
  { from: 'django', to: 'asr', width: 1 },
  { from: 'django', to: 'ocr', width: 1 },
  { from: 'django', to: 'gemma', width: 1 },
  { from: 'python', to: 'langgraph', width: 1 },
  { from: 'langgraph', to: 'pgvector', width: 1 },
  { from: 'langgraph', to: 'pymupdf', width: 1 },
  { from: 'langgraph', to: 'ast', width: 1 },
  { from: 'nextjs', to: 'react', width: 1 },
  { from: 'react', to: 'typescript', width: 1 },
  { from: 'typescript', to: 'tailwind', width: 1 },
  { from: 'react', to: 'zustand', width: 1 },
  { from: 'nextjs', to: 'typescript', width: 1 },
  { from: 'c', to: 'cpp', width: 1.8 },
  { from: 'c', to: 'syntax', width: 1.8 },
  { from: 'cpp', to: 'riscv', width: 1.8 },
  { from: 'c', to: 'riscv', width: 1.8 },
  { from: 'python', to: 'pandas', width: 1 },
  { from: 'sklearn', to: 'pandas', width: 1 },
  { from: 'tensorflow', to: 'keras', width: 1 },
  { from: 'python', to: 'tensorflow', width: 1 },
  { from: 'node', to: 'express', width: 1 },
  { from: 'express', to: 'mongodb', width: 1 },
  { from: 'node', to: 'nextjs', width: 1 },
] as const;

/** Hovering a project row lights the tools it uses. */
export const stackProjects: Readonly<Record<string, { label: string; tools: readonly string[] }>> = {
  f1: { label: 'F1 Race Prediction', tools: ['python', 'xgboost', 'sklearn', 'qdrant', 'fastapi', 'nextjs'] },
  arogya: { label: 'ArogyaLink', tools: ['python', 'django', 'asr', 'ocr', 'gemma'] },
  aira: { label: 'AIRA (internship)', tools: ['langgraph', 'pgvector', 'pymupdf', 'python'] },
  gov: { label: 'Government data platform', tools: ['nextjs', 'react', 'typescript', 'tailwind', 'zustand'] },
  npm: { label: 'npm vulnerability triage', tools: ['python', 'langgraph', 'ast'] },
  syntaxChecker: { label: 'C Language Syntax Checker', tools: ['c', 'syntax'] },
  riscvAssembler: { label: 'RISC-V Assembler and Simulator', tools: ['python', 'riscv'] },
} as const;

/** The narrow-viewport fallback for the constellation. */
export const stackGroups: readonly { label: string; toolIds: readonly string[] }[] = [
  { label: '// production', toolIds: ['pgvector', 'langgraph', 'pymupdf', 'nextjs', 'react', 'typescript', 'tailwind', 'zustand'] },
  { label: '// project', toolIds: ['python', 'xgboost', 'sklearn', 'qdrant', 'ast', 'fastapi', 'django', 'asr', 'ocr', 'gemma', 'node'] },
  { label: '// foundational', toolIds: ['c', 'cpp', 'pandas', 'tensorflow', 'keras', 'express', 'mongodb'] },
  { label: '// built from scratch', toolIds: ['syntax', 'riscv'] },
] as const;

export const stackSection = {
  heading: 'Tech Stack',
  restingDetail:
    'Node size and weight mark depth: filled for production work, outlined for project work, light for foundations.',
  restingHint: 'hover a tool to see where it was used · click to filter the projects above.',
  filteredHint: 'projects below are filtered to this tool.',
  clickHint: 'click to filter the projects above.',
  projectHint: 'hover any node for detail.',
  clearLabel: 'clear',
} as const;

/* ------------------------------------------------------------------- now */

export const now = {
  heading: 'Currently Working On',
  items: [
    'Building a triage tool that scores and prioritizes npm dependency vulnerabilities.',
    'Researching agentic control patterns for federated learning systems.',
    'Preparing for Smart India Hackathon 2026.',
  ],
} as const;

/* --------------------------------------------------------------- contact */

export const contact = {
  heading: "Let's build something.",
  blurb: 'Open to internships, collaborations, and interesting problems.',
  linkLabels: {
    github: 'GitHub ↗',
    linkedin: 'LinkedIn ↗',
    email: 'Email ↗',
  },
  footerLeft: 'Shresht Ashish © 2026',
  footerRight: 'Nirma University · CS',
} as const;

export const projectsUi = {
  clearFilterLabel: 'clear filter',
} as const;
