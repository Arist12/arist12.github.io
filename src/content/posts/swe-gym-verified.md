---
title: "What makes good data for training coding agents?"
description: "Coding agents learn from tasks mined from GitHub, each graded by the hidden tests of the original fix. We checked those tests one by one. Most tasks that look too hard for a model are mislabelled."
date: 2026-11-18
draft: false
cover: /images/swe-gym-verified/cover.svg
hero:
  src: /images/swe-gym-verified/hero.svg
  narrow: /images/swe-gym-verified/hero-narrow.svg
  alt: "Each square is one of the 512 tasks of the original training set, stacked by how often a 9B model solves the task in eight attempts. Red squares are tasks whose hidden tests reject correct fixes: 57 of the 77 never-solved tasks (74%), then 41%, 36%, 16%, 26%, 14%, 8% and 11% of the tasks solved one to seven times."
  caption: "Each square is one of the 512 tasks of a training set drawn from SWE-Gym, stacked by how often a 9B model solves it in eight attempts. Tasks it always solves are not used for training. Red: the task's hidden tests reject correct fixes."
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
- **A pass-rate filter misses the errors that matter.** Dropping never-solved tasks removes red squares that were
  teaching the model almost nothing. The red squares in the other stacks are the ones that train it.
- **Removing those errors makes a better agent.** At the same size and difficulty, training on audited tasks scores
  2.4 and 2.7 points higher on two held-out benchmarks.
- **Wrong patches that pass are a separate, open problem.** About a quarter of all passing patches are wrong, and
  adding tests against them has not changed the trained model yet.

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
mock_collect_graph = mocker.patch(
    "dvc.repo.Repo._collect_graph"
)
...
dvc._skip_graph_checks = True
...
assert not mock_collect_graph.called
```

It patches a private method and sets a private flag. The issue names neither. Solve the problem under any other
internal name, and the reward is 0.

### False positives

A wrong patch gets reward 1. In `pandas-dev/pandas-50796`, a patch written by Qwen3.5-9B, the model we train later, builds
the rows of `DataFrame.to_dict("records")` like this:

```python
return [
    dict(zip(df.columns, map(maybe_box_native, t)))
    for t in df.itertuples(index=False, name=None)
]
```

Every test passes. But call `df.to_dict("records", into=OrderedDict)`: the original code and the reference fix
return `OrderedDict` rows, and this patch returns plain dicts. No test checks the type of the rows, so the reward is 1.

## Auditing SWE-Gym

Asking a model whether a test is fair produces opinions. We wanted evidence, so every suspicion has to be reproduced
by running code.

- **False negatives.** Two frontier models from different families, `claude-opus-5.5` and `gpt-6.1-sol`, read every
  assertion of the tests that a fix has to pass, and compare it with the issue. If one of them finds a detail that
  the issue never specifies, a coding agent writes a *witness*: a second fix that follows the issue but differs in
  exactly that detail. We run the tests on it. Only if they reject it does the task count as mislabelled.
- **False positives.** We take the patches of the 9B model that pass the tests. Both models must call a patch wrong,
  and a *counterexample* must show it: a script that behaves the same on the original code and on the reference fix, and differently on the patch.

The two errors are treated differently. A task with a false negative is removed, unless adding the missing
requirement to the issue repairs it. Tasks with a broken environment or an unclear issue are removed as well. False
positives are only measured: the released tasks keep their tests as they are, and we come back to this at the end.

:::figure
<div><picture><source media="(max-width: 520px)" srcset="/images/swe-gym-verified/audit-outcomes-narrow.svg"><img src="/images/swe-gym-verified/audit-outcomes.svg" alt="Of the 2,263 tasks whose audit finished, 1,176 are removed, 903 are released unchanged and 184 are released with a repaired issue. The 1,087 released tasks form SWE-Gym-Verified."></picture></div>

What happened to the 2,265 tasks we audited (two audits did not finish). The 1,087 that remain are the dataset we
release, SWE-Gym-Verified.
:::

:::note[What "Verified" means here]
The two models rated every assertion, and every flagged one was tested by execution. Humans did not review every
task, as they did for SWE-bench Verified. We did label a blind sample by hand, and agreed with 33 of the 45
flags in it.
:::

## Where the errors are

To place the errors, we need to know how hard each task is. Our base model, Qwen3.5-9B, attempts every task
eight times. A task is *never solved* if no attempt passes, *sometimes solved* if one to seven do, and *always
solved* if all eight do. Neither auditing model ever sees these counts.

### False negatives pile up on never-solved tasks

Of the 2,001 tasks whose tests the two models judged, 55% have a test that rejects a correct fix. Most often the
test checks behaviour that the issue never asks for, an interface it never names, or an exact string.

What matters more is where these tasks sit. The opening picture shows a training set of 512 SWE-Gym tasks with
their original issues and tests. Of the 77 tasks the model never solves, 57 are red, and 7 more had such a test
until we repaired the issue. Of the tasks it sometimes solves, one in five is red. A task with a zero pass rate is
more likely than not to have a broken test, so a zero pass rate does not measure difficulty. Independent human
annotations of SWE-Gym tasks show the same pattern.[^paichecker]

A repair shows this most directly. In `getmoto/moto-4846`, the issue says that removing a permission that does
not exist should raise `ResourceNotFoundException`. The hidden test also demands one exact error message, which the
issue never gives. We append the one requirement that the issue leaves out:

> When `remove_permission` is called on an existing function with a `StatementId` that matches no permission
> statement, it raises a `ResourceNotFoundException` client error whose message is exactly "No policy is associated
> with the given resource."

:::figure
<div><picture><source media="(max-width: 520px)" srcset="/images/swe-gym-verified/repair-narrow.svg"><img src="/images/swe-gym-verified/repair.svg" alt="Eight attempts by the base model on getmoto/moto-4846. With the original issue none of the eight passes; with one sentence appended to the issue, seven of eight pass."></picture></div>

The same model and the same tests, before and after one sentence is appended to the issue.
:::

Across the repaired tasks, the model passes 2.1 more of eight attempts on average. Tasks that we left unchanged and
measured again do not move.

### False positives are everywhere

False positives follow no such pattern. About a quarter of all passing patches are wrong, on easy and hard tasks
alike.

:::figure
<div><picture><source media="(max-width: 520px)" srcset="/images/swe-gym-verified/false-positives-narrow.svg"><img src="/images/swe-gym-verified/false-positives.svg" alt="Share of distinct passing patches that are wrong, by how many of eight attempts pass on the task: 27%, 27%, 36%, 36%, 28%, 21%, 29% and 19% for one to eight passes; 26% over all 1,854 patches."></picture></div>

Wrong patches among the patches that pass, by how often the model solves the task.
:::

## Which errors train the model

A wrong label matters only if it changes what the model learns. GRPO,[^grpo] a widely used RL algorithm and the one
we train with, compares the attempts on one task with each other. If all eight attempts get the same reward, there
is nothing to compare, and the task produces no gradient. So we went through three training runs on the 512 tasks
of the opening picture: 3,840 groups of eight attempts, of which 2,365 carry gradient. How many of them fall on
mislabelled tasks? Here, a mislabelled task is a red square. False positives come back in the last section.

The standard defence against bad tasks is a pass-rate filter: drop whatever the model never solves.[^filter] The
figure shows what such a filter removes and what it keeps.

:::figure
<div><picture><source media="(max-width: 520px)" srcset="/images/swe-gym-verified/gradient-share-narrow.svg"><img src="/images/swe-gym-verified/gradient-share.svg" alt="Two stacked bars for the original training set. Of its 512 tasks, 11.1% are mislabelled and never solved and 16.6% mislabelled and sometimes solved. Of its 2,365 groups that carry gradient, 0.9% fall on the never-solved mislabelled tasks and 19.5% on the sometimes-solved ones."></picture></div>

Mislabelled tasks in the training set, counted two ways: as tasks, and as the groups of eight attempts that carry
gradient.
:::

### Never solved: almost no gradient

A mislabelled task that the model never solves is silent. It gets eight zeros nearly every time, so it wastes
compute and teaches next to nothing. These tasks are 11% of the training set and under 1% of the groups that carry
gradient.

**A pass-rate filter removes only these.** It gets rid of 40% of the mislabelled tasks in this training set, which
sounds useful, but they are the silent ones.

When such a task does produce gradient, it can point the wrong way. In `getmoto/moto-5137`, the issue asks for
pagination of `list_accounts_for_parent`. One hidden test also requires pagination of a second API,
`list_organizational_units_for_parent`, which the issue never mentions. In the two runs where we kept per-test
results, training visits the task five times.

:::figure
<div><picture><source media="(max-width: 520px)" srcset="/images/swe-gym-verified/moto-5137-narrow.svg"><img src="/images/swe-gym-verified/moto-5137.svg" alt="The 40 training attempts on getmoto/moto-5137 in five groups of eight. 30 attempts do what the issue asks and fail only the test of a second API that the issue never mentions, 9 fail other tests as well, and 1 is rewarded. Four groups have eight zero rewards and carry no gradient."></picture></div>

The 40 attempts on `getmoto/moto-5137` during training, one square per attempt.
:::

Thirty attempts do what the issue asks and are rejected. Four of the five groups carry no gradient, and the only
reward goes to the one patch that goes beyond the issue.

### Sometimes solved: the wrong gradient

A mislabelled task that the model *sometimes* solves is different. Some attempts are rewarded and some are not, and
a wrong test can decide which. These tasks are 17% of the training set and a fifth of the groups that carry
gradient. A pass-rate filter keeps every one of them.

What do they teach? In `pandas-dev/pandas-53409`, the issue asks to deprecate literal JSON input to `read_json` and
gives no warning text. The hidden test requires the upstream warning word for word. In one group, all eight
attempts add a deprecation warning. Two of them happen to end it exactly as upstream does, and are rewarded:

> To read from a literal string, wrap it in a 'StringIO' object.

Four others fail only this test. Their wording, with the differences in bold:

> To read from a literal string, wrap it in a **StringIO** object.\
> To read from a string, wrap it in a **StringIO** object.\
> To read from a string, **use** a 'StringIO' **object instead.**\
> To read from a string, wrap **the JSON string** in **'StringIO'.**

Here the gradient points toward reproducing a sentence that the issue never gives, not toward fixing the issue.

## Training without the errors

If these errors hurt, a model trained without them should be better. We built training sets of 512 tasks each:

- **Orig**: SWE-Gym tasks with their original issues and tests. This is the set of the opening picture.
- **Orig+Filter**: the same, under a pass-rate filter that swaps never-solved tasks for sometimes-solved ones.
- **Clean**: audited tasks, matched to Orig in size and in difficulty.

Each set trains Qwen3.5-9B with GRPO for 80 steps, in three runs. We evaluate on two public benchmarks, on
repositories that never appear in training: 397 held-out tasks of SWE-bench Verified, and SWE-bench Pro. Each run is
scored at its best checkpoint, picked on a separate development split of 100 tasks.

### Removing false negatives helps

:::figure
<div><picture><source media="(max-width: 520px)" srcset="/images/swe-gym-verified/heldout-gains-narrow.svg"><img src="/images/swe-gym-verified/heldout-gains.svg" alt="Gain in pass@1 over the base model for three training sets, three runs each. Means on SWE-bench Verified: Orig +3.0, Orig+Filter +4.1, Clean +5.4 points. Means on SWE-bench Pro: Orig −0.2, Orig+Filter −2.4, Clean +2.5 points."></picture></div>

Gain in pass@1 over the base model on the two held-out benchmarks, mean of three training runs.
:::

Clean beats Orig by 2.4 points on SWE-bench Verified and by 2.7 on SWE-bench Pro. On Pro, training on the original
tasks does not improve on the base model at all. The pass-rate filter is no substitute, as the last section
suggests: the tasks it drops were silent. Compared with Orig, it gains a point on Verified and loses two on Pro,
although it collects the highest reward during training of the three sets.

:::figure
<div><picture><source media="(max-width: 520px)" srcset="/images/swe-gym-verified/dev-curves-narrow.svg"><img src="/images/swe-gym-verified/dev-curves.svg" alt="Pass@1 on the 100-task development split at training steps 10 to 80, mean of three runs. The three sets stay close through step 40. At step 80 Clean is at 53.0%, Orig+Filter at 49.3% and Orig at 48.0%; the base model is at 46.8%."></picture></div>

Pass@1 on the development split during training, mean of three runs. Over steps 50 to 80, the shaded band,
Clean is 3.9 points ahead of Orig on average.
:::

The gap opens late. The three sets stay close through step 40, and then Orig fades: it peaks at steps 20 to 30,
while Clean keeps improving until steps 60 to 70.

### Removing false positives changes little so far

Clean removes false negatives only. A wrong patch can still pass its tests. For this we tried the obvious fix: the
counterexamples became 493 new tests on 143 of Clean's 512 tasks, and we trained again on this hardened set.

:::figure
<div><picture><source media="(max-width: 520px)" srcset="/images/swe-gym-verified/hardening-narrow.svg"><img src="/images/swe-gym-verified/hardening.svg" alt="Training reward on the 143 tasks that got new tests, in four 20-step bins, mean of two paired runs. Clean, graded by its original tests, rises from 71% to 79%. The model trained with the new tests rises from 59% to 65%. Clean's own patches re-graded with the new tests run from 59% to 62%, about one point below it on average."></picture></div>

Training reward on the 143 hardened tasks, mean of two runs. The dotted line takes the patches written by the model
trained on Clean and grades them with the new tests.
:::

The reward on these tasks drops by about 13 points. That alone says little, because stricter tests reject more
patches even if the model writes the same ones. So we took the patches of the model trained on Clean, which never
saw the new tests, and graded them with the new tests. The drop is almost the same. The model trained with the new
tests passes them only about one point more often. Its held-out results stay close to Clean's: 0.1 points lower on
SWE-bench Verified, 1.1 higher on SWE-bench Pro.

The new tests catch about a quarter of the wrong patches written during training. That is not yet enough to change
what the model learns.

## So what makes good data?

As far as the reward goes, good data needs three things.

1. **Every correct fix must get the reward.** Most tasks that a model never solves have a test that rejects correct
   fixes. A filter that reads a low pass rate as difficulty mostly acts on label errors.
2. **The reward must vary for the right reason.** The errors that train the model sit in tasks where some attempts
   pass and some fail. A pass rate cannot see them. Checking the labels can.
3. **Quality must be measured on held-out tasks**, at matched size and difficulty. Training reward is computed with
   the very labels in question: the set with the highest training reward of all was Orig+Filter.

Two questions are open: how cheap such an audit can be, and how to make sure that only correct fixes get the
reward.

## Dataset and code

```python
from datasets import load_dataset

# the 1,087 audited tasks
tasks = load_dataset(
    "Arist12/SWE-Gym-Verified", "tasks", split="train"
)
# the 708 that Qwen3.5-9B does not always solve
trainable = tasks.filter(
    lambda t: t["base_resolved_of_8"] < 8
)
```

- **Dataset**: [SWE-Gym-Verified](https://huggingface.co/datasets/Arist12/SWE-Gym-Verified). Besides the tasks, it
  holds the record of every audit with the executed witness patches, the labels of 1,854 passing patches with their
  counterexamples, and the 493 new tests.
- **Code**: [github.com/Arist12/SWE-Gym-Verified](https://github.com/Arist12/SWE-Gym-Verified) has the audit
  workflow with its prompts, the training sets and every held-out result.

## Citation

The paper has the full method and every result:
[What Makes Good Data for Training Coding Agents? A Systematic Study on SWE-Gym](https://arxiv.org/abs/2611.30207).

```bibtex
@misc{zhang2026swegymverified,
  title = {What Makes Good Data for Training Coding Agents?
    A Systematic Study on {SWE-Gym}},
  author = {Yikai Zhang and Mai Xu and Yunbei Zhang and
    Qirui Jin and Kenan Li and Yuwen Jia and
    Jinwei Yao and Xiangyu Zhang and Jielun Tan and
    Jin Pan and Zijian Jin and Xiao Sun},
  year = {2026},
  eprint = {2611.30207},
  archivePrefix = {arXiv},
  primaryClass = {cs.CL},
  url = {https://arxiv.org/abs/2611.30207}
}
```

[^swegym]: Pan et al. [Training Software Engineering Agents and Verifiers with SWE-Gym](https://arxiv.org/abs/2412.21139). ICML 2025.

[^paichecker]: Wang, Xu and He. [PAIChecker: Uncovering and Checking PR-Issue Misalignment in SWE-Bench-Like Benchmarks](https://arxiv.org/abs/2607.28587). ASE 2026.

[^filter]: Yang et al. [Kimi-Dev: Agentless Training as Skill Prior for SWE-Agents](https://arxiv.org/abs/2509.23045). ICLR 2026.

[^grpo]: Shao et al. [DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models](https://arxiv.org/abs/2402.03300). 2024.
