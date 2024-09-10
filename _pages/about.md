---
permalink: /
title: "About me"
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

✨ I'm currently a CS PhD student at UW-Madison. Before that, I got my bachelor from Shanghai Jiao Tong University, majoring in Computer Science and Technology (IEEE Honor Class).

♍️  My research interest generally lies in large language models (LLMs). Currently, I'm very interested in exploring theoretical understanding of LLMs.

📚 Prior to UW-Madison, I conducted research on long-context LLMs under the guidance of [Prof. Pengfei Liu](http://pfliu.com/). Before that, I worked closely with [Prof. Junxian He](https://jxhe.github.io/) and [Prof. Zhouhan Lin](https://hantek.github.io/).

<a href='https://scholar.google.com/citations?user=I_EmXRYAAAAJ&hl=en'><img src="https://img.shields.io/endpoint?url={{ url | url_encode }}&logo=Google%20Scholar&labelColor=f6f6f6&color=9cf&style=flat&label=citations"></a>

# 🎓 Educations
- *2024.09 - (now)*, PhD in CS, University of Wisconsin-Madison.
- *2023.02 - 2023.07*, Exchange Student in CS, EPFL.
- *2020.09 - 2024.06*, Bachelor in CS (IEEE Honor Class), Shanghai Jiao Tong University.

# 📖 Selected Publications
<div class='paper-box-text' markdown="1">
<b style="color:#1685a9;">Dissecting Human and LLM Preferences 
</b> [PDF](https://arxiv.org/pdf/2402.11296) | [Github](https://github.com/GAIR-NLP/Preference-Dissection) \\
J. Li, F. Zhou, S. Sun, ***<ins>Y. Zhang</ins>***, H. Zhao, P. Liu \\
**ACL, 2024**
</div>

<div class='paper-box-text' markdown="1">
<b style="color:#1685a9;">Extending LLMs' Context Window with 100 Samples
</b> [PDF](https://arxiv.org/pdf/2401.07004) | [Github](https://github.com/GAIR-NLP/Entropy-ABF) \\
***<ins>Y. Zhang</ins>***, J. Li, P. Liu   \\
**arXiv, 2024**
</div>

<div class='paper-box-text' markdown="1">
<b style="color:#1685a9;">Pygmtools: A Python Graph Matching Toolkit
</b> [PDF](http://jmlr.org/papers/v25/23-0572.html) | [Github](https://github.com/Thinklab-SJTU/pygmtools) \\
R. Wang, Z. Guo, W. Pan, J. Ma, ***<ins>Y. Zhang</ins>***, N. Yang, Q. Liu, L. Wei, H. Zhang, C. Liu, Z. Jiang, X. Yang, J. Yan \\
**Journal of Machine Learning Research, 2024**
</div>

<div class='paper-box-text' markdown="1">
<b style="color:#1685a9;">C-Eval: A Multi-Level Multi-Discipline Chinese Evaluation Suite for Foundation Models
</b> [PDF](https://arxiv.org/abs/2305.08322) | [Github](https://github.com/hkust-nlp/ceval)) \\
Y. Huang\*, Y. Bai\*, Z. Zhu, J. Zhang, J. Zhang, T. Su, J. Liu, C. Lv, ***<ins>Y. Zhang</ins>***, J. Lei, Y. Fu, M. Sun, J. He \\
**NeurIPS (Datasets and Benchmarks track), 2023**
</div>





