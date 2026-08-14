(function initTodoistTasks(root, factory) {
  const api = factory();
  const isCommonJS = typeof module === 'object' && module.exports;
  if (isCommonJS) {
    module.exports = api;
  } else if (root) {
    root.TodoistTasks = api;
  }
}(typeof globalThis !== 'undefined' ? globalThis : null, function createTodoistTasks() {
  // Todoist priority: 4 = urgent, 1 = normal. Untimed tasks sort after timed ones.
  const NO_TIME = '99:99';
  const DEFAULT_PRIORITY = 1;

  function text(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function normalizeTask(raw) {
    if (!raw || typeof raw !== 'object') return null;

    const id = raw.id == null ? '' : String(raw.id);
    const content = text(raw.content);
    if (!id || !content) return null;

    const due = raw.due && typeof raw.due === 'object' ? raw.due : null;
    const date = due && typeof due.date === 'string' ? due.date.slice(0, 10) : null;
    if (!date) return null;

    const datetime = due && typeof due.datetime === 'string' ? due.datetime : null;
    const priority = Number(raw.priority);

    return {
      id,
      content,
      date,
      time: datetime && datetime.length >= 16 ? datetime.slice(11, 16) : null,
      priority: Number.isFinite(priority) ? priority : DEFAULT_PRIORITY,
      projectId: raw.project_id == null ? null : String(raw.project_id),
      url: typeof raw.url === 'string' ? raw.url : null,
    };
  }

  function sortForMorning(tasks) {
    return (Array.isArray(tasks) ? tasks.slice() : []).sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      const aTime = a.time || NO_TIME;
      const bTime = b.time || NO_TIME;
      if (aTime !== bTime) return aTime < bTime ? -1 : 1;
      return b.priority - a.priority;
    });
  }

  function partitionTasks(tasks, todayISO) {
    const overdue = [];
    const dueToday = [];

    (Array.isArray(tasks) ? tasks : []).forEach(raw => {
      const task = normalizeTask(raw);
      if (!task) return;
      if (task.date < todayISO) overdue.push(task);
      else if (task.date === todayISO) dueToday.push(task);
    });

    return { overdue: sortForMorning(overdue), dueToday: sortForMorning(dueToday) };
  }

  // Tasks reference a project by id; the card shows a name. Accepts a bare
  // array or an object wrapping `results`, and never throws on junk — a
  // missing project name should degrade the label, not fail the card.
  function buildProjectNames(payload) {
    const list = Array.isArray(payload)
      ? payload
      : (payload && Array.isArray(payload.results) ? payload.results : []);

    const names = {};
    list.forEach(project => {
      if (!project || typeof project !== 'object') return;
      if (project.id == null) return;
      const name = text(project.name);
      if (!name) return;
      names[String(project.id)] = name;
    });
    return names;
  }

  return { normalizeTask, partitionTasks, sortForMorning, buildProjectNames };
}));
