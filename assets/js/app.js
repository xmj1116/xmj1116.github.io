// 谢美晶 · 个人主页交互：锚点高亮、中英切换、课程分类展开、回到顶部

(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- 中英文切换 ---------- */

  var langButtons = document.querySelectorAll("[data-set-lang]");
  var titleZh = document.title;
  var titleEn = document.body.getAttribute("data-title-en") || titleZh;

  function setLang(lang) {
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang === "en" ? "en" : "zh-CN");
    document.title = lang === "en" ? titleEn : titleZh;
    langButtons.forEach(function (btn) {
      btn.setAttribute(
        "aria-pressed",
        btn.getAttribute("data-set-lang") === lang ? "true" : "false"
      );
    });
    try {
      localStorage.setItem("xmj-lang", lang);
    } catch (e) {
      /* 本地文件或隐私模式下忽略 */
    }
  }

  langButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setLang(btn.getAttribute("data-set-lang"));
    });
  });

  var savedLang = null;
  try {
    savedLang = localStorage.getItem("xmj-lang");
  } catch (e) {
    savedLang = null;
  }
  setLang(savedLang === "en" ? "en" : "zh");

  /* ---------- 侧边导航当前页高亮 ---------- */

  var allNavLinks = document.querySelectorAll(".sidenav a");
  var currentPage =
    (location.pathname.split("/").pop() || "index.html") || "index.html";
  if (currentPage === "") currentPage = "index.html";
  allNavLinks.forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === currentPage) link.classList.add("active");
  });

  /* ---------- 侧边导航跟随滚动高亮（页内锚点） ---------- */

  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".sidenav a[href^='#']")
  );
  var sections = navLinks
    .map(function (link) {
      return document.getElementById(link.getAttribute("href").slice(1));
    })
    .filter(Boolean);

  function updateActive() {
    var pos = window.scrollY + 150;
    var current = sections[0];
    sections.forEach(function (section) {
      if (section.offsetTop <= pos) current = section;
    });
    if (
      window.innerHeight + window.scrollY >=
      document.body.scrollHeight - 40
    ) {
      current = sections[sections.length - 1];
    }
    navLinks.forEach(function (link) {
      link.classList.toggle(
        "active",
        current && link.getAttribute("href") === "#" + current.id
      );
    });
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateActive();
      toggleToTop();
      ticking = false;
    });
  });
  window.addEventListener("resize", updateActive);
  updateActive();

  /* ---------- 回到顶部 ---------- */

  var toTop = document.querySelector(".to-top");

  function toggleToTop() {
    if (toTop) toTop.classList.toggle("show", window.scrollY > 600);
  }

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- 课程分类展开 / 收起 ---------- */

  var expandBtn = document.querySelector("[data-expand-all]");
  var groups = Array.prototype.slice.call(
    document.querySelectorAll("details.course-group")
  );

  if (expandBtn && groups.length) {
    var updateLabel = function () {
      var allOpen = groups.every(function (g) {
        return g.open;
      });
      var zh = expandBtn.querySelector(".lang-zh");
      var en = expandBtn.querySelector(".lang-en");
      if (zh) zh.textContent = allOpen ? "收起全部分类" : "展开全部分类";
      if (en) en.textContent = allOpen ? "Collapse all" : "Expand all";
      expandBtn.setAttribute("data-open", allOpen ? "1" : "0");
    };

    expandBtn.addEventListener("click", function () {
      var open = expandBtn.getAttribute("data-open") !== "1";
      groups.forEach(function (g) {
        g.open = open;
      });
      updateLabel();
    });

    groups.forEach(function (g) {
      g.addEventListener("toggle", updateLabel);
    });
    updateLabel();
  }

  /* ---------- 首页项目分页 ---------- */

  var projectList = document.getElementById("project-list");
  var projectPager = document.getElementById("project-pager");

  if (projectList && projectPager) {
    var cards = Array.prototype.slice.call(projectList.children);
    var perPage = 4;
    var totalPages = Math.ceil(cards.length / perPage);
    var pageIndex = 1;

    var renderPager = function () {
      if (totalPages < 2) {
        projectPager.hidden = true;
        return;
      }
      var html = '<button type="button" data-go="' + (pageIndex - 1) + '"' +
        (pageIndex === 1 ? " disabled" : "") + '><span class="lang-zh">上一页</span><span class="lang-en">Prev</span></button>';
      for (var i = 1; i <= totalPages; i++) {
        html += '<button type="button" data-go="' + i + '"' +
          (i === pageIndex ? ' aria-current="true"' : "") + ">" + i + "</button>";
      }
      html += '<button type="button" data-go="' + (pageIndex + 1) + '"' +
        (pageIndex === totalPages ? " disabled" : "") + '><span class="lang-zh">下一页</span><span class="lang-en">Next</span></button>';
      projectPager.innerHTML = html;
    };

    var showPage = function (page) {
      pageIndex = page;
      cards.forEach(function (card, index) {
        card.style.display = Math.floor(index / perPage) + 1 === page ? "" : "none";
      });
      renderPager();
    };

    projectPager.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn || btn.disabled) {
        return;
      }
      var target = Number(btn.getAttribute("data-go"));
      if (target >= 1 && target <= totalPages) {
        showPage(target);
      }
    });

    showPage(1);
  }

  /* ---------- 右侧面板：站内搜索 + 近期更新 ---------- */

  var BASE = /\/projects\//.test(location.pathname) ? "../" : "";

  var RECENT = [
    { d: "2026.11", u: "about.html#conferences", zh: "学术会议口头报告：携宠旅游行为意愿研究", en: "Conference talk: pet-inclusive travel intention" },
    { d: "2026.09", u: "about.html#education", zh: "入学南京师范大学地理科学学院（硕士）", en: "Started master's study at NJNU" },
    { d: "2025.03", u: "about.html#honors", zh: "第十一届“挑战杯”竞赛 · 一等奖", en: "Challenge Cup · First Prize" },
    { d: "2024.12", u: "projects/smrm.html", zh: "SMRM 解说系统效度研究项目立项", en: "SMRM interpretation validity project" },
    { d: "2024.12", u: "about.html#honors", zh: "中国（安徽）茶文化创新大赛 · 二等奖", en: "Anhui tea culture innovation contest · Second Prize" },
    { d: "2024.08", u: "about.html#honors", zh: "中国国际大学生创新大赛 · 一等奖", en: "China International Innovation Contest · First Prize" }
  ];

  var INDEX = [
    { t: "首页", u: "index.html", k: "首页 谢美晶 简介 研究方向 AI4SSH 机器学习 智能体 评测 科研项目 home profile" },
    { t: "自我介绍", u: "about.html", k: "自我介绍 简历 about cv 履历" },
    { t: "教育经历", u: "about.html#education", k: "教育 南京师范大学 安徽师范大学 硕士 本科 导师 张郴 杨效忠 尹寿兵 学分绩 education" },
    { t: "工作经历", u: "about.html#work", k: "工作 实习 公司 work experience" },
    { t: "代表论文", u: "about.html#publications", k: "论文 期刊 课程论文 三亚 希尔顿 收益管理 旅游大数据 publications" },
    { t: "竞赛奖励", u: "about.html#honors", k: "竞赛 奖励 挑战杯 茶文化 创新大赛 红色旅游 英语作文 导游 honors awards" },
    { t: "科研经历", u: "about.html#research", k: "科研 项目 会议 research 学术会议" },
    { t: "学生工作", u: "about.html#service", k: "学生工作 研会 团工委 志愿者 助管 service" },
    { t: "掌握技能", u: "about.html#skills", k: "技能 证书 导游证 英语六级 普通话 skills" },
    { t: "课程体系", u: "courses.html", k: "课程 笔记 下载 分类 courses notes" },
    { t: "目录", u: "toc.html", k: "目录 索引 contents toc" },
    { t: "归档", u: "archive.html", k: "归档 时间线 archive timeline" },
    { t: "SMRM 解说系统效度研究", u: "projects/smrm.html", k: "凌家滩 遗址公园 解说系统 SMRM 毕业论文 项目" },
    { t: "乡村旅游地韧性研究", u: "projects/dc.html", k: "长三角 乡村旅游 韧性 大创 项目" },
    { t: "三下乡：玉见文明，琢磨未来", u: "projects/sxx.html", k: "三下乡 凌家滩 太湖山 运漕古镇 青舍民宿 社会实践 项目" },
    { t: "千里茶缘九华牵——茶旅融合产品策划", u: "projects/chayuan.html", k: "茶文化 九华山 茶禅 研学 康养 竞赛 项目" },
    { t: "千里甜缘一线牵——宣城水东镇“甜蜜小镇”文旅策划", u: "projects/dingfeng.html", k: "顶峰杯 水东镇 甜蜜小镇 蜜枣 文旅策划 竞赛 项目" },
    { t: "舟行天下，鸠地起航——龙舟文化传承发展新模式", u: "projects/zhouxing.html", k: "龙舟 鸠江区 芜湖 传统文化 创新大赛 竞赛 项目" },
    { t: "风卷红旗过大关——井冈山红色旅游线路设计", u: "projects/hongse.html", k: "井冈山 红色旅游 线路设计 诗词 竞赛 项目" }
  ];

  var panel = document.createElement("aside");
  panel.className = "site-panel";
  panel.setAttribute("aria-label", "站内搜索与近期更新");

  var recentHtml = RECENT.map(function (item) {
    return '<li><span class="r-date">' + item.d + '</span><a href="' + BASE + item.u + '">' +
      '<span class="lang-zh">' + item.zh + '</span><span class="lang-en">' + item.en + '</span></a></li>';
  }).join("");

  panel.innerHTML =
    '<div class="panel-search">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>' +
      '<input type="search" aria-label="站内搜索 / Search" placeholder="搜索 / Search" autocomplete="off">' +
    '</div>' +
    '<div class="panel-results" hidden></div>' +
    '<h2 class="panel-heading"><span class="lang-zh">近期更新</span><span class="lang-en">Recently Updated</span></h2>' +
    '<ul class="recent-list">' + recentHtml + '</ul>';

  document.body.appendChild(panel);

  var searchInput = panel.querySelector("input");
  var results = panel.querySelector(".panel-results");

  function renderResults(query) {
    var q = query.trim().toLowerCase();
    if (!q) {
      results.hidden = true;
      results.innerHTML = "";
      return;
    }
    var hits = INDEX.filter(function (item) {
      return (item.t + " " + item.k).toLowerCase().indexOf(q) !== -1;
    }).slice(0, 7);

    if (!hits.length) {
      results.innerHTML = '<div class="no-result"><span class="lang-zh">未找到匹配内容</span><span class="lang-en">No match found</span></div>';
    } else {
      results.innerHTML = hits.map(function (item) {
        return '<a href="' + BASE + item.u + '">' + item.t + '</a>';
      }).join("");
    }
    results.hidden = false;
  }

  searchInput.addEventListener("input", function () {
    renderResults(searchInput.value);
  });

  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      var first = results.querySelector("a");
      if (first) location.href = first.getAttribute("href");
    } else if (e.key === "Escape") {
      searchInput.value = "";
      renderResults("");
    }
  });

  document.addEventListener("click", function (e) {
    if (!panel.contains(e.target)) {
      results.hidden = true;
    }
  });
})();

/* ---------- 文档下载密码 ---------- */

(function () {
  var PASSWORD = "0225";
  var pending = null;

  var modal = document.createElement("div");
  modal.className = "lock-modal";
  modal.hidden = true;
  modal.innerHTML =
    '<div class="lock-card" role="dialog" aria-modal="true" aria-labelledby="lock-title">' +
      '<p class="lock-title" id="lock-title">对暗号，拿文档 🔒</p>' +
      '<input class="lock-input" type="password" inputmode="numeric" autocomplete="off" maxlength="4" placeholder="····" aria-label="访问密码">' +
      '<p class="lock-error" role="alert"></p>' +
      '<button class="lock-btn" type="button">解锁下载</button>' +
      '<p class="lock-hint">输入 4 位数字访问密码</p>' +
    '</div>';
  document.body.appendChild(modal);

  var card = modal.querySelector(".lock-card");
  var input = modal.querySelector(".lock-input");
  var error = modal.querySelector(".lock-error");
  var button = modal.querySelector(".lock-btn");

  function open(href) {
    pending = href;
    error.textContent = "";
    error.classList.remove("show");
    input.value = "";
    modal.hidden = false;
    setTimeout(function () {
      input.focus();
    }, 30);
  }

  function close() {
    modal.hidden = true;
    pending = null;
  }

  function submit() {
    if (input.value === PASSWORD) {
      var a = document.createElement("a");
      a.href = pending;
      a.download = "";
      document.body.appendChild(a);
      a.click();
      a.remove();
      close();
      return;
    }
    error.textContent = input.value ? "暗号不对，再想想～" : "请输入访问密码";
    error.classList.add("show");
    card.classList.remove("shake");
    void card.offsetWidth;
    card.classList.add("shake");
    input.select();
  }

  button.addEventListener("click", submit);

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      submit();
    }
  });

  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      close();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) {
      close();
    }
  });

  document.addEventListener("click", function (e) {
    var link = e.target.closest ? e.target.closest("a[data-locked]") : null;
    if (!link) {
      return;
    }
    e.preventDefault();
    open(link.getAttribute("href"));
  });
})();
