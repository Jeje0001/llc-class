let tasks = [];

function addTask() {
  const task = {
    name: document.getElementById('taskName').value,
    due: new Date(document.getElementById('dueDate').value),
    estimatedTime: parseInt(document.getElementById('estimatedTime').value),
    priority: document.getElementById('priority').value,
    category: document.getElementById('category').value,
    scheduled: false
  };
  tasks.push(task);
  alert('Task added!');
}

function parseFixedBlocks() {
  const lines = document.getElementById('fixedBlocks').value.trim().split('\n');
  return lines.map(line => {
    const [startStr, endStr] = line.split(',');
    return {
      start: new Date(startStr),
      end: new Date(endStr),
    };
  });
}

function findFreeTime(fixedBlocks) {
  fixedBlocks.sort((a, b) => a.start - b.start);
  const freeTime = [];
  let dayStart = new Date();
  dayStart.setHours(7, 0, 0, 0);
  let dayEnd = new Date();
  dayEnd.setHours(23, 0, 0, 0);

  for (let i = 0; i < fixedBlocks.length; i++) {
    const block = fixedBlocks[i];
    if (block.start > dayStart) {
      freeTime.push({ start: new Date(dayStart), end: new Date(block.start) });
    }
    dayStart = new Date(Math.max(dayStart, block.end));
  }

  if (dayStart < dayEnd) {
    freeTime.push({ start: new Date(dayStart), end: new Date(dayEnd) });
  }

  return freeTime;
}

function prioritizeTasks(tasks) {
  const priorityMap = { 'High': 1, 'Medium': 2, 'Low': 3 };
  return tasks.sort((a, b) => {
    if (priorityMap[a.priority] !== priorityMap[b.priority]) {
      return priorityMap[a.priority] - priorityMap[b.priority];
    }
    return a.due - b.due;
  });
}

function generateSchedule() {
  const fixedBlocks = parseFixedBlocks();
  const freeBlocks = findFreeTime(fixedBlocks);
  const sortedTasks = prioritizeTasks(tasks);
  const output = document.getElementById('scheduleOutput');
  output.innerHTML = '';

  for (let task of sortedTasks) {
    for (let block of freeBlocks) {
      const blockDuration = (block.end - block.start) / 60000;
      if (!task.scheduled && blockDuration >= task.estimatedTime) {
        const start = new Date(block.start);
        const end = new Date(block.start.getTime() + task.estimatedTime * 60000);
        output.innerHTML += `<div class="task"><strong>${task.name}</strong><br>${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}</div>`;
        block.start = end;
        task.scheduled = true;
        break;
      }
    }
  }
}
