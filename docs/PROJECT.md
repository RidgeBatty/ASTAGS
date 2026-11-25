# ASTAGS — project description and goals

**Status:** initial project charter and technical direction; proposed, not an implementation specification or a description of existing functionality.

## 1. Background and scientific motivation

ASTAGS originates in Tuukka Kauhanen and Hannu Kalavainen's presentation *Automated Semantic Tagging of the Göttingen Septuagint Apparatus* at the 2019 SBL Annual Meeting in San Diego (manuscript version 20 November 2019). ASTAGS stands for Automated Semantic Tagging of the Göttingen Septuagint Apparatus. The project now aims to generalize the approach while preserving the scientific requirements established in that work.

The critical apparatus of a scholarly edition compresses a substantial body of textual evidence into a specialized notation. It describes variation relative to the editorial text, the witnesses that attest readings, the nature of their testimony, editorial observations, and sometimes relevant evidence from translations or quotations. An experienced textual critic can interpret these conventions, but ordinary digital text searches cannot reliably recover their meanings or relationships.

The 2019 paper identifies cases in which existing electronic apparatuses misidentify a manuscript-group abbreviation as a Latin word, a superscript as a different witness, or a page number as a manuscript siglum. It also describes limitations arising from unexpanded witness groups, absent links to the main text and the lack of lexical and grammatical annotation. These examples motivate semantic tagging rather than a merely typographical digital reproduction.

The original proposal describes an automatic, data-driven algorithm informed by an XML schema, an XML skeleton and reference files. It envisages character-level preprocessing, tokenization, contextual classification, backtracking, lemma matching and XML generation, as well as later database import and scholarly analysis. The supplied XS:SVTG schema embodies detailed distinctions for Göttingen apparatus notation. It is intended to capture the content of existing apparatuses, not necessarily to define the optimal database representation. This distinction is important for the successor.

## 2. Mission and scope

The mission is to make the scholarly information encoded in critical apparatuses computationally accessible, without losing the evidence or hiding the uncertainty on which scholarly conclusions depend.

ASTAGS should become both an adaptable parsing platform and a practical web-based research environment. It must be usable by scholars who do not program, while producing sufficiently transparent and interoperable data for technical users, edition projects and downstream research software.

The Göttingen Septuagint is the primary development and validation domain. The initial parser will address a well-defined subset of its notation, then broaden coverage across volumes and apparatus types. The longer-term ambition is to support apparatuses from other textual traditions, including classical and biblical editions, through configurable edition profiles and isolated extension mechanisms.

“Any apparatus” is an aspirational capability, not a promise that arbitrary undocumented notation can be interpreted automatically. An edition may require a new grammar, a registry, scholarly input or previously unsupported semantic constructs. Some information may be irrecoverable from plain text or OCR, even with a correct profile. The software should identify such limits rather than manufacture an interpretation.

## 3. Core project goals

### 3.1 Semantic recognition and structure

Identify the informational roles and hierarchical relationships of apparatus components, including variation units, lemmas, variant readings, operators, attestations, witness groups, witness qualifications, bibliographical citations, notes, subvariants and other edition-specific constructs.

The target is interpretation, not simply labelling fragments of a string. A hyphen may denote a range, a group connector, an exclusion or an abbreviation depending on context. A Roman numeral may be a citation volume or part of a different notation. The parser must use grammatical constraints and reference information to distinguish plausible readings of the notation.

### 3.2 Main-text alignment

Link variation units and individual readings to the appropriate portions of the base text. Support explicit and implicit lemmas, repeated words with ordinal markers, ranges, abbreviated forms, transpositions, omissions, additions and cross-passage references. The model should support insertion anchors, discontiguous spans and unresolved targets where necessary, rather than forcing every variation into a single continuous word range.

Distinguish the apparatus lemma (the base-text segment under discussion) from linguistic lemmatization (identification of a dictionary headword). Morphological and lexical annotation can be added separately to base-text and variant words, supporting later linguistic queries.

### 3.3 Witness and attestation resolution

Treat witness sigla as references to scholarly entities and distinguish explicit testimony from inferences based on the notation. Handle manuscript hands and corrections, group membership, exclusions, qualifications, ancient versions, patristic sources and other evidence as appropriate to the edition.

The availability of a witness may vary by passage. General attestation information, including the Göttingen Kopfleiste, is essential for interpreting implicit attestations and expressions such as *rel* or *rell*. A witness that is not available at a passage must not be treated as attesting the editorial text simply because it is absent from the variant list.

Where group expansion is possible, retain both the original group notation and its resolved members, including the rules and reference data used. Keep unresolved or disputed memberships visible.

### 3.4 Reliable, interoperable data

Produce machine-readable data with precise source references, stable identifiers, typed relationships and explicit uncertainty. Support TEI-derived XML (initially including the existing XS:SVTG vocabulary where appropriate), structured JSON and later database or research-specific exports. Validate exported documents against the intended schema version and check semantic constraints separately.

Preserving the supplied scholarly information is more important than reproducing the exact shape of a historical XML output. The existing schema's custom elements must nevertheless be understood and mapped deliberately; they should not disappear merely to simplify implementation.

### 3.5 Usability for researchers

Provide a usable web application for importing, inspecting, correcting, validating, searching and exporting an apparatus. Researchers should be able to examine the connection between an original entry, its interpretation and supporting evidence without having to read XML. Technical users should be able to use the same parsing functionality programmatically.

### 3.6 Extensibility and reproducibility

Make the generic parser independent of the conventions of a single book or edition. Document and version edition profiles, data model contracts, reference resources and exports. Provide repeatable results from the same inputs and versions, and preserve a review trail when human interpretation changes an automatic result.

## 4. Research workflows

The original paper describes searching for forms of a Greek word, identifying variants attested by a manuscript or group, examining agreements between witnesses and recovering continuous witness text. It also proposes using semantic tagging to validate apparatuses in editorial projects and to make compressed apparatus notation more accessible to non-specialists. The following proposed workflows develop those objectives into product requirements.

| Workflow | Intended outcome |
| --- | --- |
| Import and parse | Select an apparatus, main text and edition profile; obtain structured results and a report of unresolved information. |
| Inspect and correct | View the original entry alongside tokens, interpreted components, base-text anchors, witnesses and diagnostics; record a correction without overwriting the source. |
| Witness search | Find readings explicitly or implicitly attested by a witness, group or specified hand, with the basis of each result visible. |
| Witness comparison | Find agreements and disagreements between selected witnesses, filtered by availability, passage, operation and review status. |
| Linguistic research | Search variants by word form, lexical lemma, morphology or operation, when the relevant language annotations exist. |
| Text reconstruction | Recover the attested text of a selected witness or hand to the degree supported by the apparatus, explicitly marking gaps and uncertain segments. |
| Editorial validation | Flag inconsistent lemmas, nonexistent word references, conflicting witness claims or discrepancies with the Kopfleiste for scholarly review. |
| Interoperability | Export validated XML, structured data and attestation tables suitable for external analysis, potentially including genealogical methods such as CBGM-related workflows. |

ASTAGS does not itself establish an original text or decide which variant is oldest. It makes the editorially reported evidence easier to access and investigate. Textual-critical judgement remains with the researcher. Apparatus-based reconstructions must not be represented as full diplomatic transcriptions of manuscripts; they inherit the selectivity and limitations of the critical edition.

## 5. Source material and historical implementation

The historical assets are valuable but have different roles:

- The 2019 paper supplies the research objectives, terminology, example cases and conceptual algorithm.
- The supplied XS:SVTG XSD files (`document.xsd`, `nontei.xsd`, `teibased.xsd`, `xml.xsd`, `dcr.xsd`) describe a TEI-derived representation, including custom elements such as `segRange`, `segImplied`, `segOperator`, `attest`, `witGrp`, `witSpec` and `segExclusion`. Review namespace declarations, schema dependencies and conformance before treating them as production validators.
- Job Purho's Python prototype (30 May 2020 snapshot, commit `8199637c1f55789e230de4eb3cc71acb97ba477d`) contains Genesis and Isaiah input/output examples, contextual heuristics, pointer handling, recursive XML generation, tests and Finnish-language documentation. Its documented requirements and known problems supply useful test cases.

The prototype demonstrates that meaningful partial tagging is achievable. It also illustrates architectural risks. Its parsing rules are distributed among regular expressions, modules and configuration files; pointer information is embedded in intermediate strings; XML-element selection drives much of its interpretation; and first-match recognition can misclassify ambiguous content. Purho's own TODO notes discuss replacing the intermediate string structure, incomplete multiword implicit lemma handling, general attestation, testing and validation.

The proposed successor should learn from these experiments but should not assume that the existing code or generated XML is a reliable reference implementation. Preserve historical materials separately. Extract scholarly examples and requirements, validate them with domain experts, and independently implement a coherent parsing pipeline. Review reuse permissions before copying code or distributing any source data.

## 6. Proposed architecture

The following responsibilities are logical boundaries, not prescribed packages or a fixed deployment topology.

```text
 Main text + apparatus + source metadata
                   |
        Ingestion / normalization
                   |
        Lossless lexical analysis
                   |
           Syntactic parser <---- Edition profile
                   |              grammar, lexicons,
           Semantic resolution <-- registries, rules
                   |
     Structured model + diagnostics
                   |
     Validation / review / corrections
                   |
       +-----------+-----------+
       |           |           |
      XML        JSON     Research queries
       |           |           |
       +-----------+-----------+
                   |
        Web application / API / CLI
```

Although the diagram presents a logical sequence, the implementation may use constrained lookahead, backtracking, incremental parsing or semantic feedback to disambiguate a grammatical structure. It should not impose artificial one-way dependencies where real apparatus conventions require context.

### 6.1 Input and source representation

Begin with documented UTF-8 plain-text input conventions for the available Göttingen samples. Preserve the original document and record passage boundaries, source IDs and spans. Introduce adapters for formatted documents or OCR-derived text later, when examples and rights permit. Retain typographic evidence (italic, superscript, subscript and other relevant runs) whenever supplied. Flag its absence where it prevents confident interpretation.

Normalization should produce a separate comparison representation, not rewrite the source. Define normalization rules explicitly: Unicode forms, combining marks, dash variants, abbreviation punctuation and accent handling may be important to different stages. Store a mapping to the original character spans. The original text must remain reconstructable or directly retrievable, with known omissions only when explicitly recorded at ingestion.

### 6.2 Tokenization

Implement one primary, lossless lexical layer. Tokens carry raw text, normalized comparison value where needed, lexical kind or candidate kinds, and source spans. Include whitespace and punctuation or preserve them as explicit trivia. The tokenizer should support configurable separators and multi-character markers, Unicode scripts and meaningful formatting without deciding the final scholarly role of each token.

For example, in `ἐποίησεν] επλασεν 664; εκτισεν Ios I 27`, both `664` and `27` are initially numeric tokens. Distinguishing manuscript attestation from bibliographical pagination is a subsequent interpretation.

### 6.3 Grammar and parsing

A grammar defines permitted arrangements, nesting, delimiters, alternatives and optional or repeated constructs. The parser creates a structured representation of entries, including any ambiguities and unexpected input. The edition profile defines which structures apply; the parser engine provides reusable mechanisms for recognizing them.

The exact formalism is an open design decision. Candidate approaches include recursive descent with explicit grammar rules, parser combinators, or a declarative parser supporting ambiguity and controlled backtracking. Evaluate them against real apparatus examples, including nested witness groups and implicit lemmas. Do not use a first-match regex classifier as the semantic engine. Make rule priority intentional, document ambiguity handling, and bound worst-case search to avoid nonterminating or unresponsive parsing.

A lossless concrete syntax representation (or equivalent source-linked structure) should preserve notation. A semantic representation should express the interpreted information independently of XML. A parser may return multiple candidate structures, not just a single guessed tree.

### 6.4 Semantic resolution

Resolution connects recognized notation to main-text tokens, witness registries, reference works and edition conventions. Lemma alignment should combine explicit anchors, ordinal checks, contextual constraints, candidate word sequences and operation-specific matching. Exact and normalized matches can be distinguished from fuzzy or inferred ones. Keep competing candidates and explanations where appropriate.

Attestation resolution should preserve the original expression as well as expanded witness sets, with qualifications and passage availability. Treat group exclusion as a scoped semantic operation rather than a global text replacement. Bibliographical resolution should use context and source registries, distinguishing an author, cited work, volume and page from manuscript numbers.

The parser must make unsupported evidence visible. An unresolved target is not a sentinel word number; an unknown siglum is not a confirmed witness; an unbalanced expression is not permission to drop its content.

### 6.5 Canonical semantic model

The model should be designed around scholarly concepts, not the UI or a particular XML tree. Its precise types will be specified during the foundation phase. At minimum, investigate these entities and relationships:

| Concept | Required information |
| --- | --- |
| Source document | Stable identifier, edition, text, formatting when available, provenance and rights metadata. |
| Passage and base-text token | Edition-qualified location and stable identifier, source span, raw and comparison forms. |
| Variation unit | Source span, passage association, one or more readings, target relationships and diagnostics. |
| Lemma / target | Explicit or implicit notation, resolved span or anchor, possible alternatives and resolution evidence. |
| Reading | Text or operation, relevant target, attestation expression, notes and nested readings. |
| Witness and group | Registry identifiers, aliases, types, membership rules, hands or other qualifications. |
| Attestation | Explicit or inferred claim, scoped witness expression, expansion, availability and uncertainty. |
| Citation and note | Source reference, content and context; resolved entity when identifiable. |
| Diagnostic / decision | Source span, code, severity, candidates, rule/evidence, review status and relevant versions. |

Maintain an explicit distinction between source facts, parser interpretation, derived conclusions and scholar-approved corrections. A correction should not mutate the immutable input; store it as a reviewable decision that can be applied again when reparsing, or flagged for reassessment when input or profile versions change.

### 6.6 Validation and export

Perform validation at multiple levels: source coverage, grammar/structure, referential integrity, scholarly constraints and export schema validity. For example, verify that an ordinal occurrence exists, a resolved range has sensible endpoints, its pointers refer to the correct edition, and a resolved witness is supported by the applicable reference data. Distinguish errors from incomplete coverage and ambiguous interpretation.

Use proper XML serialization and namespace-aware validation. The existing XS:SVTG vocabulary should inform the export mapping, but a TEI-derived custom schema is not automatically equivalent to standard TEI. Decide and document conformance targets. Other representations should use the same semantic data rather than parse generated XML back into a database.

## 7. Edition profiles and generalization

An edition profile is a versioned bundle of scholarly conventions and parsing rules. Profiles should be inspectable and editable by appropriately trained users, with validation and test examples. They may inherit common conventions where this does not obscure differences between editions.

A profile should specify input organization, reference syntax, token classes and separators, typography conventions, grammar, operator and abbreviation definitions, witness/source registries, group membership and exclusions, availability rules, normalization, ambiguity constraints, export mapping and applicable validation rules. Not every profile needs all features; the engine must distinguish unsupported features from omitted configuration.

Start with Göttingen Genesis and Isaiah as available sample materials, subject to rights and expert verification. Test a second volume or substantially different convention early enough to expose assumptions in the engine. Generalization beyond Göttingen requires its own profiles and test material. Avoid both hardcoding the first edition and designing an excessively abstract framework without concrete examples.

## 8. Researcher application

The intended web application should combine a parser development workspace with a research-oriented interface. The first useful interface need not be elaborate: selection of source and profile, parsing a passage or document, viewing tokens and interpretation side by side, and navigating diagnostics would already support parser development and scholarly review.

Later workflows should include project management, editable profile definitions, batch parsing, side-by-side apparatus and main-text alignment, correction history, search and filters, witness comparisons, data visualization and exports. A researcher should be able to navigate from a search result to the interpreted reading, its original notation and the evidence behind its witness and lemma resolution. An editor should be able to correct a result without editing XML manually.

Design for scholarly work: support polytonic Greek, Hebrew and other relevant scripts; keyboard navigation; clear differentiation between source text and inferred information; accessible colors and readable layouts. Distinguish manual correction of a particular entry from modification of a general profile rule, which may affect many entries. Preview and test the consequences of rule changes.

Deployment, authentication, collaboration and storage are open decisions. Begin with a minimal workflow that does not require publishing or uploading protected research material to third parties. Plan for local or controlled processing, data portability and retention policies. More complex multi-user features should follow demonstrated needs.

## 9. Technology direction

JavaScript/TypeScript and Node.js are the preferred starting point because the intended product is a web application, and a common language across the core and web layers may reduce integration complexity. TypeScript is a strong candidate for the domain model and parser contracts. JavaScript itself is also viable if equivalent contracts and tests are maintained.

This does not mean a Node.js backend is mandatory, or that the browser must perform all parsing. Keep the core independent of deployment choices, with serializable results and explicit interfaces. Evaluate whether browser-side execution, workers, a server-side Node.js process or a separate service is appropriate for realistic document sizes, validation needs and privacy constraints.

Python or another language can be adopted for specialized tasks or the core if there is a demonstrated advantage, for example in morphological analysis, existing scholarly tooling, or XML validation. Avoid premature polyglot complexity; introduce language boundaries only with a clear reason. Do not select a framework, database, parser library or exact runtime version until a small technical evaluation has established suitability.

AI is a potential adjunct, not a substitute for the core. It may help suggest interpretations of unresolved notes, draft profile rules or translate research questions into structured queries. AI-generated suggestions must be traceable, reviewable and distinguishable from deterministic or scholar-approved results. No core function should rely on an external LLM, and protected data must not be transmitted without authorization.

## 10. Development roadmap and acceptance criteria

The phases are proposed increments, not scheduled commitments. The development corpus and tests grow throughout; early validation and UI inspection should accompany the core rather than being deferred until the end.

| Phase | Deliverables and exit criteria |
| --- | --- |
| 0. Foundation | Agree on a minimal domain model, profile contract and technology direction. Audit the schema, data rights and available scholarly references. Establish a small set of manually verified fixtures and a reproducible test setup. |
| 1. Lossless lexical layer | Import representative plain-text entries and emit source-linked tokens. Exact source reconstruction (or equivalent verified coverage) for every fixture; Unicode, separator and malformed-input tests pass. No character silently disappears. |
| 2. Vertical parsing slice | Parse a small documented set of variation units with explicit lemmas, readings and simple attestations. Return structured results, unknown fragments and diagnostics. Demonstrate multiple entries and nested notation, with deterministic regression tests. Provide an inspection tool, initially CLI or minimal web view. |
| 3. Semantic resolution | Link explicit and selected implicit lemmas to base-text anchors; resolve known witnesses, groups, exclusions and citations against reference data. Test repeated words, ambiguous candidates, availability and invalid references. Establish separate measures for each task. |
| 4. Review and interchange | Provide a researcher workflow for inspection, correction, validation and export. Verify the applicable XSD, semantic invariants and mappings. Persist source provenance and correction history. |
| 5. Research functionality | Add structured queries, witness comparison and evidence-limited text reconstruction. Add lexical/morphological enrichment where supported. Validate query results against expert-reviewed examples. |
| 6. Broader coverage | Extend Göttingen profiles and validate on held-out material from other volumes and traditions. Document supported constructs, unresolved cases and profile portability. |

The first implementation should focus on phases 0–2, including a small end-to-end demonstration rather than attempting every construct at once. The existing XSD and research goals should inform the design from the outset, but should not dictate how the parser internally represents syntax or meaning.

## 11. Quality and scientific evaluation

A successful run is not equivalent to a correct interpretation. A schema-valid document can still contain incorrectly tagged witnesses, false lemma references and invented attestations. A benchmark must use independently reviewed expected results rather than historical XML as ground truth.

Track at least:

- Source coverage and preservation: whether all input information is represented or traceably retained.
- Syntactic recognition: correct boundaries, nesting and roles for reviewed examples.
- Lemma alignment: correctness of resolved spans and anchors, separated by explicit and implicit cases.
- Witness resolution: precision and recall of identified witnesses, qualifications and group expansions, with availability considered.
- Uncertainty and diagnostics: unresolved/ambiguous rates, false confident interpretations and usefulness of error messages.
- Research utility: correctness of query results, fidelity of witness reconstructions within reported evidence and the effort required for manual correction.
- Operational quality: deterministic processing, runtime and memory behavior on realistic inputs, and recovery from malformed entries.

Report denominators, coverage and limitations alongside accuracy measurements. Keep an independent evaluation set to distinguish real improvement from tuning rules to known examples. A small number of explicitly unresolved cases may be preferable to a larger number of plausible but incorrect interpretations. No numerical quality threshold is set before a representative baseline and scholarly acceptance criteria exist.

## 12. Open decisions and risks

The following questions require investigation or team decisions before the related functionality is committed:

| Decision or risk | Proposed approach |
| --- | --- |
| Runtime and language | Prototype a small representative slice in JS/TS; evaluate specialized alternatives only against concrete requirements. |
| Grammar formalism | Test ambiguity, nesting, recovery, extensibility and maintainability on reviewed apparatus examples. |
| Semantic model and IDs | Agree on stable edition-qualified identifiers, source span units, target types and uncertainty/provenance contracts. |
| Reference data | Obtain and verify edition-specific witness lists, group membership, abbreviations and availability rules. Establish ownership and versioning. |
| XML schema | Audit the supplied XSD and distinguish historical custom vocabulary, supported export contracts and standard TEI conformance. |
| Data rights and license | Clarify permissions for historical code, schema, examples and commercially distributed apparatus texts before redistribution. Select the successor's license separately. |
| Lost typography and editorial ambiguity | Preserve formatting when present; expose missing evidence and permit explicit scholarly review. |
| Scope and cost | Validate a limited vertical slice first, then expand supported notation and research features incrementally. |
| Storage and deployment | Defer database/framework choices; assess local processing, security, project sizes and collaboration requirements. |

## 13. Guiding principle

Automate interpretations justified by the available evidence, expose those that cannot be justified, and never silently lose scholarly information. The success of ASTAGS should ultimately be measured not by the amount of XML it generates, but by the reliability, accessibility and usefulness of the textual-critical evidence it makes available to researchers.

## Source basis

1. Kauhanen, Tuukka, and Hannu Kalavainen. “Automated Semantic Tagging of the Göttingen Septuagint Apparatus.” SBL Annual Meeting, San Diego, 2019. Presentation manuscript, version 20 November 2019. Supplied as `Kauhanen_and_Kalavainen_SBL_San_Diego_20.11.2019.docx`. Particularly the sections on SVTG electronic text, the XML schema, use cases and automated tagging.
2. `Schema.zip`: supplied XS:SVTG schema files. Their elements and namespaces inform the proposed semantic requirements; schema validity and reuse rights remain to be confirmed for the new application.
3. Purho, Job. ASTAGS Python prototype, archive `astags-master.zip`, snapshot 30 May 2020, commit `8199637c1f55789e230de4eb3cc71acb97ba477d`. See `docs/vaatimusmaarittely.md`, `docs/ongelmat.md`, `docs/todo.md`, and the `astags/domain/` modules. Repository: https://github.com/jobpurho/astags.

The architectural decomposition, web application workflows, preferred language direction, roadmap and quality strategy are proposals for the successor, not claims that the historical project already implements them.
