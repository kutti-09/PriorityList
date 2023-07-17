const fs = require("fs");

const taskFilePath = `${__dirname}/task.txt`;
const completedFilePath = `${__dirname}/completed.txt`;


const addTask = (priority, task) => {
  const taskLine = `${priority} ${task}\n`;

  try {
    if (fs.existsSync(taskFilePath)) {
      fs.appendFileSync(taskFilePath, taskLine);
    } else {
      fs.writeFileSync(taskFilePath, taskLine);
    }

    console.log(`Added task: "${task}" with priority ${priority}`);
  } catch (error) {
    console.error("Error adding task:", error);
  }
};

const listTasks = () => {
  try {
    if (!fs.existsSync(taskFilePath)) {
      console.log("There are no pending tasks!");
      return;
    }
    const tasks = fs.readFileSync(taskFilePath, "utf8").trim().split("\n");
    if (tasks.length === 0 || (tasks.length === 1 && tasks[0].trim() === "")) {
      console.log("There are no pending tasks!");
    } else {
      const sortedTasks = tasks
        .map((line, index) => {
          const spaceIndex = line.indexOf(" ");
          const priority = line.slice(0, spaceIndex);
          const task = line.slice(spaceIndex + 1);
          return { index: index + 1, priority: parseInt(priority), task };
        })
        .sort((a, b) => a.priority - b.priority);
      sortedTasks.forEach(({ index, task, priority }) => {
        console.log(`${index}. ${task} [${priority}]`);
      });
    }
  } catch (error) {
    console.error("Error listing tasks:", error);
  }
};

const deleteTask = (index) => {
  const tasks = fs.readFileSync(taskFilePath, "utf8").trim().split("\n");
  if (index >= 1 && index <= tasks.length) {
    tasks.splice(index - 1, 1);
    fs.writeFileSync(taskFilePath, tasks.join("\n"));
    console.log(`Deleted task #${index}`);
  } else {
    console.log(`Error: task with index #${index} does not exist. Nothing deleted.`);
  }
};

const markTaskAsDone = (index) => {
  try {
    let tasks = fs.readFileSync(taskFilePath, "utf8").trim().split("\n");
    if (index < 1 || index > tasks.length) {
      console.log(`Error: no incomplete item with index #${index} exists.`);
      return;
    }
    const taskLine = tasks[index - 1];
    const updatedTaskLine = taskLine.replace("[ ]", "[x]");
    tasks[index - 1] = updatedTaskLine;
    fs.writeFileSync(taskFilePath, tasks.join("\n"), "utf8");
    console.log("Marked item as done.");

    const completedTask = taskLine.substring(taskLine.indexOf(" ") + 1); // Extract task without priority
    fs.appendFileSync(completedFilePath, `${completedTask}\n`, "utf8");

    // Remove completed task from the task list
    tasks.splice(index - 1, 1);
    fs.writeFileSync(taskFilePath, tasks.join("\n"), "utf8");
  } catch (error) {
    console.error("Error marking task as done:", error);
  }
};

const reportTasks = () => {
  try {
    const tasks = fs.readFileSync(taskFilePath, "utf8").trim().split("\n");
    if (tasks.length === 0 || (tasks.length === 1 && tasks[0].trim() === "")) {
      console.log("Pending : 0");
    } else {
      console.log(`Pending : ${tasks.length}`);
      tasks.forEach((line, index) => {
        const [priority, ...taskParts] = line.split(" ");
        const task = taskParts.join(" ");
        console.log(`${index + 1}. ${task} [${priority}]`);
      });
    }

    const completedTasks = fs.readFileSync(completedFilePath, "utf8").trim().split("\n");
    console.log(`\nCompleted : ${completedTasks.length}`);
    completedTasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task}`);
    });
  } catch (error) {
    console.error("Error reporting tasks:", error);
  }
};


const main = () => {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "help") {
    console.log(`Usage :-
$ ./task add 2 hello world    # Add a new item with priority 2 and text "hello world" to the list
$ ./task ls                   # Show incomplete priority list items sorted by priority in ascending order
$ ./task del INDEX            # Delete the incomplete item with the given index
$ ./task done INDEX           # Mark the incomplete item with the given index as complete
$ ./task help                 # Show usage
$ ./task report               # Statistics`);
  } else if (args[0] === "add") {
    if (args.length >= 3) {
      const priority = parseInt(args[1]);
      const task = args.slice(2).join(" ");
      if (!isNaN(priority) && task.length > 0) {
        addTask(priority, task);
      } else {
        console.log("Error: Invalid priority or missing task text. Nothing added!");
      }
    } else {
      console.log("Error: Missing tasks string. Nothing added!");
    }
  } else if (args[0] === "ls") {
    listTasks();
  } else if (args[0] === "del") {
    if (args.length === 2) {
      const index = parseInt(args[1]);
      if (!isNaN(index)) {
        deleteTask(index);
      } else {
        console.log("Error: Invalid index for deleting tasks.");
      }
    } else {
      console.log("Error: Missing NUMBER for deleting tasks.");
    }
  } else if (args[0] === "done") {
    if (args.length === 2) {
      const index = parseInt(args[1]);
      if (!isNaN(index)) {
        markTaskAsDone(index);
      } else {
        console.log("Error: Invalid index for marking tasks as done.");
      }
    } else {
      console.log("Error: Missing NUMBER for marking tasks as done.");
    }
  } else if (args[0] === "report") {
    reportTasks();
  } else {
    console.log("Error: Unknown command.");
  }
};

main();
