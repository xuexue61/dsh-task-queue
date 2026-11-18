window.__ModuleLoader__.load({
  id: 'dsh-task-queue',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'taskQueue';
    const STORE_KEY = 'task-queue:by-workspace:v2';
    const PREFS_KEY = 'task-queue:prefs:v2';
    const LEGACY_TASKS_KEY = 'task-queue:tasks:v1';
    const LEGACY_AUTO_KEY = 'task-queue:auto:v1';
    const PRIORITIES = ['high', 'medium', 'low'];
    const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };
    const SCOPES = ['session', 'project'];

    const DICTS = {
      zh: {
        'view.label': '任务清单',
        title: '任务清单',
        subtitle: '记录事项、设置优先级，一键发给 AI 执行',
        project: '项目',
        noProject: '未关联项目',
        pending: '待发送',
        running: '执行中',
        sent: '执行中',
        done: '已完成',
        failed: '发送失败',
        addPlaceholder: '输入一条事项，回车添加…',
        add: '添加',
        send: '发送',
        retry: '重试',
        remove: '删除',
        edit: '修改内容',
        save: '保存',
        cancel: '取消',
        changePriority: '修改优先级',
        editHint: 'Enter 保存，Shift+Enter 换行，Esc 取消',
        auto: '自动执行',
        autoHint: '仅对本对话生效：会话空闲时自动发送优先级最高的事项',
        priority_high: '高',
        priority_medium: '中',
        priority_low: '低',
        scope_session: '这个对话',
        scope_project: '全部',
        scopeTag_session: '本对话',
        scopeTag_project: '全部',
        scopeHint: '「这个对话」只在本会话显示；「全部」在本项目所有会话显示',
        empty: '这个项目还没有事项。在下面输入一条，回车即可添加。',
        pendingCount: '{n} 项待执行',
        hiddenSession: '{n} 项其他对话的事项',
        runningBadge: 'AI 执行中…',
        idleBadge: '空闲',
        clearDone: '清除已完成',
      },
      en: {
        'view.label': 'Tasks',
        title: 'Task queue',
        subtitle: 'Record items, set priorities, and send them to the AI in one click',
        project: 'Project',
        noProject: 'No project',
        pending: 'Pending',
        running: 'Running',
        sent: 'Running',
        done: 'Done',
        failed: 'Send failed',
        addPlaceholder: 'Type an item and press Enter…',
        add: 'Add',
        send: 'Send',
        retry: 'Retry',
        remove: 'Remove',
        edit: 'Edit',
        save: 'Save',
        cancel: 'Cancel',
        changePriority: 'Change priority',
        editHint: 'Enter saves, Shift+Enter adds a line, Esc cancels',
        auto: 'Auto-run',
        autoHint: 'Applies to this chat only: send the highest-priority item whenever it is idle',
        priority_high: 'High',
        priority_medium: 'Medium',
        priority_low: 'Low',
        scope_session: 'This chat',
        scope_project: 'All',
        scopeTag_session: 'Chat',
        scopeTag_project: 'All',
        scopeHint: '"This chat" shows only in this conversation; "All" shows in every conversation of the project',
        empty: 'This project has no items yet. Type one below and press Enter.',
        pendingCount: '{n} pending',
        hiddenSession: '{n} item(s) in other chats',
        runningBadge: 'AI running…',
        idleBadge: 'Idle',
        clearDone: 'Clear done',
      },
    };

    const css = `
.tq2-root {
  display: flex; flex-direction: column; box-sizing: border-box;
  width: 100%; height: 100%; flex: 1 1 auto; min-height: 0; overflow: hidden;
  color: var(--dsw-alias-label-primary); font-size: 13px; font-family: var(--dsw-font-family);
}
.tq2-head { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; padding: 12px 16px 2px; flex: none; }
.tq2-title { font-size: 15px; font-weight: 500; }
.tq2-sub { color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.tq2-project {
  display: inline-flex; align-items: center; gap: 4px; margin-left: auto;
  font-size: 12px; color: var(--dsw-alias-label-tertiary);
}
.tq2-project b { font-weight: 400; color: var(--dsw-alias-label-secondary); }
.tq2-list {
  flex: 1; min-height: 0; overflow-y: auto;
  display: flex; flex-direction: column;
  padding: 4px 8px 10px;
}
.tq2-empty { padding: 20px 8px; color: var(--dsw-alias-label-tertiary); font-size: 13px; }
.tq2-row {
  display: flex; align-items: center; gap: 8px;
  box-sizing: border-box; padding: 8px 8px;
  border-radius: var(--dsw-radius-sm);
  border-top: 1px solid var(--dsw-alias-border-l1);
}
.tq2-row:first-child { border-top-color: transparent; }
.tq2-row:hover { background: var(--dsw-alias-interactive-bg-hover); }
.tq2-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.tq2-text {
  display: block; width: 100%; box-sizing: border-box;
  margin: 0; padding: 0; border: none; border-radius: var(--dsw-radius-xs);
  background: transparent; text-align: left; cursor: text;
  font: inherit; font-size: 14px; font-weight: 400; line-height: 21px;
  color: var(--dsw-alias-label-primary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.tq2-text:hover { color: var(--dsw-alias-label-primary); }
.tq2-text:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.tq2-row[data-status="done"] .tq2-text { color: var(--dsw-alias-label-tertiary); }
.tq2-row[data-status="failed"] .tq2-text { color: var(--dsw-alias-label-secondary); }
.tq2-meta {
  display: flex; align-items: center; gap: 6px; min-width: 0;
  font-size: 12px; line-height: 16px; color: var(--dsw-alias-label-tertiary);
}
.tq2-pri {
  border: none; background: transparent; padding: 0; margin: 0;
  font: inherit; font-size: 12px; line-height: 16px;
  color: var(--dsw-alias-label-tertiary); cursor: pointer;
}
.tq2-pri:hover { color: var(--dsw-alias-label-secondary); }
.tq2-pri[data-pri="high"] { color: var(--dsw-alias-state-warn-primary); }
.tq2-dot { color: var(--dsw-alias-label-tertiary); opacity: .5; }
.tq2-state[data-status="running"], .tq2-state[data-status="sent"] { color: var(--dsw-alias-state-warn-primary); }
.tq2-state[data-status="done"] { color: var(--dsw-alias-label-tertiary); }
.tq2-state[data-status="failed"] { color: var(--dsw-alias-state-error-primary); }
.tq2-error {
  font-size: 12px; line-height: 16px; color: var(--dsw-alias-state-error-primary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.tq2-actions { display: flex; align-items: center; gap: 2px; flex: none; }
.tq2-secondary { display: inline-flex; align-items: center; gap: 2px; }
.tq2-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; padding: 0;
  border: none; border-radius: var(--dsw-radius-xs); background: transparent;
  color: var(--dsw-alias-label-tertiary); cursor: pointer; font-size: 12px; line-height: 1;
}
.tq2-icon:hover { background: var(--dsw-alias-interactive-bg-active); color: var(--dsw-alias-label-secondary); }
.tq2-send {
  border: none; border-radius: var(--dsw-radius-sm); background: transparent;
  color: var(--dsw-alias-brand-primary); font: inherit; font-size: 12px;
  line-height: 18px; padding: 3px 8px; cursor: pointer;
}
.tq2-send:hover { background: var(--dsw-alias-interactive-bg-hover); }
.tq2-send:disabled { opacity: .4; cursor: default; background: transparent; }
.tq2-edit {
  display: block; width: 100%; box-sizing: border-box; min-height: 54px; resize: vertical;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: var(--dsw-radius-sm);
  background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary);
  padding: 7px 9px; font: inherit; font-size: 14px; line-height: 20px; outline: none;
}
.tq2-edit:focus { border-color: var(--dsw-alias-brand-primary); }
.tq2-foot {
  flex: none; display: flex; flex-direction: column; gap: 6px;
  width: 100%; box-sizing: border-box; padding: 8px 16px 10px;
  border-top: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-base);
}
.tq2-bar { display: flex; align-items: center; gap: 6px; width: 100%; box-sizing: border-box; }
.tq2-input {
  flex: 1 1 auto; width: 100%; min-width: 0; box-sizing: border-box;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: var(--dsw-radius-sm);
  background: transparent; color: var(--dsw-alias-label-primary);
  padding: 6px 10px; font: inherit; font-size: 13px; line-height: 20px; outline: none;
}
.tq2-input::placeholder { color: var(--dsw-alias-label-tertiary); }
.tq2-input:focus { border-color: var(--dsw-alias-brand-primary); }
.tq2-select {
  flex: none; border: 1px solid var(--dsw-alias-border-l1); border-radius: var(--dsw-radius-sm);
  background: transparent; color: var(--dsw-alias-label-secondary);
  padding: 5px 8px; font: inherit; font-size: 12px; cursor: pointer;
}
.tq2-select:hover { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-border-l2); }
.tq2-btn {
  flex: none; border: 1px solid var(--dsw-alias-border-l1); border-radius: var(--dsw-radius-sm);
  background: transparent; color: var(--dsw-alias-label-primary);
  padding: 5px 12px; font: inherit; font-size: 13px; line-height: 20px; cursor: pointer;
}
.tq2-btn:hover { background: var(--dsw-alias-interactive-bg-hover); }
.tq2-btn[data-primary="true"] {
  border-color: transparent; background: var(--dsw-alias-brand-primary); color: #fff;
}
.tq2-btn[data-primary="true"]:hover { opacity: .92; }
.tq2-btn[data-ghost="true"] { border-color: transparent; color: var(--dsw-alias-label-tertiary); padding: 5px 8px; }
.tq2-btn[data-ghost="true"]:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }
.tq2-footmeta { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--dsw-alias-label-tertiary); flex-wrap: wrap; }
.tq2-spacer { flex: 1; }
.tq2-switch { display: inline-flex; align-items: center; gap: 5px; cursor: pointer; user-select: none; color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.tq2-switch:hover { color: var(--dsw-alias-label-secondary); }
.tq2-switch input { accent-color: var(--dsw-alias-brand-primary); margin: 0; }
.tq2-live { display: inline-flex; align-items: center; gap: 4px; }
.tq2-live[data-running="true"] { color: var(--dsw-alias-state-warn-primary); }
/* Quiet secondary row actions, revealed the way host message actions are. */
@media (hover: hover) {
  .tq2-secondary { opacity: 0; transition: opacity 80ms ease; }
  .tq2-row:hover .tq2-secondary, .tq2-row:focus-within .tq2-secondary { opacity: 1; }
}
`;

    function readJson(key, fallback) {
      try {
        const raw = window.localStorage.getItem(key);
        if (raw === null) return fallback;
        const value = JSON.parse(raw);
        return value === null || value === undefined ? fallback : value;
      } catch (error) {
        return fallback;
      }
    }
    function writeJson(key, value) {
      try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* unavailable */ }
    }
    function removeKey(key) {
      try { window.localStorage.removeItem(key); } catch (error) { /* unavailable */ }
    }

    /** Migration of the pre-isolation global list into the first project that opens it. */
    function takeLegacy() {
      const legacyTasks = readJson(LEGACY_TASKS_KEY, null);
      const legacyAuto = readJson(LEGACY_AUTO_KEY, null);
      if (!Array.isArray(legacyTasks) || legacyTasks.length === 0) {
        if (legacyTasks !== null) removeKey(LEGACY_TASKS_KEY);
        if (legacyAuto !== null) removeKey(LEGACY_AUTO_KEY);
        return { tasks: [] };
      }
      return { tasks: legacyTasks };
    }

    /** Auto-run is a per-conversation decision, so its key carries the session too. */
    function autoKey(projectKey, sessionId) {
      return projectKey + '|' + sessionId;
    }

    function readPrefs(sessionId) {
      const all = readJson(PREFS_KEY, null);
      if (all === null || typeof all !== 'object') return {};
      const mine = all[sessionId];
      return mine !== undefined && mine !== null && typeof mine === 'object' ? mine : {};
    }
    function writePrefs(sessionId, next) {
      const all = readJson(PREFS_KEY, null);
      const map = all !== null && typeof all === 'object' ? all : {};
      map[sessionId] = { ...(map[sessionId] !== undefined && map[sessionId] !== null ? map[sessionId] : {}), ...next };
      writeJson(PREFS_KEY, map);
    }

    /**
     * Per-project task buckets plus per-conversation auto-run switches.
     * A project bucket is addressed by a project key derived from the Session's
     * Workspace, or its directory before the Workspace projection lists it.
     */
    function createStore() {
      const saved = readJson(STORE_KEY, null);
      const store = {
        data: saved !== null && typeof saved === 'object' && saved.buckets !== undefined
          ? saved
          : { buckets: {}, auto: {}, migrated: false },
        listeners: new Set(),
        get(key) {
          const bucket = store.data.buckets[key];
          return Array.isArray(bucket) ? bucket : [];
        },
        isAuto(projectKey, sessionId) {
          return store.data.auto[autoKey(projectKey, sessionId)] === true;
        },
        hasBucket(key) { return Array.isArray(store.data.buckets[key]); },
        ensureBucket(key) {
          if (store.hasBucket(key)) return;
          if (store.data.migrated !== true) {
            const legacy = takeLegacy();
            store.data.buckets[key] = legacy.tasks;
            store.data.migrated = true;
            removeKey(LEGACY_TASKS_KEY);
            removeKey(LEGACY_AUTO_KEY);
          } else {
            store.data.buckets[key] = [];
          }
          store.persist();
          store.emit();
        },
        subscribe(listener) {
          store.listeners.add(listener);
          return () => { store.listeners.delete(listener); };
        },
        emit() { for (const listener of store.listeners) listener(); },
        persist() {
          try {
            const buckets = {};
            for (const key of Object.keys(store.data.buckets)) {
              const list = store.data.buckets[key];
              if (Array.isArray(list) && list.length > 0) buckets[key] = list;
            }
            writeJson(STORE_KEY, { buckets, auto: store.data.auto, migrated: store.data.migrated === true });
          } catch (error) { /* unavailable */ }
        },
        setTasks(key, next) {
          store.data.buckets[key] = next;
          store.persist();
          store.emit();
        },
        setAuto(projectKey, sessionId, value) {
          store.data.auto[autoKey(projectKey, sessionId)] = value === true;
          store.persist();
          store.emit();
        },
        addTask(key, text, priority, scope, sessionId) {
          const scoped = scope === 'session';
          store.setTasks(key, [...store.get(key), {
            id: 'tq-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
            text,
            priority: PRIORITIES.includes(priority) ? priority : 'medium',
            scope: scoped ? 'session' : 'project',
            ...(scoped ? { sessionId } : {}),
            status: 'pending',
            createdAt: Date.now(),
          }]);
        },
        /** Project-wide items plus the ones this conversation owns. */
        visible(key, sessionId) {
          return store.get(key).filter(task => task.scope !== 'session' || task.sessionId === sessionId);
        },
        updateTask(key, id, patch) {
          let changed = false;
          const next = store.get(key).map(task => {
            if (task.id !== id) return task;
            changed = true;
            return { ...task, ...patch };
          });
          if (changed) store.setTasks(key, next);
        },
        removeTask(key, id) {
          store.setTasks(key, store.get(key).filter(task => task.id !== id));
        },
        clearDone(key, sessionId) {
          store.setTasks(key, store.get(key).filter(task =>
            !(task.status === 'done' && (task.scope !== 'session' || task.sessionId === sessionId))));
        },
        nextPending(key, sessionId) {
          const queued = store.visible(key, sessionId)
            .filter(task => task.status === 'pending' || task.status === 'failed');
          queued.sort((a, b) => (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]) || (a.createdAt - b.createdAt));
          return queued[0] || null;
        },
        hasActive(key, sessionId) {
          return store.visible(key, sessionId)
            .some(task => task.status === 'running' || task.status === 'sent');
        },
      };
      return store;
    }

    function translator(localeId) {
      const id = localeId === undefined || localeId === null ? 'en' : String(localeId);
      const dict = DICTS[id] || DICTS[id.split('-')[0]] || DICTS.en;
      return (key, params) => {
        const raw = dict[key] !== undefined ? dict[key] : (DICTS.en[key] !== undefined ? DICTS.en[key] : key);
        if (params === undefined) return raw;
        return Object.keys(params).reduce((text, name) => text.split('{' + name + '}').join(String(params[name])), raw);
      };
    }

    /**
     * Project key and label for the Session: its Workspace when the Workspace
     * projection accounts for it, otherwise its working directory, so lists of
     * different projects never mix.
     */
    function useProject(useWorkspaces, useSessions, sessionId) {
      const workspaceId = useWorkspaces(snapshot => {
        for (const item of snapshot.items) {
          if (item.sessionIds.includes(sessionId)) return item.workspaceId;
        }
        return '';
      });
      const workspaceTitle = useWorkspaces(snapshot => {
        for (const item of snapshot.items) {
          if (item.workspaceId === workspaceId) return item.title;
        }
        return '';
      });
      const cwd = useSessions(snapshot => {
        const row = snapshot.byId[sessionId];
        return row !== undefined && row.cwd !== undefined ? row.cwd : '';
      });
      const key = workspaceId !== '' ? 'ws:' + workspaceId : (cwd !== '' ? 'dir:' + cwd : 'unassigned');
      const title = workspaceTitle !== '' ? workspaceTitle : (cwd !== '' ? (cwd.split('/').filter(Boolean).pop() || cwd) : '');
      return { key, title };
    }

    function useStoreValue(store, key, selector) {
      const [value, setValue] = React.useState(() => selector(key));
      React.useEffect(() => {
        setValue(() => selector(key));
        return store.subscribe(() => setValue(() => selector(key)));
      }, [store, key]);
      return value;
    }

    /**
     * Display order, top to bottom: finished items first, then failures, live
     * work, and finally the queue, where a newly added item sits at the bottom.
     */
    const STATUS_RANK = { done: 0, failed: 1, running: 2, sent: 3, pending: 4 };
    function compareTasks(a, b) {
      const statusDiff = (STATUS_RANK[a.status] === undefined ? 5 : STATUS_RANK[a.status])
        - (STATUS_RANK[b.status] === undefined ? 5 : STATUS_RANK[b.status]);
      if (statusDiff !== 0) return statusDiff;
      if (a.status === 'pending' || a.status === 'failed') {
        const priorityDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.createdAt - b.createdAt;
      }
      return b.createdAt - a.createdAt;
    }

    function TaskRow({ task, t, busy, onSend, onRemove, onChange }) {
      const queued = task.status === 'pending' || task.status === 'failed';
      const [editing, setEditing] = React.useState(false);
      const [draft, setDraft] = React.useState(task.text);
      const inputRef = React.useRef(null);
      const rowRef = React.useRef(null);
      const draftRef = React.useRef(task.text);

      // Keep the editor's buffer aligned with the stored text while not editing.
      React.useEffect(() => {
        if (editing) return;
        setDraft(task.text);
        draftRef.current = task.text;
      }, [task.text, editing]);

      React.useEffect(() => { draftRef.current = draft; }, [draft]);

      React.useEffect(() => {
        const node = inputRef.current;
        if (!editing || node === null) return;
        node.focus();
        node.setSelectionRange(node.value.length, node.value.length);
      }, [editing]);

      const commit = () => {
        const text = draftRef.current.trim();
        setEditing(false);
        if (text === '' || text === task.text) {
          setDraft(task.text);
          return;
        }
        onChange({ text });
      };
      const cancel = () => {
        setDraft(task.text);
        setEditing(false);
      };

      // Leaving the row while editing commits, matching the rest of the app's
      // click-outside behaviour; Escape still cancels.
      React.useEffect(() => {
        if (!editing) return undefined;
        const onPointerDown = event => {
          const row = rowRef.current;
          if (row !== null && event.target instanceof Node && row.contains(event.target)) return;
          commit();
        };
        document.addEventListener('pointerdown', onPointerDown, true);
        return () => document.removeEventListener('pointerdown', onPointerDown, true);
      }, [editing, task.text]);

      return h('div', { ref: rowRef, className: 'tq2-row', 'data-status': task.status },
        h('div', { className: 'tq2-main' },
          editing
            ? h('textarea', {
              ref: inputRef,
              className: 'tq2-edit',
              value: draft,
              title: t('editHint'),
              onChange: event => setDraft(event.target.value),
              onKeyDown: event => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  commit();
                } else if (event.key === 'Escape') {
                  event.preventDefault();
                  cancel();
                }
              },
            })
            : h('button', {
              type: 'button',
              className: 'tq2-text',
              title: t('edit') + ' · ' + task.text,
              onClick: () => {
                setDraft(task.text);
                setEditing(true);
              },
            }, task.text),
          h('div', { className: 'tq2-meta' },
            h('select', {
              className: 'tq2-pri', 'data-pri': task.priority,
              value: task.priority, title: t('changePriority'),
              onChange: event => onChange({ priority: event.target.value }),
            }, PRIORITIES.map(pri => h('option', { key: pri, value: pri }, t('priority_' + pri)))),
            h('span', { className: 'tq2-dot' }, '·'),
            h('span', null, t(task.scope === 'session' ? 'scopeTag_session' : 'scopeTag_project')),
            h('span', { className: 'tq2-dot' }, '·'),
            h('span', { className: 'tq2-state', 'data-status': task.status }, t(task.status)),
          ),
          task.error ? h('div', { className: 'tq2-error' }, task.error) : null,
        ),
        h('div', { className: 'tq2-actions' },
          editing
            ? [
              h('button', {
                key: 'save', className: 'tq2-btn', 'data-primary': 'true', onClick: commit,
              }, t('save')),
              h('button', {
                key: 'cancel', className: 'tq2-btn', 'data-ghost': 'true', onClick: cancel,
              }, t('cancel')),
            ]
            : [
              queued
                ? h('button', {
                  key: 'send', className: 'tq2-send', disabled: busy,
                  onClick: () => onSend(task),
                }, task.status === 'failed' ? t('retry') : t('send'))
                : null,
              h('span', { key: 'secondary', className: 'tq2-secondary' },
                h('button', {
                  className: 'tq2-icon', title: t('remove'),
                  onClick: () => onRemove(task),
                }, '✕'),
              ),
            ],
        ),
      );
    }

    function TaskQueueView(props) {
      const {
        sessionId, store, sendTask, getLocale, subscribeLocale, useSession, useWorkspaces, useSessions,
      } = props;
      const project = useProject(useWorkspaces, useSessions, sessionId);
      const key = project.key;

      // Create (and, once, migrate into) this project's bucket outside render.
      React.useEffect(() => { store.ensureBucket(key); }, [store, key]);

      const tasks = useStoreValue(store, key, k => store.get(k));
      const auto = useStoreValue(store, key, k => store.isAuto(k, sessionId));
      const [locale, setLocale] = React.useState(getLocale);
      React.useEffect(() => subscribeLocale(setLocale), []);
      const localeId = locale && locale.active ? String(locale.active) : 'en';
      const t = translator(localeId);

      const [draft, setDraft] = React.useState('');
      const prefs = React.useMemo(() => readPrefs(sessionId), [sessionId]);
      const [priority, setPriority] = React.useState(
        PRIORITIES.includes(prefs.priority) ? prefs.priority : 'medium');
      const [scope, setScope] = React.useState(
        SCOPES.includes(prefs.scope) ? prefs.scope : 'session');
      const running = useSession(snapshot => snapshot.running);

      // A sent item completes once its turn finished and the session went idle.
      React.useEffect(() => {
        if (running) return;
        for (const task of store.get(key)) {
          if (task.status === 'sent') store.updateTask(key, task.id, { status: 'done' });
        }
      }, [running, store, key]);

      const visibleTasks = tasks.filter(task => task.scope !== 'session' || task.sessionId === sessionId);
      const hiddenCount = tasks.length - visibleTasks.length;
      const pendingCount = visibleTasks.filter(task => task.status === 'pending' || task.status === 'failed').length;
      const busy = running || visibleTasks.some(task => task.status === 'running' || task.status === 'sent');

      const submit = () => {
        const text = draft.trim();
        if (text === '') return;
        store.ensureBucket(key);
        store.addTask(key, text, priority, scope, sessionId);
        setDraft('');
      };

      const sorted = [...visibleTasks].sort(compareTasks);

      return h('div', { className: 'tq2-root' },
        h('div', { className: 'tq2-head' },
          h('span', { className: 'tq2-title' }, t('title')),
          h('span', { className: 'tq2-sub' }, t('subtitle')),
          h('span', { className: 'tq2-project', title: project.title },
            t('project') + '：',
            h('b', null, project.title === '' ? t('noProject') : project.title),
          ),
        ),
        h('div', { className: 'tq2-list' },
          sorted.length === 0
            ? h('div', { className: 'tq2-empty' }, t('empty'))
            : sorted.map(task => h(TaskRow, {
              key: task.id, task, t, busy,
              onSend: item => sendTask(key, item),
              onRemove: item => store.removeTask(key, item.id),
              onChange: patch => store.updateTask(key, task.id, patch),
            })),
        ),
        h('div', { className: 'tq2-foot' },
          h('div', { className: 'tq2-bar' },
            h('input', {
              className: 'tq2-input', value: draft, placeholder: t('addPlaceholder'),
              onChange: event => setDraft(event.target.value),
              onKeyDown: event => {
                if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  submit();
                }
              },
            }),
          ),
          h('div', { className: 'tq2-bar' },
            h('select', {
              className: 'tq2-select', value: priority, title: t('priority_high') + ' / ' + t('priority_medium') + ' / ' + t('priority_low'),
              onChange: event => {
                setPriority(event.target.value);
                writePrefs(sessionId, { priority: event.target.value });
              },
            }, PRIORITIES.map(pri => h('option', { key: pri, value: pri }, t('priority_' + pri)))),
            h('select', {
              className: 'tq2-select', value: scope, title: t('scopeHint'),
              onChange: event => {
                setScope(event.target.value);
                writePrefs(sessionId, { scope: event.target.value });
              },
            }, SCOPES.map(name => h('option', { key: name, value: name }, t('scope_' + name)))),
            h('span', { className: 'tq2-spacer' }),
            h('button', { className: 'tq2-btn', 'data-primary': 'true', onClick: submit }, t('add')),
          ),
          h('div', { className: 'tq2-footmeta' },
            h('label', { className: 'tq2-switch', title: t('autoHint') },
              h('input', {
                type: 'checkbox', checked: auto,
                onChange: event => store.setAuto(key, sessionId, event.target.checked),
              }),
              h('span', null, t('auto')),
            ),
            h('span', { className: 'tq2-spacer' }),
            hiddenCount > 0 ? h('span', { title: t('scopeHint') }, t('hiddenSession', { n: hiddenCount })) : null,
            visibleTasks.some(task => task.status === 'done')
              ? h('button', { className: 'tq2-btn', 'data-ghost': 'true', onClick: () => store.clearDone(key, sessionId) }, t('clearDone'))
              : null,
            h('span', { className: 'tq2-live', 'data-running': String(running) },
              running ? t('runningBadge') : t('idleBadge')),
            h('span', null, '·'),
            h('span', null, t('pendingCount', { n: pendingCount })),
          ),
        ),
      );
    }

    /** Invisible per-session driver: each conversation runs its own auto switch. */
    function AutoDriver(props) {
      const { sessionId, store, sendTask, useSession, useWorkspaces, useSessions } = props;
      const project = useProject(useWorkspaces, useSessions, sessionId);
      const key = project.key;
      React.useEffect(() => { store.ensureBucket(key); }, [store, key]);
      const running = useSession(snapshot => snapshot.running);
      const auto = useStoreValue(store, key, k => store.isAuto(k, sessionId));
      const tasks = useStoreValue(store, key, k => store.get(k));
      const hasActive = tasks.some(task =>
        (task.scope !== 'session' || task.sessionId === sessionId)
        && (task.status === 'running' || task.status === 'sent'));

      React.useEffect(() => {
        if (!auto || running) return undefined;
        // A freshly sent item is still being worked on until the turn lands idle; only then continue.
        if (hasActive) return undefined;
        const timer = window.setTimeout(() => {
          if (!store.isAuto(key, sessionId)) return;
          if (store.hasActive(key, sessionId)) return;
          const next = store.nextPending(key, sessionId);
          if (next !== null) sendTask(key, next);
        }, 700);
        return () => window.clearTimeout(timer);
      }, [auto, running, hasActive, tasks, key, sessionId, store, sendTask]);

      return null;
    }

    return {
      inject: ['slots', 'sessions', 'locale'],
      apply(ctx) {
        const disposeLocale = ctx.locale.register(NS, DICTS);
        const store = createStore();

        const sendTask = (key, sessionId) => task => {
          const scoped = ctx.sessions.scope(sessionId);
          if (scoped === undefined) {
            store.updateTask(key, task.id, { status: 'failed', error: 'Session is not open' });
            return Promise.resolve();
          }
          const conversation = scoped.get('conversation');
          if (conversation === undefined) {
            store.updateTask(key, task.id, { status: 'failed', error: 'Conversation service unavailable' });
            return Promise.resolve();
          }
          store.updateTask(key, task.id, { status: 'running', error: undefined });
          return conversation.send(task.text).then(
            () => store.updateTask(key, task.id, { status: 'sent' }),
            error => store.updateTask(key, task.id, {
              status: 'failed',
              error: String((error && error.message) || error),
            }),
          );
        };

        const viewInject = sessionId => ({
          sessionId,
          store,
          sendTask: (key, task) => sendTask(key, sessionId)(task),
          getLocale: () => ctx.locale.getLocale(),
          subscribeLocale: listener => ctx.locale.subscribe(listener),
        });

        const driverInject = sessionId => ({
          sessionId,
          store,
          sendTask: (key, task) => sendTask(key, sessionId)(task),
        });

        const style = document.createElement('style');
        style.dataset.source = 'task-queue-plugin';
        style.textContent = css;
        document.head.appendChild(style);

        const disposeView = ctx.slots.inject('conversation.view', () =>
          ctx.slots.register({
            name: 'conversation.view',
            id: 'task-queue',
            order: 5,
            locale: NS,
            label: () => translator(ctx.locale.getLocale().active)('view.label'),
            inject: viewInject,
          }, TaskQueueView));

        const disposeDriver = ctx.slots.inject('conversation.composer.dock', () =>
          ctx.slots.register({
            name: 'conversation.composer.dock',
            id: 'task-queue-auto',
            order: 90,
            inject: driverInject,
          }, AutoDriver));

        return () => {
          disposeDriver();
          disposeView();
          style.remove();
          disposeLocale();
        };
      },
    };
  },
});
