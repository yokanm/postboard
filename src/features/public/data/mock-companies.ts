export interface MockCompany {
	id: string;
	name: string;
	slug: string;
	industry: string;
	description: string;
	logoUrl: string | null;
	bannerUrl: string | null;
	headcount: string;
	openPositions: number;
	hq: string;
	isHiring: boolean;
	founded: string;
	website: string;
	about: string;
	culture: string;
	techStack: string[];
	leadership: { name: string; role: string }[];
	isVerified: boolean;
	verificationStatus: "VERIFIED" | "PENDING" | "NONE";
}

export const MOCK_COMPANIES: MockCompany[] = [
	{
		id: "1",
		name: "Acme Corp Systems",
		slug: "acme-corp-systems",
		industry: "FINTECH_INFRASTRUCTURE",
		description:
			"Building highly concurrent, fault-tolerant ledger systems for next-generation global financial institutions. Utilizing Rust and specialized distributed consensus algorithms.",
		logoUrl: null,
		bannerUrl: null,
		headcount: "50-200",
		openPositions: 12,
		hq: "NEW YORK, NY",
		isHiring: true,
		founded: "2018",
		website: "https://acmecorp.io",
		about:
			"Acme Corp Systems develops high-performance financial infrastructure for tier-1 banks and fintech startups. Our core ledger engine processes over 2 million transactions per second with sub-millisecond latency. We are a remote-first company with engineering hubs in New York, London, and Singapore.",
		culture:
			"We value intellectual rigor, ownership, and transparency. Our engineering culture emphasizes writing correct code over writing fast code — though we pride ourselves on both. We do weekly RFC reviews, maintain a blameless postmortem process, and ship daily.",
		techStack: [
			"Rust",
			"Kubernetes",
			"Apache Kafka",
			"PostgreSQL",
			"Prometheus",
			"Envoy",
		],
		leadership: [
			{ name: "Dr. Elena Vasquez", role: "CEO & Co-Founder" },
			{ name: "Marcus Chen", role: "CTO" },
			{ name: "Sarah Okafor", role: "VP Engineering" },
		],
		isVerified: true,
		verificationStatus: "VERIFIED",
	},
	{
		id: "2",
		name: "Nexus Data Grid",
		slug: "nexus-data-grid",
		industry: "DISTRIBUTED_DATABASES",
		description:
			"Developing a planetary-scale, multi-modal database engine designed for extreme write-throughput and sub-millisecond read latency.",
		logoUrl: null,
		bannerUrl: null,
		headcount: "200-500",
		openPositions: 8,
		hq: "SAN FRANCISCO, CA",
		isHiring: false,
		founded: "2019",
		website: "https://nexusdatagrid.dev",
		about:
			"Nexus Data Grid is building the next generation of distributed database technology. Our hybrid vector-relational engine powers real-time analytics at petabyte scale for the world's most data-intensive organizations.",
		culture:
			"Research-driven and deeply technical. We publish at VLDB, SIGMOD, and CIDR regularly. Every engineer spends 20% time on self-directed research projects. We believe in strong intellectual property protections and offer generous patent bonuses.",
		techStack: ["C++", "Rust", "Apache Arrow", "gRPC", "RAFT", "CUDA"],
		leadership: [
			{ name: "Aiko Tanaka", role: "CEO & Co-Founder" },
			{ name: "James Walker", role: "Chief Architect" },
		],
		isVerified: true,
		verificationStatus: "VERIFIED",
	},
	{
		id: "3",
		name: "Vanguard Sec",
		slug: "vanguard-sec",
		industry: "THREAT_INTELLIGENCE",
		description:
			"Advanced zero-day threat detection leveraging novel machine learning models on network packet streams. Stealth mode startup.",
		logoUrl: null,
		bannerUrl: null,
		headcount: "10-50",
		openPositions: 24,
		hq: "AUSTIN, TX (REMOTE)",
		isHiring: true,
		founded: "2021",
		website: "https://vanguardsec.io",
		about:
			"Vanguard Sec is a stealth-mode cybersecurity startup developing AI-powered threat detection systems. Our platform analyzes network traffic in real-time to identify zero-day exploits before they cause damage. Backed by top-tier security VCs.",
		culture:
			"Mission-driven and intense. We operate with a security clearance mindset even though we don't require one. Every line of code is reviewed by at least two peers. We ship fast but never at the expense of correctness.",
		techStack: [
			"Python",
			"PyTorch",
			"Rust",
			"eBPF",
			"Kubernetes",
			"Apache Flink",
		],
		leadership: [
			{ name: "Raj Patel", role: "CEO & Founder" },
			{ name: "Dr. Lisa Huang", role: "Head of ML" },
			{ name: "Tom Novak", role: "Head of Infrastructure" },
		],
		isVerified: false,
		verificationStatus: "PENDING",
	},
	{
		id: "4",
		name: "Cognitive Labs",
		slug: "cognitive-labs",
		industry: "APPLIED_AI",
		description:
			"Building domain-specific large language models for legal and regulatory compliance analysis.",
		logoUrl: null,
		bannerUrl: null,
		headcount: "50-200",
		openPositions: 3,
		hq: "LONDON, UK",
		isHiring: false,
		founded: "2020",
		website: "https://cognitivelabs.ai",
		about:
			"Cognitive Labs specializes in fine-tuned LLMs for the legal and regulatory sector. Our models achieve 94% accuracy on legal document summarization tasks and are deployed at 3 of the top 10 global law firms.",
		culture:
			"Academic rigor meets startup velocity. We have a strong research culture with weekly paper readings and internal hackathons. Our team includes former DeepMind researchers, legal scholars, and distributed systems engineers.",
		techStack: [
			"Python",
			"PyTorch",
			"Transformers",
			"vLLM",
			"Ray",
			"PostgreSQL",
		],
		leadership: [
			{ name: "Dr. Amara Obi", role: "CEO & Co-Founder" },
			{ name: "David Kim", role: "CTO" },
		],
		isVerified: true,
		verificationStatus: "VERIFIED",
	},
	{
		id: "5",
		name: "Helix Genomics",
		slug: "helix-genomics",
		industry: "BIOTECH",
		description:
			"Computational genomics platform accelerating drug discovery through high-throughput sequencing analysis and protein folding prediction.",
		logoUrl: null,
		bannerUrl: null,
		headcount: "200-500",
		openPositions: 15,
		hq: "BOSTON, MA",
		isHiring: true,
		founded: "2017",
		website: "https://helixgenomics.com",
		about:
			"Helix Genomics operates the world's largest private genomics analysis platform. We process over 500,000 whole-genome sequences annually and partner with 15 of the top 20 pharmaceutical companies for drug target discovery.",
		culture:
			"Life sciences-first engineering. We employ both software engineers and computational biologists who work side-by-side. Our code must be both performant and reproducible — we maintain strict CI/CD for bioinformatics pipelines.",
		techStack: ["Rust", "Python", "Nextflow", "AWS Batch", "DVC", "GraphQL"],
		leadership: [
			{ name: "Dr. Rebecca Feng", role: "CEO" },
			{ name: "Prof. Alan Turing", role: "Chief Science Officer" },
			{ name: "Maria Santos", role: "VP Platform" },
		],
		isVerified: true,
		verificationStatus: "VERIFIED",
	},
	{
		id: "6",
		name: "Arcturus Mobility",
		slug: "arcturus-mobility",
		industry: "AUTONOMOUS_VEHICLES",
		description:
			"Full-stack autonomous driving platform with proprietary LiDAR fusion and real-time path planning at edge-case safety levels.",
		logoUrl: null,
		bannerUrl: null,
		headcount: "500+",
		openPositions: 31,
		hq: "MUNICH, DE",
		isHiring: true,
		founded: "2016",
		website: "https://arcturus-mobility.eu",
		about:
			"Arcturus Mobility is a European autonomous driving leader with over 5 million kilometers of autonomous road testing. Our Level 4 system is deployed in partnership with 3 major automotive OEMs for urban mobility services.",
		culture:
			"Safety-critical software engineering. Our development process follows ISO 26262 and we maintain the highest safety standards in the industry. We believe in rigorous testing, formal verification, and continuous improvement.",
		techStack: ["C++", "ROS 2", "CUDA", "TensorRT", "Simulink", "QNX"],
		leadership: [
			{ name: "Dr. Klaus Weber", role: "CEO" },
			{ name: "Sophie Laurent", role: "VP Engineering" },
			{ name: "Dr. Andrei Popescu", role: "Head of Perception" },
		],
		isVerified: false,
		verificationStatus: "NONE",
	},
];

export function getMockCompanyById(id: string): MockCompany | undefined {
	return MOCK_COMPANIES.find((c) => c.id === id);
}
