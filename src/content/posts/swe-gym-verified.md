---
title: "What makes good data for training coding agents?"
description: "Coding agents learn from tasks mined from GitHub, each graded by the hidden tests of the original fix. We checked those tests one by one. Most tasks that a model never solves are not hard: they are mislabelled."
date: 2026-11-18
draft: false
cover: /images/swe-gym-verified/cover.svg
hero:
  src: /images/swe-gym-verified/hero.svg
  narrow: /images/swe-gym-verified/hero-narrow.svg
  alt: "Each square is one of the 512 tasks of the original training set, stacked by how often a 9B model solves the task in eight attempts. Red squares are tasks whose hidden tests reject correct fixes: 57 of the 77 never-solved tasks (74%), then 41%, 36%, 16%, 26%, 14%, 8% and 11% of the tasks solved one to seven times."
  caption: "Each square is one of 512 training tasks, stacked by how often a 9B model solves it in eight attempts. Red: the task's hidden tests reject correct fixes."
---

Coding agents are increasingly trained with reinforcement learning. A typical training task is a software
engineering problem sourced from GitHub: an issue, the repository it was filed against, and the pull request that
resolved it. The model reads the issue and writes a patch, and the patch is rewarded if the pull request's original
tests pass. The model never sees those tests.

So what makes such a task good training data? The usual answers are about scale and difficulty: more tasks, more
repositories, harder problems, a filter for the ones that are too hard. This post is about something more basic,
which is whether the reward is right. A task is only as good as the tests that grade it, and those tests are rarely
checked.

We checked them for [SWE-Gym](https://huggingface.co/datasets/SWE-Gym/SWE-Gym),[^swegym] a widely used training set
of this kind, and then trained on the result. In short:

- **Tasks that look too hard are mostly mislabelled.** In the picture above, red marks a task whose tests reject
  correct fixes. Among the tasks that a 9B model never solves, that is 74%.
- **The usual clean-up misses the errors that matter.** Dropping never-solved tasks removes red squares that were
  teaching the model nothing. The red squares in the other stacks are the ones that train it.
- **Clean labels make a better agent.** At the same size and difficulty, training on audited tasks scores 2.4 and
  2.7 points higher on two held-out benchmarks. Filtering by pass rate does not help.

## Hidden tests are the reward

A training task comes from a merged pull request. The issue becomes the prompt, and the tests of the pull request
become the grader.

:::figure
<div><picture><source media="(max-width: 520px)" srcset="/images/swe-gym-verified/reward-loop-narrow.svg"><img src="/images/swe-gym-verified/reward-loop.svg" alt="How a task rewards a patch. The agent reads a GitHub issue and writes a patch. Hidden tests, taken from the pull request that originally fixed the issue, run on the patch. If all pass the reward is 1, otherwise 0."></picture></div>

The agent sees the issue and the repository. It never sees the tests.
:::

Before a task is used, one thing is verified: the original fix passes the tests, and the unfixed code fails them.
That proves the reward can be reached. It does not prove that every correct fix reaches it, or that only correct
fixes do. The tests were written with one particular fix in mind, and about any other patch they can be wrong in two
ways.

:::figure
<div><picture><source media="(max-width: 520px)" srcset="/images/swe-gym-verified/label-errors-narrow.svg"><img src="/images/swe-gym-verified/label-errors.svg" alt="A two-by-two table of patch against reward. A correct fix with reward 1 and a wrong patch with reward 0 are labelled correctly. A correct fix with reward 0 is a false negative: 55% of the audited tasks have a test that does this. A wrong patch with reward 1 is a false positive: 26% of the passing patches."></picture></div>

The two ways a hidden test mislabels a patch, and how often we found each.
:::

### False negatives

A correct fix gets reward 0. In `iterative/dvc-3490`, the issue asks to make collecting every stage before an
operation optional. The hidden test:

```python
mocker.patch("dvc.repo.Repo._collect_graph")
...
dvc._skip_graph_checks = True
...
assert not mock_collect_graph.called
```

It patches a private method and sets a private flag. The issue names neither. Solve the problem under any other
internal name, and the reward is 0.

### False positives

A wrong patch gets reward 1. In `pandas-dev/pandas-50796`, one of the model's patches builds the rows of
`DataFrame.to_dict("records")` like this:

```python
return [
    dict(zip(df.columns, map(maybe_box_native, t)))
    for t in df.itertuples(index=False, name=None)
]
```

Every test passes. But call `df.to_dict("records", into=OrderedDict)`: the original code and the reference fix
return `OrderedDict` rows, and this patch returns plain dicts. No test checks `into=`, so the reward is 1.

## Auditing SWE-Gym

Asking a model whether a test is fair produces opinions. We wanted evidence, so every suspicion has to be reproduced
by running code.

- **False negatives.** Two frontier models from different families, `claude-opus-5.5` and `gpt-6.1-sol`, read every
  assertion of the failing tests against the issue. If one of them finds a detail that the issue never specifies, a
  coding agent writes a *witness*: a second fix that follows the issue but differs in exactly that detail. We run the
  tests on it. Only if they reject it does the task count as mislabelled.
- **False positives.** Both models must call a passing patch wrong, and a *counterexample* must show it: a script
  that behaves the same on the original code and on the reference fix, and differently on the patch.

Neither model ever sees how often a task is solved. When the only problem is a missing requirement, we add it to
the issue instead of throwing the task away.

:::figure
<div><picture><source media="(max-width: 520px)" srcset="/images/swe-gym-verified/audit-outcomes-narrow.svg"><img src="/images/swe-gym-verified/audit-outcomes.svg" alt="Of the 2,263 tasks whose audit finished, 1,176 are removed, 903 are released unchanged and 184 are released with a repaired issue. The 1,087 released tasks form SWE-Gym-Verified."></picture></div>

What happened to the 2,265 tasks we audited (two audits did not finish). The 1,087 that remain are SWE-Gym-Verified.
:::

:::note[What "Verified" means here]
The two models rated every assertion, and every flagged one was tested by execution. Humans did not review every
task, as they did for SWE-bench Verified. We did label a blind sample by hand, and agreed with three out of four
flags.
:::

## What the audit found

### Unsolved often means mislabelled

More than half of the audited tasks, 55%, have a test that rejects a correct fix. Most often the test checks
behaviour that the issue never asks for, an interface it never names, or an exact string.

What matters more is where these tasks sit. Look at the opening picture again. Of the 77 tasks the model never
solves, 57 are red. Of the tasks it sometimes solves, one in five is. A task with a zero pass rate is more likely
than not to have a broken test, so a zero pass rate does not measure difficulty. Independent human annotations of the
same tasks show the same pattern.[^paichecker]

Repairing a task shows it most directly. In `getmoto/moto-4846`, the issue says that removing a permission that does
not exist should raise `ResourceNotFoundException`. The hidden test also demands one exact error message, which the
issue never gives. We append a single sentence to the issue:

> When `remove_permission` is called on an existing function with a `StatementId` that matches no permission
> statement, it raises a `ResourceNotFoundException` client error whose message is exactly "No policy is associated
> with the given resource."

:::figure
<div><picture><source media="(max-width: 520px)" srcset="/images/swe-gym-verified/repair-narrow.svg"><img src="/images/swe-gym-verified/repair.svg" alt="Eight base-model samples on getmoto/moto-4846. With the original issue none of the eight passes; with one sentence appended to the issue, seven of eight pass."></picture></div>

The same model and the same tests, before and after one sentence is appended to the issue.
:::

Across the repaired tasks, the model passes 2.1 more of eight attempts on average. Tasks we left unchanged do not
move.

### A quarter of passing patches are wrong

False positives follow no such pattern. About a quarter of all passing patches are wrong, whether the task is easy or
hard.

:::figure
<div><picture><source media="(max-width: 520px)" srcset="/images/swe-gym-verified/false-positives-narrow.svg"><img src="/images/swe-gym-verified/false-positives.svg" alt="Share of distinct passing patches that are wrong, by how many of eight attempts pass on the task: 27%, 27%, 36%, 36%, 28%, 21%, 29% and 19% for one to eight passes; 26% over all 1,854 patches."></picture></div>

Wrong patches among the patches that pass, by task difficulty. Whiskers are 95% intervals, and the line is the
overall share.
:::

## What label errors do to training

### The pass-rate filter removes the wrong errors

The standard defence against bad tasks is a pass-rate filter: drop whatever the model never solves.[^filter] It gets
rid of 40% of the mislabelled tasks in our training set, which sounds useful.

But consider what RL learns from. GRPO, the algorithm behind most of these recipes, compares the attempts on one task
with each other. If all eight attempts get the same reward, there is nothing to compare, and the task produces no
gradient. A never-solved task gets eight zeros. It wastes compute, and it teaches nothing, right or wrong.

The mislabelled tasks that shape the model are the ones it *sometimes* solves. The filter keeps every one of them.

:::figure
<div><picture><source media="(max-width: 520px)" srcset="/images/swe-gym-verified/gradient-share-narrow.svg"><img src="/images/swe-gym-verified/gradient-share.svg" alt="Two stacked bars for the original training set. Of its 512 tasks, 11.1% are flawed and never solved and 16.6% flawed and sometimes solved. Of its 2,365 groups that carry gradient, 0.9% fall on the never-solved flawed tasks and 19.5% on the sometimes-solved flawed tasks."></picture></div>

Mislabelled tasks in the original training set, counted two ways: as tasks, and as the groups of eight attempts that
carry gradient.
:::

### What the remaining errors teach

We read the training traces of two such tasks.

**The only reward goes to doing more than the issue asks.** In `getmoto/moto-5137`, the issue asks for pagination of
`list_accounts_for_parent`. One hidden test also requires pagination of a second API,
`list_organizational_units_for_parent`, which the issue never mentions. Training visits the task five times.

:::figure
<div><picture><source media="(max-width: 520px)" srcset="/images/swe-gym-verified/moto-5137-narrow.svg"><img src="/images/swe-gym-verified/moto-5137.svg" alt="The 40 training attempts on getmoto/moto-5137 in five groups of eight. 30 attempts do what the issue asks and fail only the test of a second API that the issue never mentions, 9 fail other tests as well, and 1 is rewarded. Four groups have eight zero rewards and carry no gradient."></picture></div>

The 40 attempts on `getmoto/moto-5137` during training, one square per attempt.
:::

Thirty attempts do what the issue asks and are rejected. The single reward goes to the one patch that goes beyond the
issue.

**A test on wording decides which fix is rewarded.** In `pandas-dev/pandas-53409`, the issue asks to deprecate
literal JSON input to `read_json` and gives no warning text. The hidden test requires the upstream warning word for
word. In one group, all eight attempts add a deprecation warning. Two of them happen to end it exactly as upstream
does, and are rewarded:

> To read from a literal string, wrap it in a 'StringIO' object.

Four others fail only this test. Their wording, with the differences in bold:

> To read from a literal string, wrap it in a **StringIO** object.\
> To read from a string, wrap it in a **StringIO** object.\
> To read from a string, **use** a 'StringIO' **object instead.**\
> To read from a string, wrap **the JSON string** in **'StringIO'.**

Here the gradient points toward reproducing a sentence that the model had no way to know, not toward fixing the
issue.

### Clean labels train a better agent

Does any of this change the trained model? We built three training sets of 512 tasks each:

- **Orig**: SWE-Gym tasks with their original issues and tests.
- **Orig+Filter**: the same, under a pass-rate filter that swaps never-solved tasks for sometimes-solved ones.
- **Clean**: audited tasks, matched to Orig in size and in difficulty.

Each set trains Qwen3.5-9B with GRPO for 80 steps.[^grpo] We evaluate on tasks from repositories that never appear in
training: 397 held-out tasks of SWE-bench Verified, and SWE-bench Pro.

:::figure
<div><picture><source media="(max-width: 520px)" srcset="/images/swe-gym-verified/heldout-gains-narrow.svg"><img src="/images/swe-gym-verified/heldout-gains.svg" alt="Gain in pass@1 over the base model for three training sets. SWE-bench Verified: Orig +3.0, Orig+Filter +4.1, Clean +5.4 points. SWE-bench Pro: Orig −0.2, Orig+Filter −2.4, Clean +2.5 points."></picture></div>

Gain in pass@1 over the base model on the two held-out benchmarks, mean of three training runs per set.
:::

Clean beats Orig by 2.4 points on SWE-bench Verified and by 2.7 on SWE-bench Pro. On Pro, training on the original
tasks does not improve on the base model at all, and the filter makes it worse.

:::figure
<div><picture><source media="(max-width: 520px)" srcset="/images/swe-gym-verified/dev-curves-narrow.svg"><img src="/images/swe-gym-verified/dev-curves.svg" alt="Pass@1 on the 100-task development split at training steps 10 to 80, mean of three seeds. The three sets stay close through step 40. At step 80 Clean is at 53.0%, Orig+Filter at 49.3% and Orig at 48.0%; the base model is at 46.8%."></picture></div>

Pass@1 on a 100-task development split during training, mean of three runs. Over steps 50 to 80, the shaded band,
Clean is 3.9 points ahead of Orig on average.
:::

The gap opens late. The three sets stay close through step 40, and then the original tasks fade: Orig peaks at steps
20 to 30, while Clean keeps improving until steps 60 to 70.

### Harder tests are not enough

For false positives we tried the obvious fix. The counterexamples became 493 new tests on 143 of Clean's tasks, and
we trained again on this hardened set, Clean+FP.

:::figure
<div><picture><source media="(max-width: 520px)" srcset="/images/swe-gym-verified/hardening-narrow.svg"><img src="/images/swe-gym-verified/hardening.svg" alt="Training reward on the 143 hardened tasks in four 20-step bins. Clean, graded by its original tests, rises from 72% to 79%. Clean+FP, trained with the new tests, rises from 58% to 66%. Clean's own patches re-graded with the new tests run from 59% to 62%, close to Clean+FP."></picture></div>

Training reward on the 143 hardened tasks. The dotted line takes the patches that the Clean policy wrote and grades
them with the new tests.
:::

The reward on these tasks drops by about 13 points. But grading the *old* policy's patches with the new tests
predicts almost the same drop: the policy trained with the new tests passes them only 0.4 and 1.8 points more often
than a policy that never saw them, and held-out results stay about the same.

Two lessons. Counterexample tests are not yet a fix: they catch about a quarter of the false positives that appear
during training. And training reward cannot rank datasets, because it is computed with the very labels in question.
Of all our sets, the one with the highest training reward was Orig+Filter.

## So what makes good data?

For the reward, three things.

1. **Every correct fix must get the reward.** Most tasks that a model never solves have a test that rejects correct
   fixes. Filters and curricula that read a low pass rate as difficulty mostly act on label errors.
2. **The reward must vary for the right reason.** The errors that train the model sit in tasks where some attempts
   pass and some fail. Pass rate and reward variance cannot see them. Checking the labels can.
3. **Quality must be measured on held-out tasks**, at matched size and difficulty. Training reward misled us twice:
   the set with the highest reward showed no held-out gain, and the set whose reward dropped lost nothing.

Two questions are open: whether repairing a task beats removing it, and how to get rid of false positives for good.

## Dataset and code

```python
from datasets import load_dataset

# the 1,087 audited tasks
tasks = load_dataset("Arist12/SWE-Gym-Verified", "tasks", split="train")
# the 708 that Qwen3.5-9B does not always solve
trainable = tasks.filter(lambda t: t["base_resolved_of_8"] < 8)
```

- **Dataset**: [SWE-Gym-Verified](https://huggingface.co/datasets/Arist12/SWE-Gym-Verified). Besides the tasks, it
  holds the record of every audit with the executed witness patches, the labels of 1,854 passing patches with their
  counterexamples, and the 493 new tests.
- **Code**: [github.com/Arist12/SWE-Gym-Verified](https://github.com/Arist12/SWE-Gym-Verified) has the audit
  workflow with its prompts, the training sets and every held-out result.

[^swegym]: Pan et al. [Training Software Engineering Agents and Verifiers with SWE-Gym](https://arxiv.org/abs/2412.21139). ICML 2025.

[^paichecker]: Wang, Xu and He. [PAIChecker: Uncovering and Checking PR-Issue Misalignment in SWE-Bench-Like Benchmarks](https://arxiv.org/abs/2607.28587). ASE 2026.

[^filter]: Yang et al. [Kimi-Dev: Agentless Training as Skill Prior for SWE-Agents](https://arxiv.org/abs/2509.23045). ICLR 2026.

[^grpo]: Shao et al. [DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models](https://arxiv.org/abs/2402.03300). 2024.
