# Roadmap

Each milestone is small enough for a weekend and teaches one specific thing. The ✍️ milestones are **hand-written**: use Claude to explain concepts and review your code, but you type the implementation.

> **Learning rule of thumb:** when you get stuck, ask Claude *"explain why this test fails"* or *"what concept am I missing?"*, not *"write it for me."* Commit before asking for a review, so the diff shows what you wrote.

---

### ✅ M0: Scaffold (done)
Server boots, `sap_list_services` works, the tests describe the rest.
**Try it:** `npm run inspect`, then call `sap_list_services` in the Inspector UI.

### ✍️ M1: OData query builder (`src/odata/query.ts`)
Make `npm test -- query` pass.
**You'll learn:** OData V2 system query options, URL encoding (`encodeURIComponent` and its edge cases), deterministic output, and TDD.

### ✍️ M2: Response normalizer (`src/odata/normalize.ts`)
Make `npm test -- normalize` pass. Then make your first real query in Claude Desktop.
**You'll learn:** recursion over unknown JSON, TypeScript narrowing (`unknown` → typed), and regex. You'll also see why OData V2 dates are weird.
**Milestone moment:** record the demo GIF for the README here.

### M3: Better metadata
Replace the regexes in `metadata.ts` with `fast-xml-parser`. Cache `$metadata` per service in memory, since it's big and rarely changes.
**You'll learn:** XML parsing, caching strategy, and keeping the existing tests green while you refactor.

### M4: Mock mode + CI
Add `SAP_MODE=mock`, which serves fixture JSON from `test/fixtures/` instead of calling SAP. Add a GitHub Actions workflow that runs `typecheck` and `test` on every push.
**You'll learn:** dependency injection (swap the client), fixtures, and CI. Your repo will get a green badge.

### M5: MCP resources + prompts
Expose each service's metadata summary as an MCP **resource**. Add a **prompt** such as `analyze-sales-orders`.
**You'll learn:** the other two MCP primitives besides tools.

### M6: Real auth
Support OAuth2 client credentials (BTP trial / S/4HANA Cloud trial) alongside the sandbox APIKey header.
**You'll learn:** OAuth flows and token caching/refresh. It maps directly to real SAP integration work.

### M7: Ship it
Publish to npm so people can use `npx sap-odata-mcp`. Write a short blog post or LinkedIn write-up.
**You'll learn:** packaging, semver, and explaining technical work to non-engineers.

---

### Stretch ideas
- OData **V4** support (newer S/4HANA APIs use it: `$count`, different JSON shape)
- A `sap_explain_filter` tool that validates a `$filter` against metadata *before* calling SAP
- Streamable HTTP transport so it can run as a remote server
- A small evaluation set: 10 business questions and whether the agent answers each one correctly
