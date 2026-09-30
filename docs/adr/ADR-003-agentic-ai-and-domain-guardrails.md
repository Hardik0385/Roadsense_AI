# ADR-003: Agentic AI Controller, Grounding & Strict Domain Boundaries

## Status
Accepted

## Context
Enterprise fleet controllers need an intelligent copilot (analogous to Motorq Fuse) to analyze corridor stress, recommend detours, check weather, and dispatch emergency patrols. However, public LLMs suffer from hallucinations, rate limits, and off-topic vulnerabilities.

## Decision
1. **Multi-Tier Cascade with Fallback:** Uses high-parameter models (`Qwen 2.5 72B` / `Llama 3.3 70B`) with automatic fallback to a local deterministic heuristics engine in case of API rate limits or network degradation.
2. **Deterministic Domain Guardrails:** Enforces system-level prompts and regex checks to reject off-topic questions (e.g., non-fleet queries) while responding precisely to road stress, corridor disruptions, Indian weather, and vehicle telemetry.
3. **Live Grounding Context Injection:** Every prompt is grounded with live TomTom incident coordinates, congestion delays, and active fleet OBD-II signals across 16 Indian metropolitan hubs.

## Consequences
- **Positive:** Delivers reliable, grounded operational decisions with 99%+ uptime and zero off-topic exposure.
- **Negative:** Requires active context caching to minimize LLM token payload size.
