# Bank Statement Analyzer - Prompt Engineering Solution


## 1. Prompt Changes: Base vs. Optimized

# Prompt Changes Summary

The original base prompt lacked output format specifications, provided no category definitions, used vague instructions like "look at" and "tell me," and imposed no accuracy requirements or validation steps.

- To address these issues, the optimized prompt introduced five major improvements. First, it established structured requirements upfront, explicitly mandating accuracy, client focus, and a strict JSON schema to create clear guardrails. 

- We defined 14 specific categories including Housing, Utilities, and Transportation, each accompanied by examples. This prevents the AI from inventing arbitrary categories and ensures consistency across analyses.

- added a step-by-step analysis framework containing five explicit stages: calculating summary statistics, categorizing every transaction, performing monthly comparisons, distinguishing recurring from one-time expenses, and generating insights, as requested by the challenge. 

- The optimized version integrated Chain of Thought reasoning by adding explicit verification prompts such as "Verify your calculations against balance changes" and "Think step by step." These encourage the model to self-check before outputting results. 
- A strict JSON schema with required fields, data types, and nested structures eliminated ambiguous responses and enabled programmatic validation.

---

## 2. Hallucination Mitigation Strategies

- The first line of defense established explicit constraints through direct commands such as "NO HALLUCINATIONS: Only report information directly derivable from the provided data" and "No information is fabricated or assumed." 

- The solution also implemented a closed category system containing exactly 14 predefined categories with "Other" serving as a fallback option. This constraint prevents the model from inventing arbitrary categories. 

- To catch arithmetic errors and inconsistencies, the prompt mandated calculation verification steps. Instructions like "Verify your calculations against the balance changes" and "Compare calculated net cash flow with actual balance changes" force the model to cross-validate its computations and identify discrepancies before producing final outputs.

- Example-based grounding further anchored the model to real-world patterns by providing concrete illustrations throughout the prompt, such as "Netflix (monthly), rent (monthly), gym (monthly)" for recurring expenses and "Flight tickets, electronics, furniture" for one-time purchases. These examples steer the model away from abstract speculation.

- The prompt uses sentences like "from the data," "observed in the data," and "data-backed" as an attempt to reminds the model to ground based on the source material. 

---

## 3. Prompt Testing Approach

I validated the improvements by iterating directly with ChatGPT using established prompting best practices and treating prompts as versioned system components within the software lifecycle. I tested each prompt version against the target model to confirm it consistently followed instructions, refining wording and structure until the behavior stabilized. I then validated outputs in two concrete ways: first by enforcing strict JSON schema parsing and type checks to ensure structural correctness, and second by manually and programmatically verifying arithmetic consistency so category totals, monthly aggregates, and overall expenses matched exactly. This combination of iterative model testing, schema validation, and numerical verification confirmed that the optimized prompt produced reliable, repeatable, and correct results.


An alternative approach, if the CSV structure is known in advance, is to compute the metrics beforehand using a CSV-based library. This provides more consistent measurements (for example, the most expensive items per month) and exact values when categories are available. After that, we can use LLMs to focus solely on generating insights, reports, and best practices (as a free text outout), without producing JSON output. 

---

## 4. Trade-offs and Compromises

- The first significant compromise involved choosing verbosity over brevity. The optimized prompt grew substantially longer than the original, which increases token consumption and processing time. However, this trade-off expect to guide model to follow exact instructions, and longer prompts reduce downstream errors. 

- We used fixed categories over flexible user-defined options. Users cannot create custom categories under this system, but we can include user-specific ones if the user is interested. The "Other" category serves for edge cases.

- Including the top three individual expenses per category increased output size noticeably. This trade-off introduced higher token costs but delivered actionable detail that users need to verify the analysis and take concrete steps. 

- Finally, we used the Chain of Thought reasoning added overhead in both processing time and token usage. The accuracy improvements this technique increases computational cost, but better downstream task performance.