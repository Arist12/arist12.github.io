---
permalink: /
title: "About Me"
excerpt: ""
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

{% if site.google_scholar_stats_use_cdn %}
{% assign gsDataBaseUrl = "https://cdn.jsdelivr.net/gh/" | append: site.repository | append: "@" %}
{% else %}
{% assign gsDataBaseUrl = "https://raw.githubusercontent.com/" | append: site.repository | append: "/" %}
{% endif %}
{% assign url = gsDataBaseUrl | append: "google-scholar-stats/gs_data_shieldsio.json" %}

<span class='anchor' id='about-me'></span>

# 👋 About Me

I'm a second-year CS PhD student at **University of Wisconsin-Madison**. I completed my B.Eng in Computer Science (IEEE Honor Class) at **Shanghai Jiao Tong University**, where I was fortunate to work with [Prof. Pengfei Liu](http://pfliu.com/) and [Prof. Junxian He](https://jxhe.github.io/).

My research focuses on **large language models**, particularly in developing intelligent coding agents. I'm driven by curiosity about how complex systems work and how we can make AI systems more capable and efficient.

<a href='https://scholar.google.com/citations?user=I_EmXRYAAAAJ&hl=en'><img src="https://img.shields.io/endpoint?url={{ url | url_encode }}&logo=Google%20Scholar&labelColor=f6f6f6&color=9cf&style=flat&label=citations"></a>

# 🎓 Educations
- *2024.09 - (now)*, Ph.D. in CS, University of Wisconsin-Madison.
- *2020.09 - 2024.06*, B.Eng in CS (IEEE Honor Class), Shanghai Jiao Tong University.
- *2023.02 - 2023.07*, Exchange Student in CS, EPFL.


# 📖 Selected Publications
<div class='paper-box-text' markdown="1">
<b style="color:#1685a9;">SWE-Edit: Rethinking Code Editing for Efficient SWE-Agent
</b> \\
***<ins>Y. Zhang</ins>***, J. Pei, K. Li, et al. \\
[Github](https://github.com/microsoft/SWE-Edit) | Preprint, 2026
</div>

<div class='paper-box-text' markdown="1">
<b style="color:#1685a9;">R-KV: Redundancy-aware KV Cache Compression for Reasoning Models
</b> \\
Z. Cai, W. Xiao, H. Sun, C. Luo, ***<ins>Y. Zhang</ins>***, K. Wan, et al. \\
[PDF](https://arxiv.org/abs/2505.24133) | [Github](https://github.com/Zefan-Cai/R-KV) | NeurIPS, 2025
</div>

<div class='paper-box-text' markdown="1">
<b style="color:#1685a9;">Dissecting Human and LLM Preferences 
</b> \\
J. Li, F. Zhou, S. Sun, ***<ins>Y. Zhang</ins>***, H. Zhao, P. Liu \\
[PDF](https://arxiv.org/pdf/2402.11296) | [Github](https://github.com/GAIR-NLP/Preference-Dissection) | ACL, 2024
</div>

<div class='paper-box-text' markdown="1">
<b style="color:#1685a9;">Extending LLMs' Context Window with 100 Samples
</b>  \\
***<ins>Y. Zhang</ins>***, J. Li, P. Liu   \\
[PDF](https://arxiv.org/pdf/2401.07004) | [Github](https://github.com/GAIR-NLP/Entropy-ABF) | arXiv, 2024
</div>

<div class='paper-box-text' markdown="1">
<b style="color:#1685a9;">Pygmtools: A Python Graph Matching Toolkit
</b>  \\
R. Wang, Z. Guo, W. Pan, J. Ma, ***<ins>Y. Zhang</ins>***, et al. \\
[PDF](http://jmlr.org/papers/v25/23-0572.html) | [Github](https://github.com/Thinklab-SJTU/pygmtools) | JMLR, 2024
</div>

<div class='paper-box-text' markdown="1">
<b style="color:#1685a9;">C-Eval: A Multi-Level Multi-Discipline Chinese Evaluation Suite for Foundation Models
</b>  \\
Y. Huang\*, Y. Bai\*, Z. Zhu, J. Zhang, J. Zhang, T. Su, J. Liu, C. Lv, ***<ins>Y. Zhang</ins>***, J. Lei, Y. Fu, M. Sun, J. He \\
[PDF](https://arxiv.org/abs/2305.08322) | [Github](https://github.com/hkust-nlp/ceval) | NeurIPS (Datasets and Benchmarks track), 2023
</div>

# 🧑‍🌾 Work Experience
- Research Scientist Intern, AMD, Jan 2025 – Present
- Applied Scientist Intern, Microsoft, Jun 2025 – Jan 2026
- Applied Scientist Intern, Amazon Web Services (AWS), Mar 2024 – Aug 2024
- Research Intern, Shanghai AI Lab, Jul 2023 – Oct 2023

# 🏆 Awards
- Shanghai Outstanding Graduate (top 5%), 2024

- Ubiquant Scholarship (awarded to 10 students across SJTU), 2023

- SJTU Outstanding Student Scholarship (top 10%), 2020-2023

- Longfor Foundation Scholarship (top 5%), 2021
