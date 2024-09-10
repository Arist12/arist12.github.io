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
- *2024.09 - (now)*, PhD in Computer Science, University of Wisconsin-Madison.
- *2023.02 - 2023.07*, Exchange Student in Computer Science, EPFL.
- *2020.09 - 2024.06*, Bachelor in Computer Science and Technology (IEEE Honor Class), Shanghai Jiao Tong University.

# 📖 Selected Publications
