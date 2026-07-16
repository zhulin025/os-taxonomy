(function () {
  'use strict';

  const DATA = {
    topics: globalThis.XHS_TOPIC_DATA,
    dependencies: globalThis.XHS_DEPENDENCIES
  };
  const SUBJECTS = {
    'Mathematics': { zh: '数学', en: 'Mathematics', color: '#4b91ff' },
    'Science': { zh: '科学', en: 'Science', color: '#25c7d9' },
    'English': { zh: '英语', en: 'English', color: '#f05a9f' },
    'History': { zh: '历史', en: 'History', color: '#f3a536' },
    'Personal & Social Development': { zh: '社会成长', en: 'Personal & Social', color: '#ff6673' },
    'Life Skills': { zh: '生活技能', en: 'Life Skills', color: '#b36df0' },
    'Computing': { zh: '计算机', en: 'Computing', color: '#32c98b' },
    'Learning to Learn': { zh: '学会学习', en: 'Learning to Learn', color: '#8896ff' }
  };
  const TYPES = {
    CONCEPTUAL: { zh: '概念', en: 'Conceptual' },
    PROCEDURAL: { zh: '过程', en: 'Procedural' },
    REPRESENTATIONAL: { zh: '表征', en: 'Representational' },
    LANGUAGE: { zh: '语言', en: 'Language' },
    META: { zh: '元认知', en: 'Metacognitive' }
  };
  const UI_TEXT = {
    'zh-CN': {
      brandTitle: '儿童知识星图', brandSubtitle: '4–13 岁学习路径 · 完全离线', filter: '筛选',
      searchPlaceholder: '搜索知识点、学科或主题', exploreEyebrow: '探索', exploreRange: '探索范围',
      subjects: '学科', selectAll: '全选', ages: '年龄', preschool: '启蒙', primary: '小学',
      middle: '初中', all: '全部', visibleTopics: '可见知识点', visibleRelations: '可见关系',
      mapEyebrow: '知识图谱', learningUniverse: '学习宇宙',
      overviewCopy: '每一个光点是一项可学习的微观知识。拖动旋转，双指或滚轮缩放，轻点光点查看它的前置基础与后续路径。',
      topics: '知识点', relations: '依赖关系', ageLevels: '年龄层', prerequisites: '前置知识',
      unlocks: '后续解锁', currentTopic: '当前知识', familyQuestion: '亲子提问', masteryEvidence: '掌握证据',
      curriculumStandards: '课程标准', sphere: '星球', growth: '成长', knowledgeRing: '知识环',
      gestureTip: '拖动旋转 · 双指缩放 · 点击光点', dataLicense: '数据来源与许可', loading: '正在点亮知识星图…',
      errorTitle: '当前设备无法启动 3D 图谱', errorCopy: '请确认小红书已更新到较新版本后重试。',
      attribution: '署名说明', licenseTitle: '数据来源与许可',
      licenseSource: 'Marble 技能分类体系（v1）· © Generative Spark, Inc.（Marble）。',
      licenseTerms: '数据库结构与关系依据 ODbL 1.0；文本内容依据 CC BY-SA 4.0。课程标准版权归相应教育机构所有。',
      licenseOffline: '本工具为离线可视化呈现，不向外部服务器发送任何数据。',
      ageSuffix: '岁', noneSelected: '未选择', noStandards: '暂无对齐标准', introTopic: '这是入门知识',
      pathEnd: '这是当前路径终点', childName: '孩子', switchLanguage: '切换为英文', localDataMissing: '本地数据包缺失'
    },
    en: {
      brandTitle: 'Kids Knowledge Map', brandSubtitle: 'Learning paths for ages 4–13 · Fully offline', filter: 'Filter',
      searchPlaceholder: 'Search topics, subjects, or domains', exploreEyebrow: 'EXPLORE', exploreRange: 'Explore Range',
      subjects: 'Subjects', selectAll: 'All', ages: 'Ages', preschool: 'Early', primary: 'Primary',
      middle: 'Middle', all: 'All', visibleTopics: 'Visible Topics', visibleRelations: 'Visible Links',
      mapEyebrow: 'KNOWLEDGE MAP', learningUniverse: 'Learning Universe',
      overviewCopy: 'Each light is a learnable micro-topic. Drag to rotate, pinch or scroll to zoom, and tap a light to explore its prerequisites and next steps.',
      topics: 'Topics', relations: 'Dependencies', ageLevels: 'Age Levels', prerequisites: 'Prerequisites',
      unlocks: 'Unlocks', currentTopic: 'Current Topic', familyQuestion: 'Family Prompt', masteryEvidence: 'Evidence of Mastery',
      curriculumStandards: 'Curriculum Standards', sphere: 'Sphere', growth: 'Growth', knowledgeRing: 'Knowledge Ring',
      gestureTip: 'Drag to rotate · Pinch to zoom · Tap a light', dataLicense: 'Data Sources & License', loading: 'Lighting the knowledge map…',
      errorTitle: '3D map is unavailable on this device', errorCopy: 'Please update Xiaohongshu and try again.',
      attribution: 'ATTRIBUTION', licenseTitle: 'Data Sources & License',
      licenseSource: 'Marble Skill Taxonomy (v1) · © Generative Spark, Inc. (Marble).',
      licenseTerms: 'Database structure and relationships are under ODbL 1.0; text is under CC BY-SA 4.0. Curriculum standards remain the property of their respective institutions.',
      licenseOffline: 'This offline visualization sends no data to external servers.',
      ageSuffix: 'years', noneSelected: 'None', noStandards: 'No aligned standard', introTopic: 'This is an entry topic',
      pathEnd: 'This is the end of this path', childName: 'the child', switchLanguage: '切换为中文', localDataMissing: 'Local data bundle is missing'
    }
  };

  const state = {
    topics: [],
    edges: [],
    byId: new Map(),
    incoming: new Map(),
    outgoing: new Map(),
    activeSubjects: new Set(Object.keys(SUBJECTS)),
    activeAges: new Set([4, 5, 6, 7, 8, 9, 10, 11, 12, 13]),
    activeMask: [],
    selectedId: null,
    prereqIds: new Set(),
    unlockIds: new Set(),
    layout: 'tornado',
    currentPositions: null,
    targetPositions: null,
    layouts: {},
    rotX: -0.18,
    rotY: 0.2,
    zoom: 1,
    camera: 1160,
    dragging: false,
    moved: false,
    lastInteraction: 0,
    pointers: new Map(),
    pinchDistance: 0
    ,language: 'zh-CN'
    ,languageCache: new Map()
  };

  const ui = {};
  let gl = null;
  let program = null;
  let positionBuffer = null;
  let colorBuffer = null;
  let linePositionBuffer = null;
  let lineColorBuffer = null;
  let nodeColors = null;
  let linePositions = new Float32Array(0);
  let lineColors = new Float32Array(0);
  let lineCount = 0;
  let lastFrame = 0;
  function $(id) { return document.getElementById(id); }

  function t(key) { return UI_TEXT[state.language][key] || key; }
  function subjectLabel(subject) {
    const config = SUBJECTS[subject];
    return config ? config[state.language === 'zh-CN' ? 'zh' : 'en'] : subject;
  }
  function locale() { return state.language === 'zh-CN' ? 'zh-CN' : 'en-US'; }

  function hexToRgb(hex) {
    const value = Number.parseInt(hex.slice(1), 16);
    return [(value >> 16 & 255) / 255, (value >> 8 & 255) / 255, (value & 255) / 255];
  }

  function initData() {
    if (!DATA || !Array.isArray(DATA.topics) || !Array.isArray(DATA.dependencies)) {
      throw new Error(t('localDataMissing'));
    }
    state.languageCache.set('zh-CN', DATA.topics);
    state.topics = DATA.topics.map(topic => ({
      ...topic,
      evidence: [...(topic.evidence || [])],
      standards: [...(topic.standards || [])]
    }));
    state.edges = DATA.dependencies;
    state.topics.forEach((topic, index) => {
      topic.index = index;
      topic.age = (topic.ageRangeStart + topic.ageRangeEnd) / 2;
      state.byId.set(topic.id, topic);
      state.incoming.set(topic.id, []);
      state.outgoing.set(topic.id, []);
    });
    state.edges = state.edges.map(edge => {
      const source = state.byId.get(edge.prerequisiteId);
      const target = state.byId.get(edge.topicId);
      if (source && target) {
        edge.sourceIndex = source.index;
        edge.targetIndex = target.index;
        state.incoming.get(edge.topicId).push(edge);
        state.outgoing.get(edge.prerequisiteId).push(edge);
      }
      return edge;
    }).filter(edge => Number.isInteger(edge.sourceIndex) && Number.isInteger(edge.targetIndex));
    buildLayouts();
    state.currentPositions = state.layouts.tornado.slice();
    state.targetPositions = state.layouts.tornado.slice();
  }

  function buildLayouts() {
    const count = state.topics.length;
    const sphere = new Float32Array(count * 3);
    const tornado = new Float32Array(count * 3);
    const ring = new Float32Array(count * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    const subjectNames = Object.keys(SUBJECTS);

    state.topics.forEach((topic, i) => {
      const subjectIndex = Math.max(0, subjectNames.indexOf(topic.subject));
      const ageT = (topic.age - 4) / 9;

      const ySphere = 1 - 2 * ((i + .5) / count);
      const sphereRadiusAtY = Math.sqrt(Math.max(0, 1 - ySphere * ySphere));
      const phiSphere = i * golden + subjectIndex * .17;
      const sphereRadius = 405 + (topic.age - 8.5) * 4;
      sphere[i * 3] = Math.cos(phiSphere) * sphereRadiusAtY * sphereRadius;
      sphere[i * 3 + 1] = ySphere * sphereRadius;
      sphere[i * 3 + 2] = Math.sin(phiSphere) * sphereRadiusAtY * sphereRadius;

      const tornadoAngle = i * .39 + subjectIndex * .76;
      const tornadoRadius = 36 + ageT * 350 + subjectIndex * 2.4;
      tornado[i * 3] = Math.cos(tornadoAngle) * tornadoRadius;
      tornado[i * 3 + 1] = (topic.age - 8.5) * 82;
      tornado[i * 3 + 2] = Math.sin(tornadoAngle) * tornadoRadius;

      const theta = i * golden + subjectIndex * .35;
      const tubeAngle = ageT * Math.PI * 2 + subjectIndex * .18;
      const major = 325;
      const minor = 56 + subjectIndex * 4;
      ring[i * 3] = (major + minor * Math.cos(tubeAngle)) * Math.cos(theta);
      ring[i * 3 + 1] = minor * Math.sin(tubeAngle);
      ring[i * 3 + 2] = (major + minor * Math.cos(tubeAngle)) * Math.sin(theta);
    });
    state.layouts = { sphere, tornado, ring };
  }

  function initUi() {
    const ids = [
      'graph-canvas', 'filter-panel', 'filter-open', 'filter-close', 'subject-list',
      'subjects-reset', 'age-list', 'age-summary', 'search-input', 'search-results',
      'visible-topic-count', 'visible-edge-count', 'total-topic-count', 'total-edge-count',
      'info-panel', 'overview-view', 'detail-view', 'detail-close', 'detail-subject',
      'detail-title-cn', 'detail-title-en', 'detail-age', 'detail-type', 'detail-description',
      'assessment-section', 'detail-assessment', 'detail-evidence', 'prereq-count',
      'prereq-list', 'unlock-count', 'unlock-list', 'standards-list', 'theme-toggle',
      'gesture-tip', 'loading', 'error-state', 'license-open', 'license-close', 'modal-backdrop',
      'language-toggle'
    ];
    ids.forEach(id => { ui[id] = $(id); });
    ui['total-topic-count'].textContent = state.topics.length.toLocaleString(locale());
    ui['total-edge-count'].textContent = state.edges.length.toLocaleString(locale());
    updateUiLanguage();
    renderSubjects();
    renderAges();
    bindUiEvents();
    applyFilters();
  }

  function renderSubjects() {
    ui['subject-list'].replaceChildren();
    const counts = new Map();
    state.topics.forEach(topic => counts.set(topic.subject, (counts.get(topic.subject) || 0) + 1));
    Object.entries(SUBJECTS).forEach(entry => {
      const subject = entry[0];
      const config = entry[1];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'subject-chip';
      button.dataset.subject = subject;
      button.style.setProperty('--chip-color', config.color);
      const dot = document.createElement('i');
      const label = document.createElement('strong');
      const count = document.createElement('small');
      label.textContent = subjectLabel(subject);
      count.textContent = String(counts.get(subject) || 0);
      button.append(dot, label, count);
      button.classList.toggle('active', state.activeSubjects.has(subject));
      button.classList.toggle('inactive', !state.activeSubjects.has(subject));
      button.addEventListener('click', () => {
        if (state.activeSubjects.has(subject)) state.activeSubjects.delete(subject);
        else state.activeSubjects.add(subject);
        button.classList.toggle('active', state.activeSubjects.has(subject));
        button.classList.toggle('inactive', !state.activeSubjects.has(subject));
        applyFilters();
      });
      ui['subject-list'].appendChild(button);
    });
  }

  function renderAges() {
    ui['age-list'].replaceChildren();
    for (let age = 4; age <= 13; age += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'active';
      button.dataset.age = String(age);
      button.textContent = String(age);
      button.setAttribute('aria-label', age + ' ' + t('ageSuffix'));
      button.addEventListener('click', () => {
        if (state.activeAges.has(age)) state.activeAges.delete(age);
        else state.activeAges.add(age);
        button.classList.toggle('active', state.activeAges.has(age));
        updateAgeSummary();
        applyFilters();
      });
      ui['age-list'].appendChild(button);
    }
  }

  function updateAgeSummary() {
    const ages = Array.from(state.activeAges).sort((a, b) => a - b);
    ui['age-summary'].textContent = ages.length ? ages[0] + '–' + ages[ages.length - 1] + ' ' + t('ageSuffix') : t('noneSelected');
  }

  function updateUiLanguage() {
    document.documentElement.lang = state.language;
    document.title = t('brandTitle');
    document.querySelectorAll('[data-i18n]').forEach(element => {
      element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      element.placeholder = t(element.dataset.i18nPlaceholder);
    });
    ui['language-toggle'].textContent = state.language === 'zh-CN' ? 'EN' : '中';
    ui['language-toggle'].setAttribute('aria-label', t('switchLanguage'));
    ui['filter-open'].setAttribute('aria-label', t('filter'));
  }

  function loadLanguageBundle(language) {
    if (state.languageCache.has(language)) return Promise.resolve(state.languageCache.get(language));
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = language === 'zh-CN' ? './data/topics.zh-CN.js' : './data/topics.en.js';
      script.onload = () => {
        const topics = globalThis.XHS_TOPIC_DATA;
        script.remove();
        if (!Array.isArray(topics)) {
          reject(new Error(t('localDataMissing')));
          return;
        }
        state.languageCache.set(language, topics);
        resolve(topics);
      };
      script.onerror = () => {
        script.remove();
        reject(new Error(t('localDataMissing')));
      };
      document.head.appendChild(script);
    });
  }

  async function switchLanguage() {
    const nextLanguage = state.language === 'zh-CN' ? 'en' : 'zh-CN';
    ui['language-toggle'].disabled = true;
    try {
      const translatedTopics = await loadLanguageBundle(nextLanguage);
      const translatedById = new Map(translatedTopics.map(topic => [topic.id, topic]));
      state.topics.forEach(topic => {
        const translated = translatedById.get(topic.id);
        if (!translated) return;
        topic.domain = translated.domain;
        topic.name = translated.name;
        topic.description = translated.description;
        topic.assessmentPrompt = translated.assessmentPrompt;
        topic.evidence = [...(translated.evidence || [])];
        topic.standards = [...(translated.standards || [])];
      });
      state.language = nextLanguage;
      updateUiLanguage();
      renderSubjects();
      ui['age-list'].querySelectorAll('button').forEach(button => {
        button.setAttribute('aria-label', button.dataset.age + ' ' + t('ageSuffix'));
      });
      updateAgeSummary();
      ui['search-input'].value = '';
      ui['search-results'].hidden = true;
      ui['total-topic-count'].textContent = state.topics.length.toLocaleString(locale());
      ui['total-edge-count'].textContent = state.edges.length.toLocaleString(locale());
      applyFilters();
      if (state.selectedId) showDetail(state.byId.get(state.selectedId));
    } catch (error) {
      ui['error-state'].hidden = false;
    } finally {
      ui['language-toggle'].disabled = false;
    }
  }

  function bindUiEvents() {
    ui['filter-open'].addEventListener('click', () => ui['filter-panel'].classList.add('open'));
    ui['filter-close'].addEventListener('click', () => ui['filter-panel'].classList.remove('open'));
    ui['subjects-reset'].addEventListener('click', () => {
      state.activeSubjects = new Set(Object.keys(SUBJECTS));
      ui['subject-list'].querySelectorAll('.subject-chip').forEach(button => {
        button.classList.add('active');
        button.classList.remove('inactive');
      });
      applyFilters();
    });

    document.querySelectorAll('[data-age-min]').forEach(button => {
      button.addEventListener('click', () => {
        const min = Number(button.dataset.ageMin);
        const max = Number(button.dataset.ageMax);
        state.activeAges.clear();
        for (let age = min; age <= max; age += 1) state.activeAges.add(age);
        ui['age-list'].querySelectorAll('button').forEach(ageButton => {
          ageButton.classList.toggle('active', state.activeAges.has(Number(ageButton.dataset.age)));
        });
        updateAgeSummary();
        applyFilters();
      });
    });

    document.querySelectorAll('[data-layout]').forEach(button => {
      button.addEventListener('click', () => {
        state.layout = button.dataset.layout;
        state.targetPositions = state.layouts[state.layout];
        document.querySelectorAll('[data-layout]').forEach(item => item.classList.toggle('active', item === button));
        markInteraction();
      });
    });

    ui['detail-close'].addEventListener('click', closeDetail);
    ui['language-toggle'].addEventListener('click', switchLanguage);
    ui['search-input'].addEventListener('input', onSearch);
    ui['search-input'].addEventListener('focus', onSearch);
    document.addEventListener('pointerdown', event => {
      if (!ui['search-results'].contains(event.target) && event.target !== ui['search-input']) {
        ui['search-results'].hidden = true;
      }
    });

    ui['theme-toggle'].addEventListener('click', () => {
      const light = document.body.classList.toggle('light-theme');
      ui['theme-toggle'].textContent = light ? '☾' : '☀';
      try { localStorage.setItem('knowledge-map-theme', light ? 'light' : 'dark'); } catch (error) { /* local storage is optional */ }
      updateColors();
    });
    try {
      if (localStorage.getItem('knowledge-map-theme') === 'light') {
        document.body.classList.add('light-theme');
        ui['theme-toggle'].textContent = '☾';
      }
    } catch (error) { /* local storage is optional */ }

    ui['license-open'].addEventListener('click', () => { ui['modal-backdrop'].hidden = false; });
    ui['license-close'].addEventListener('click', () => { ui['modal-backdrop'].hidden = true; });
    ui['modal-backdrop'].addEventListener('click', event => {
      if (event.target === ui['modal-backdrop']) ui['modal-backdrop'].hidden = true;
    });
  }

  function onSearch() {
    const query = ui['search-input'].value.trim().toLowerCase();
    ui['search-results'].replaceChildren();
    if (!query) {
      ui['search-results'].hidden = true;
      return;
    }
    const matches = [];
    for (const topic of state.topics) {
      if (!state.activeMask[topic.index]) continue;
      const haystack = [topic.name, topic.domain, topic.subject, subjectLabel(topic.subject)].join(' ').toLowerCase();
      if (haystack.includes(query)) matches.push(topic);
      if (matches.length >= 10) break;
    }
    matches.forEach(topic => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('role', 'option');
      const title = document.createElement('strong');
      const meta = document.createElement('small');
      title.textContent = topic.name;
      meta.textContent = topic.domain + ' · ' + subjectLabel(topic.subject);
      button.append(title, meta);
      button.addEventListener('click', () => {
        ui['search-input'].value = topic.name;
        ui['search-results'].hidden = true;
        selectTopic(topic.id);
      });
      ui['search-results'].appendChild(button);
    });
    ui['search-results'].hidden = matches.length === 0;
  }

  function topicIsActive(topic) {
    if (!state.activeSubjects.has(topic.subject)) return false;
    for (let age = Math.ceil(topic.ageRangeStart); age <= Math.floor(topic.ageRangeEnd); age += 1) {
      if (state.activeAges.has(age)) return true;
    }
    return false;
  }

  function applyFilters() {
    state.activeMask = state.topics.map(topicIsActive);
    let visibleTopics = 0;
    state.activeMask.forEach(active => { if (active) visibleTopics += 1; });
    let visibleEdges = 0;
    state.edges.forEach(edge => {
      if (state.activeMask[edge.sourceIndex] && state.activeMask[edge.targetIndex]) visibleEdges += 1;
    });
    ui['visible-topic-count'].textContent = visibleTopics.toLocaleString(locale());
    ui['visible-edge-count'].textContent = visibleEdges.toLocaleString(locale());
    if (state.selectedId) {
      const selected = state.byId.get(state.selectedId);
      if (!selected || !state.activeMask[selected.index]) closeDetail();
    }
    updateColors();
  }

  function calculatePaths(id) {
    state.prereqIds.clear();
    state.unlockIds.clear();
    const before = [id];
    const beforeSeen = new Set([id]);
    while (before.length) {
      const current = before.shift();
      (state.incoming.get(current) || []).forEach(edge => {
        if (!beforeSeen.has(edge.prerequisiteId)) {
          beforeSeen.add(edge.prerequisiteId);
          state.prereqIds.add(edge.prerequisiteId);
          before.push(edge.prerequisiteId);
        }
      });
    }
    const after = [id];
    const afterSeen = new Set([id]);
    while (after.length) {
      const current = after.shift();
      (state.outgoing.get(current) || []).forEach(edge => {
        if (!afterSeen.has(edge.topicId)) {
          afterSeen.add(edge.topicId);
          state.unlockIds.add(edge.topicId);
          after.push(edge.topicId);
        }
      });
    }
  }

  function selectTopic(id) {
    const topic = state.byId.get(id);
    if (!topic || !state.activeMask[topic.index]) return;
    state.selectedId = id;
    calculatePaths(id);
    showDetail(topic);
    updateColors();
    markInteraction();
  }

  function closeDetail() {
    state.selectedId = null;
    state.prereqIds.clear();
    state.unlockIds.clear();
    ui['detail-view'].hidden = true;
    ui['overview-view'].hidden = false;
    ui['info-panel'].classList.remove('has-detail');
    updateColors();
  }

  function showDetail(topic) {
    const config = SUBJECTS[topic.subject];
    ui['overview-view'].hidden = true;
    ui['detail-view'].hidden = false;
    ui['info-panel'].classList.add('has-detail');
    ui['detail-subject'].textContent = subjectLabel(topic.subject) + ' · ' + topic.domain;
    ui['detail-subject'].style.color = config.color;
    ui['detail-title-cn'].textContent = topic.name;
    ui['detail-title-en'].textContent = '';
    ui['detail-age'].textContent = topic.ageRangeStart + '–' + topic.ageRangeEnd + ' ' + t('ageSuffix');
    ui['detail-type'].textContent = TYPES[topic.type] ? TYPES[topic.type][state.language === 'zh-CN' ? 'zh' : 'en'] : topic.type;
    ui['detail-description'].textContent = topic.description;

    if (topic.assessmentPrompt) {
      ui['assessment-section'].hidden = false;
      ui['detail-assessment'].textContent = state.language === 'zh-CN'
        ? topic.assessmentPrompt.replace(/\{\{name\}\}\s*/g, t('childName'))
        : topic.assessmentPrompt.split('{{name}}').join(t('childName'));
    } else {
      ui['assessment-section'].hidden = true;
    }
    ui['detail-evidence'].replaceChildren();
    (topic.evidence || []).forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      ui['detail-evidence'].appendChild(li);
    });
    renderRelations(topic, 'prereq');
    renderRelations(topic, 'unlock');
    ui['standards-list'].replaceChildren();
    if (topic.standards && topic.standards.length) {
      topic.standards.forEach(standard => {
        const span = document.createElement('span');
        span.textContent = standard;
        ui['standards-list'].appendChild(span);
      });
    } else {
      const span = document.createElement('span');
      span.textContent = t('noStandards');
      ui['standards-list'].appendChild(span);
    }
  }

  function renderRelations(topic, kind) {
    const isPrereq = kind === 'prereq';
    const edges = isPrereq ? (state.incoming.get(topic.id) || []) : (state.outgoing.get(topic.id) || []);
    const list = ui[isPrereq ? 'prereq-list' : 'unlock-list'];
    const count = ui[isPrereq ? 'prereq-count' : 'unlock-count'];
    list.replaceChildren();
    count.textContent = String(edges.length);
    if (!edges.length) {
      const empty = document.createElement('span');
      empty.textContent = isPrereq ? t('introTopic') : t('pathEnd');
      list.appendChild(empty);
      return;
    }
    edges.slice(0, 12).forEach(edge => {
      const related = state.byId.get(isPrereq ? edge.prerequisiteId : edge.topicId);
      if (!related) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = related.name + ' · ' + related.ageRangeStart + '–' + related.ageRangeEnd + ' ' + t('ageSuffix');
      button.addEventListener('click', () => selectTopic(related.id));
      list.appendChild(button);
    });
  }

  function initWebGl() {
    const canvas = ui['graph-canvas'];
    gl = canvas.getContext('webgl', { alpha: false, antialias: true, depth: true, powerPreference: 'high-performance' });
    if (!gl) return false;

    const vertexSource = [
      'attribute vec3 a_position;',
      'attribute vec4 a_color;',
      'uniform float u_rotX;',
      'uniform float u_rotY;',
      'uniform float u_zoom;',
      'uniform float u_aspect;',
      'uniform float u_camera;',
      'uniform float u_pointSize;',
      'varying vec4 v_color;',
      'void main(){',
      '  vec3 p = a_position * u_zoom;',
      '  float cy = cos(u_rotY); float sy = sin(u_rotY);',
      '  float x1 = cy*p.x + sy*p.z;',
      '  float z1 = -sy*p.x + cy*p.z;',
      '  float cx = cos(u_rotX); float sx = sin(u_rotX);',
      '  float y2 = cx*p.y - sx*z1;',
      '  float z2 = sx*p.y + cx*z1;',
      '  float depth = max(260.0, u_camera-z2);',
      '  vec2 ndc = vec2(x1/(depth*0.72*u_aspect), y2/(depth*0.72));',
      '  gl_Position = vec4(ndc, min(0.98, depth/(u_camera*2.0)), 1.0);',
      '  gl_PointSize = u_pointSize * clamp(u_camera/depth, 0.55, 2.4);',
      '  v_color = a_color;',
      '}'
    ].join('\n');
    const fragmentSource = [
      'precision mediump float;',
      'uniform float u_points;',
      'varying vec4 v_color;',
      'void main(){',
      '  if (u_points > 0.5) {',
      '    vec2 delta = gl_PointCoord - vec2(0.5);',
      '    float radius = dot(delta, delta);',
      '    if (radius > 0.25) discard;',
      '    float glow = 1.0 - smoothstep(0.04, 0.25, radius);',
      '    gl_FragColor = vec4(v_color.rgb + glow*0.28, v_color.a);',
      '  } else {',
      '    gl_FragColor = v_color;',
      '  }',
      '}'
    ].join('\n');
    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) return false;
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
    gl.useProgram(program);
    positionBuffer = gl.createBuffer();
    colorBuffer = gl.createBuffer();
    linePositionBuffer = gl.createBuffer();
    lineColorBuffer = gl.createBuffer();
    nodeColors = new Float32Array(state.topics.length * 4);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.CULL_FACE);
    bindCanvasEvents(canvas);
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    updateColors();
    return true;
  }

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
    return shader;
  }

  function updateColors() {
    if (!nodeColors) return;
    const dimOthers = Boolean(state.selectedId);
    state.topics.forEach((topic, index) => {
      const offset = index * 4;
      const active = state.activeMask[index];
      let rgb = hexToRgb(SUBJECTS[topic.subject].color);
      let alpha = active ? (dimOthers ? .14 : .82) : 0;
      if (topic.id === state.selectedId) { rgb = [1, 1, 1]; alpha = 1; }
      else if (state.prereqIds.has(topic.id)) { rgb = [.22, .61, 1]; alpha = active ? .96 : 0; }
      else if (state.unlockIds.has(topic.id)) { rgb = [1, .28, .43]; alpha = active ? .96 : 0; }
      nodeColors[offset] = rgb[0];
      nodeColors[offset + 1] = rgb[1];
      nodeColors[offset + 2] = rgb[2];
      nodeColors[offset + 3] = alpha;
    });
  }

  function updateLineArrays() {
    const positions = [];
    const colors = [];
    const light = document.body.classList.contains('light-theme');
    const neutral = light ? [.23, .35, .5] : [.46, .62, .83];
    const selectedSetBefore = new Set(state.prereqIds);
    const selectedSetAfter = new Set(state.unlockIds);
    if (state.selectedId) {
      selectedSetBefore.add(state.selectedId);
      selectedSetAfter.add(state.selectedId);
    }
    state.edges.forEach(edge => {
      if (!state.activeMask[edge.sourceIndex] || !state.activeMask[edge.targetIndex]) return;
      const sourceId = state.topics[edge.sourceIndex].id;
      const targetId = state.topics[edge.targetIndex].id;
      let rgb = neutral;
      let alpha = state.selectedId ? .025 : .105;
      if (state.selectedId && selectedSetBefore.has(sourceId) && selectedSetBefore.has(targetId)) {
        rgb = [.22, .61, 1]; alpha = .7;
      } else if (state.selectedId && selectedSetAfter.has(sourceId) && selectedSetAfter.has(targetId)) {
        rgb = [1, .28, .43]; alpha = .7;
      }
      const sourceOffset = edge.sourceIndex * 3;
      const targetOffset = edge.targetIndex * 3;
      positions.push(
        state.currentPositions[sourceOffset], state.currentPositions[sourceOffset + 1], state.currentPositions[sourceOffset + 2],
        state.currentPositions[targetOffset], state.currentPositions[targetOffset + 1], state.currentPositions[targetOffset + 2]
      );
      colors.push(rgb[0], rgb[1], rgb[2], alpha, rgb[0], rgb[1], rgb[2], alpha);
    });
    linePositions = new Float32Array(positions);
    lineColors = new Float32Array(colors);
    lineCount = positions.length / 3;
  }

  function resizeCanvas() {
    if (!gl) return;
    const canvas = ui['graph-canvas'];
    const ratio = Math.min(globalThis.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
  }

  function animate(time) {
    const delta = Math.min(40, Math.max(0, time - lastFrame));
    lastFrame = time;
    let moving = false;
    for (let i = 0; i < state.currentPositions.length; i += 1) {
      const diff = state.targetPositions[i] - state.currentPositions[i];
      if (Math.abs(diff) > .08) moving = true;
      state.currentPositions[i] += diff * Math.min(.2, delta * .0065);
    }
    if (!state.dragging && time - state.lastInteraction > 1600) state.rotY += delta * .00009;
    renderFrame(moving);
    globalThis.requestAnimationFrame(animate);
  }

  function renderFrame() {
    resizeCanvas();
    updateLineArrays();
    const light = document.body.classList.contains('light-theme');
    const background = light ? [0.929, 0.953, 0.984, 1] : [0.027, 0.067, 0.122, 1];
    gl.clearColor(background[0], background[1], background[2], background[3]);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    setUniforms();

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');
    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(colorLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, linePositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, linePositions, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, lineColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, lineColors, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);
    gl.uniform1f(gl.getUniformLocation(program, 'u_points'), 0);
    gl.drawArrays(gl.LINES, 0, lineCount);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, state.currentPositions, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, nodeColors, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);
    gl.uniform1f(gl.getUniformLocation(program, 'u_points'), 1);
    gl.drawArrays(gl.POINTS, 0, state.topics.length);
  }

  function setUniforms() {
    const canvas = ui['graph-canvas'];
    gl.uniform1f(gl.getUniformLocation(program, 'u_rotX'), state.rotX);
    gl.uniform1f(gl.getUniformLocation(program, 'u_rotY'), state.rotY);
    gl.uniform1f(gl.getUniformLocation(program, 'u_zoom'), state.zoom);
    gl.uniform1f(gl.getUniformLocation(program, 'u_aspect'), canvas.width / canvas.height);
    gl.uniform1f(gl.getUniformLocation(program, 'u_camera'), state.camera);
    gl.uniform1f(gl.getUniformLocation(program, 'u_pointSize'), innerWidth <= 820 ? 7.5 : 6.2);
  }

  function bindCanvasEvents(canvas) {
    canvas.addEventListener('pointerdown', event => {
      canvas.setPointerCapture(event.pointerId);
      state.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY });
      state.dragging = true;
      state.moved = false;
      if (state.pointers.size === 2) state.pinchDistance = pointerDistance();
      markInteraction();
    });
    canvas.addEventListener('pointermove', event => {
      const previous = state.pointers.get(event.pointerId);
      if (!previous) return;
      const dx = event.clientX - previous.x;
      const dy = event.clientY - previous.y;
      previous.x = event.clientX;
      previous.y = event.clientY;
      if (Math.hypot(event.clientX - previous.startX, event.clientY - previous.startY) > 5) state.moved = true;
      if (state.pointers.size === 1) {
        state.rotY += dx * .006;
        state.rotX = Math.max(-1.2, Math.min(1.2, state.rotX + dy * .005));
      } else if (state.pointers.size === 2) {
        const distance = pointerDistance();
        if (state.pinchDistance > 0) state.zoom = Math.max(.55, Math.min(2.2, state.zoom * distance / state.pinchDistance));
        state.pinchDistance = distance;
      }
      markInteraction();
    });
    const endPointer = event => {
      const previous = state.pointers.get(event.pointerId);
      const wasTap = previous && !state.moved && state.pointers.size === 1;
      state.pointers.delete(event.pointerId);
      state.dragging = state.pointers.size > 0;
      state.pinchDistance = state.pointers.size === 2 ? pointerDistance() : 0;
      if (wasTap) pickTopic(event.clientX, event.clientY);
    };
    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);
    canvas.addEventListener('wheel', event => {
      event.preventDefault();
      state.zoom = Math.max(.55, Math.min(2.2, state.zoom * Math.exp(-event.deltaY * .001)));
      markInteraction();
    }, { passive: false });
  }

  function pointerDistance() {
    const points = Array.from(state.pointers.values());
    if (points.length < 2) return 0;
    return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
  }

  function project(index) {
    const offset = index * 3;
    const x = state.currentPositions[offset] * state.zoom;
    const y = state.currentPositions[offset + 1] * state.zoom;
    const z = state.currentPositions[offset + 2] * state.zoom;
    const cy = Math.cos(state.rotY);
    const sy = Math.sin(state.rotY);
    const x1 = cy * x + sy * z;
    const z1 = -sy * x + cy * z;
    const cx = Math.cos(state.rotX);
    const sx = Math.sin(state.rotX);
    const y2 = cx * y - sx * z1;
    const z2 = sx * y + cx * z1;
    const depth = Math.max(260, state.camera - z2);
    const canvas = ui['graph-canvas'];
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const ndcX = x1 / (depth * .72 * aspect);
    const ndcY = y2 / (depth * .72);
    return {
      x: (ndcX * .5 + .5) * canvas.clientWidth,
      y: (-ndcY * .5 + .5) * canvas.clientHeight,
      depth
    };
  }

  function pickTopic(clientX, clientY) {
    const rect = ui['graph-canvas'].getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    let nearest = null;
    let nearestDistance = innerWidth <= 820 ? 22 : 15;
    state.topics.forEach((topic, index) => {
      if (!state.activeMask[index]) return;
      const point = project(index);
      const distance = Math.hypot(point.x - x, point.y - y);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = topic;
      }
    });
    if (nearest) selectTopic(nearest.id);
  }

  function markInteraction() {
    state.lastInteraction = performance.now();
    ui['gesture-tip'].classList.add('hidden');
  }

  function showError() {
    ui['loading'].classList.add('hidden');
    ui['error-state'].hidden = false;
  }

  function init() {
    try {
      initData();
      initUi();
      if (!initWebGl()) {
        showError();
        return;
      }
      globalThis.requestAnimationFrame(animate);
      globalThis.setTimeout(() => ui['loading'].classList.add('hidden'), 450);
      globalThis.setTimeout(() => ui['gesture-tip'].classList.add('hidden'), 5200);
    } catch (error) {
      showError();
    }
  }

  document.addEventListener('DOMContentLoaded', init);
}());
