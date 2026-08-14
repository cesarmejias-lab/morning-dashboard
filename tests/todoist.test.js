const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeTask, partitionTasks, sortForMorning, buildProjectNames } = require('../todoist');

const TODAY = '2026-08-14';

function raw(overrides = {}) {
  return Object.assign({
    id: '7001',
    content: 'Review the framework contract',
    due: { date: TODAY, datetime: null },
    priority: 1,
    project_id: '220',
    url: 'https://app.todoist.com/app/task/7001',
  }, overrides);
}

test('normalizeTask projects the fields the card needs', () => {
  const task = normalizeTask(raw({ due: { date: TODAY, datetime: `${TODAY}T09:30:00` } }));
  assert.equal(task.id, '7001');
  assert.equal(task.content, 'Review the framework contract');
  assert.equal(task.date, TODAY);
  assert.equal(task.time, '09:30');
  assert.equal(task.priority, 1);
  assert.equal(task.projectId, '220');
  assert.equal(task.url, 'https://app.todoist.com/app/task/7001');
});

test('normalizeTask coerces a numeric id to a string', () => {
  assert.equal(normalizeTask(raw({ id: 7001 })).id, '7001');
});

test('normalizeTask leaves time null when the task has no clock time', () => {
  assert.equal(normalizeTask(raw()).time, null);
});

test('normalizeTask rejects a task with no due date', () => {
  assert.equal(normalizeTask(raw({ due: null })), null);
});

test('normalizeTask rejects a task with empty content', () => {
  assert.equal(normalizeTask(raw({ content: '   ' })), null);
});

test('normalizeTask rejects junk without throwing', () => {
  assert.equal(normalizeTask(null), null);
  assert.equal(normalizeTask('nope'), null);
  assert.equal(normalizeTask({}), null);
  assert.equal(normalizeTask(raw({ due: { date: 42 } })), null);
});

test('normalizeTask defaults an unusable priority to 1', () => {
  assert.equal(normalizeTask(raw({ priority: 'high' })).priority, 1);
});

test('normalizeTask tolerates a missing project and url', () => {
  const task = normalizeTask(raw({ project_id: undefined, url: undefined }));
  assert.equal(task.projectId, null);
  assert.equal(task.url, null);
});

test('partitionTasks splits overdue from due today', () => {
  const groups = partitionTasks([
    raw({ id: '1', due: { date: '2026-08-12' } }),
    raw({ id: '2', due: { date: TODAY } }),
  ], TODAY);
  assert.deepEqual(groups.overdue.map(t => t.id), ['1']);
  assert.deepEqual(groups.dueToday.map(t => t.id), ['2']);
});

test('partitionTasks excludes future tasks entirely', () => {
  const groups = partitionTasks([raw({ id: '9', due: { date: '2026-08-20' } })], TODAY);
  assert.deepEqual(groups.overdue, []);
  assert.deepEqual(groups.dueToday, []);
});

test('partitionTasks drops unusable entries and keeps the rest', () => {
  const groups = partitionTasks([null, raw({ id: '2' }), { nope: true }], TODAY);
  assert.deepEqual(groups.dueToday.map(t => t.id), ['2']);
});

test('partitionTasks returns empty groups for a non-array input', () => {
  assert.deepEqual(partitionTasks(undefined, TODAY), { overdue: [], dueToday: [] });
});

test('partitionTasks orders overdue oldest first', () => {
  const groups = partitionTasks([
    raw({ id: 'recent', due: { date: '2026-08-13' } }),
    raw({ id: 'old', due: { date: '2026-08-01' } }),
  ], TODAY);
  assert.deepEqual(groups.overdue.map(t => t.id), ['old', 'recent']);
});

test('sortForMorning orders by time, then by priority descending', () => {
  const tasks = [
    normalizeTask(raw({ id: 'noon', due: { date: TODAY, datetime: `${TODAY}T12:00:00` } })),
    normalizeTask(raw({ id: 'early', due: { date: TODAY, datetime: `${TODAY}T09:00:00` } })),
    normalizeTask(raw({ id: 'untimed-urgent', priority: 4 })),
    normalizeTask(raw({ id: 'untimed-normal', priority: 1 })),
  ];
  assert.deepEqual(
    sortForMorning(tasks).map(t => t.id),
    ['early', 'noon', 'untimed-urgent', 'untimed-normal'],
    'timed tasks come first in clock order; untimed tasks follow, most urgent first'
  );
});

test('sortForMorning does not mutate its input', () => {
  const tasks = [
    normalizeTask(raw({ id: 'b', due: { date: TODAY, datetime: `${TODAY}T12:00:00` } })),
    normalizeTask(raw({ id: 'a', due: { date: TODAY, datetime: `${TODAY}T09:00:00` } })),
  ];
  sortForMorning(tasks);
  assert.deepEqual(tasks.map(t => t.id), ['b', 'a']);
});

test('buildProjectNames maps ids to names from either payload shape', () => {
  const expected = { '220': 'Client matters', '221': 'Personal' };
  const list = [{ id: 220, name: 'Client matters' }, { id: '221', name: 'Personal' }];
  assert.deepEqual(buildProjectNames(list), expected);
  assert.deepEqual(buildProjectNames({ results: list }), expected);
});

test('buildProjectNames skips entries without a usable id or name', () => {
  const names = buildProjectNames([
    { id: '1', name: 'Keep' },
    { id: null, name: 'No id' },
    { id: '2' },
    null,
    'nope',
  ]);
  assert.deepEqual(names, { '1': 'Keep' });
});

test('buildProjectNames returns an empty object for junk input', () => {
  assert.deepEqual(buildProjectNames(undefined), {});
  assert.deepEqual(buildProjectNames({ nope: true }), {});
});
