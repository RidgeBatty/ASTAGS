# ASTAGS

**Automated semantic tagging of critical apparatuses.**

ASTAGS aims to turn the densely encoded information in scholarly critical apparatuses into reliable, searchable and computationally usable data. Its starting point is the Göttingen Septuagint (SVTG), but the long-term goal is an edition-independent parsing platform that can be adapted to other textual traditions.

The project takes its name and scientific foundation from Tuukka Kauhanen and Hannu Kalavainen's 2019 SBL presentation, *Automated Semantic Tagging of the Göttingen Septuagint Apparatus*. The new application will build on that research, the associated XS:SVTG schema and lessons from Job Purho's 2020 Python proof of concept.

## Why ASTAGS?

A digitized apparatus is not necessarily a semantically encoded apparatus. For example, in `ἐποίησεν] επλασεν 664; εκτισεν Ios I 27`, the numbers 664 and 27 have very different roles: one identifies a manuscript, the other is a page reference in a citation of Josephus. Their meaning depends on context and the conventions of the edition.

ASTAGS should recognize these distinctions automatically, connect variant readings to the main text, resolve witness notation and make the resulting information accessible to researchers without requiring them to write XML or code.

## Intended capabilities

- Import apparatuses and associated main texts, retaining meaningful typography and source provenance whenever available.
- Parse apparatus notation using configurable edition profiles, including grammars, operators, abbreviations and witness registries.
- Recognize lemmas, readings, operations, attestations, witness details, citations and nested structures.
- Resolve explicit and implicit lemmas, witness groups and exclusions against the relevant scholarly reference data.
- Present uncertain or unresolved interpretations for inspection and correction instead of silently guessing.
- Export structured data, including validated TEI-based XML and machine-readable formats.
- Support scholarly search, comparison, linguistic analysis, editorial validation and reconstruction of the recoverable text of individual witnesses.

## Design direction

ASTAGS will be a web application built around an independently usable parsing engine. JavaScript/TypeScript and Node.js are the preferred starting direction; the final stack is not yet selected. Python or another language may be used where a demonstrated requirement justifies it. The parser should be usable without the web interface and should not depend on a particular output schema or database.

The core design separates source ingestion, lossless tokenization, syntactic parsing, semantic resolution, validation and serialization. Edition-specific knowledge belongs in versioned profiles, rather than in the generic parser. Deterministic, reproducible processing is the default. AI-assisted interpretation may be introduced later, but its suggestions must remain distinguishable from established scholarly evidence.

## Project status

**Planning and research phase.** These documents describe the intended successor to the original prototype, not an already implemented application. No new runtime, installation instructions, release, framework or database has yet been established. The historical implementation is reference material, not the presumed foundation of the new codebase.

The first engineering objective is a lossless, configurable tokenizer and a small, well-tested parser capable of producing a structured interpretation of representative Göttingen apparatus entries. Broader coverage, lemma and witness resolution, researcher-facing tools and support for additional editions will follow in validated increments.

## Documentation

- [Project description and goals](docs/PROJECT.md) — scientific objectives, architecture, research workflows, requirements, scope and development roadmap.
- [Development and agent instructions](AGENTS.md) — mandatory working principles for contributors and coding agents.
- [Milestone 1 — First working webapp](docs/milestones/M01.md) — proposed v0.1.0 scope, development passes and release criteria.
- Historical prototype: [jobpurho/astags](https://github.com/jobpurho/astags) (a 30 May 2020 snapshot is available in the project source materials).

## Research provenance and licensing

The intended project is open source, in keeping with the 2019 research vision. The successor's license, attribution requirements and permission to redistribute historical code, schemas and apparatus texts must still be clarified. Access to an edition or a digitized text does not establish redistribution rights. Do not publish protected research material or incorporate unlicensed historical code into the successor without authorization.
