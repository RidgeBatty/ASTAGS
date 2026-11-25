# AGENTS.md — ASTAGS development instructions

## Purpose and scope

ASTAGS is scientific software for automatically interpreting critical apparatuses and providing reliable research data. Read [README.md](README.md) and [docs/PROJECT.md](docs/PROJECT.md) before making architectural or semantic changes. These documents describe the proposed successor, not the current capabilities of the historical prototype.

Treat the 2019 Kauhanen–Kalavainen paper, supplied XS:SVTG schema, edition introductions, witness lists and verified examples as domain references. Job Purho's 2020 prototype is a historical experiment and a useful source of edge cases, not a normative specification. Preserve its source and research data unchanged. Do not port its implementation wholesale.

## Non-negotiable engineering rules

1. **Preserve the source.** Never silently discard, alter or invent scholarly information. Retain exact source text, whitespace, punctuation, meaningful formatting and stable source spans wherever provided. Record normalization separately, with mappings back to the source. Missing input information must remain distinguishable from information removed by processing.
2. **Separate lexical, syntactic and semantic analysis.** A number is not inherently a witness; a dash is not inherently a range or an exclusion. Tokenization establishes lexical properties, grammar establishes structure, and context plus scholarly reference data establish interpretation. Implement these responsibilities as distinct, testable stages, allowing controlled feedback where needed.
3. **Use structured data.** Pass typed records, tokens, syntax trees and semantic objects between stages. Never encode intermediate state by inserting private delimiters or magic markers into source strings. XML, JSON and database representations are outputs, not the parser's controlling state.
4. **Represent uncertainty explicitly.** Use defined states such as resolved, ambiguous, unresolved and invalid. Retain candidate interpretations, evidence and diagnostics where applicable. No magic pointer values, fabricated witness IDs, guessed defaults or hidden fallbacks. A failed match is not a valid match.
5. **Keep the engine edition-independent.** Store edition-specific lexical conventions, grammars, sigla, witness membership, reference rules and mappings in versioned profiles. General mechanisms belong in the engine. Profile-specific extension code is acceptable when justified and isolated behind a documented interface.
6. **Reproducibility and auditability come first.** For identical input, configuration and engine versions, deterministic stages must produce identical semantic results. Record rule/profile versions, reference data versions, source locations and manual decisions. Do not optimize by compromising correctness.

## Technology and architecture

- Prefer JavaScript/TypeScript with Node.js as the initial direction for a web-facing, independently testable core. Favor TypeScript for explicit domain contracts if the team adopts it. This is a preference, not a settled stack decision.
- Do not introduce a web framework, parser library, database, AI service or Python subprocess merely because it is familiar. Establish the requirement, evaluate alternatives and document consequential choices. Python or another language is acceptable if it offers a clear advantage and the integration contract is explicit.
- Keep the core usable from automated tests, a CLI or API independently of the UI. No DOM, UI state, network access or database dependencies in the core parsing logic unless a narrowly justified boundary is documented.
- Separate ingestion/normalization, tokenizer, grammar parser, semantic resolution, validation, serialization and user-facing presentation. Use explicit input/output contracts and typed error results. Separate pure computation from file I/O and other side effects.
- Prefer a declarative grammar and rule system over scattered regex dispatch. Regular expressions are useful for lexical recognition, not a substitute for contextual parsing. Specify precedence, lookahead, bounded ambiguity and recovery behavior. Validate profile definitions, reject duplicate keys and diagnose contradictory or invalid rules.
- Preserve a lossless syntax representation and a distinct semantic model (or equivalent explicit contracts). Use stable edition-qualified identifiers, not hardcoded book numbers or position sentinels. Document coordinate units for spans, including Unicode and UTF-16 considerations in JavaScript.
- Keep exports separate from interpretation. Use XML APIs for namespace-aware serialization, never global replacements on serialized documents. Treat the supplied schema as a scholarly reference requiring verification, not a presumed valid or unmodified TEI schema.

## Scholarly interpretation

- Use edition- and passage-specific reference information, including the Kopfleiste and witness group definitions, rather than accepting arbitrary strings or numbers as confirmed witnesses.
- Distinguish witnesses, editions, versions, patristic sources, hands, correctors and other attestation qualifications. Preserve group expressions as written as well as any justified expansion. Missing, excluded and unattested are different states.
- Resolve main-text spans using exact matches, occurrence markers, explicit boundaries and contextual evidence. Fuzzy matching is a candidate-generation technique, not proof. Never accept an unavailable ordinal or ambiguous best match as certain.
- Keep textual lemma (the passage referred to by the apparatus) distinct from lexical lemma (dictionary headword). Morphological analysis is a separate enrichment step.
- Treat reconstructed witness text as evidence-limited. Preserve lacunae, uncertainty, incomplete attestation and conflicting readings. Do not invent readings or assume every non-listed witness supports the main text without an applicable convention and availability evidence.
- Any AI assistance must be optional and explicit, with provenance and review status. Do not send unpublished or restricted scholarly materials to external services without authorization. Core functionality must not require an LLM.

## Implementation workflow

- Inspect relevant code, source documents and tests before editing. If a scholarly convention is unclear, consult the edition reference material or request clarification; preserve uncertainty until a decision is justified.
- Work in small vertical slices with a focused objective and regression tests. Do not build large speculative abstractions or unrelated UI features before the parser contracts are established.
- Before implementing a parsing feature, identify representative examples and expected results. Use scholar-reviewed examples as the reference standard; do not assume historical generated XML is correct.
- Add a regression test for each fixed bug. Test the generic mechanism and its edition-specific behavior separately. Include malformed and ambiguous input, Unicode variants, repeated words, nested structures and unknown sigla.
- Test preservation by reconstructing the original source from tokens or equivalent source mappings, including whitespace and punctuation. Test deterministic behavior and stable identifiers. Include cross-passage boundaries and invalid references.
- Validate generated XML structurally and check semantic invariants separately. Schema validity alone is never evidence of correct scholarly interpretation.
- Keep dependency versions and execution instructions reproducible once selected. Use the established project's actual test, lint and build commands; do not invent commands before tooling exists. Report what was run, what passed, and what remains unverified.
- Do not make destructive changes, overwrite originals, push to remote repositories, publish data, or make unrelated changes without explicit authorization. Use synthetic or authorized fixtures where possible. Check licenses and attribution before reusing legacy code or data.

## Documentation and completion

Update the relevant documentation with changes to contracts, profiles, scientific assumptions, architecture or supported capabilities. Record significant decisions and trade-offs in a decision log once one exists. Distinguish implemented behavior, experimental features and planned requirements.

A change is complete when it meets its stated acceptance criteria, preserves source information, handles expected failure modes, has appropriate tests and documentation, and its remaining limitations are disclosed. If a test cannot be run or a source cannot be verified, state that explicitly. Do not claim an apparatus is fully parsed or semantically correct merely because processing completed.
