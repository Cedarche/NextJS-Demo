"use client";
import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,

} from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import { Subheading } from "@/components/catalyst/heading";
import { reorder, move, groupTasksByStatus } from "./GridFunctions";
import DraggableItem from "./DraggableTask"; // Import the new DraggableItem component
import { useTaskStore } from "@/providers/task-store-provider";

const statusStyles: Record<string, { textColor: string; bgColor: string }> = {
  "Not Started": {
    textColor: "bg-gray-400",
    bgColor: "bg-gray-400/30",
  },
  Started: {
    textColor: "bg-blue-400",
    bgColor: "bg-blue-400/30",
  },
  Issues: {
    textColor: "bg-red-400",
    bgColor: "bg-red-400/30",
  },
  Completed: {
    textColor: "bg-green-400",
    bgColor: "bg-green-400/30",
  },
};

const statusMapping: { [key: string]: string } = {
  "Not Started": "notStarted",
  Started: "started",
  Issues: "issues",
  Completed: "complete",
};

function TaskGrid() {
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);
  const groupedTasks = groupTasksByStatus(tasks);
  const router = useRouter();

  const [state, setState] = useState(Object.values(groupedTasks));
  // Sync the local state with the Zustand store
  useEffect(() => {
    setState(Object.values(groupTasksByStatus(tasks)));
  }, [tasks]);

  const handleTaskClick = (taskID: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("taskID", taskID);
    router.push(`?${params.toString()}`);
  };

  function onDragEnd(result: DropResult) {
    const { source, destination } = result;

    if (!destination) return;

    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if (sInd === dInd) {
      const items = reorder(state[sInd], source.index, destination.index);
      const newState = [...state];
      newState[sInd] = items;
      setState(newState);
    } else {
      const result = move(state[sInd], state[dInd], source, destination);
      const newState = [...state];
      newState[sInd] = result[sInd];
      newState[dInd] = result[dInd];

      setState(newState.filter((group) => group.length));

      // Update the store when tasks are moved between columns
      result[sInd].forEach((task) =>
        updateTask(task.taskID, {
          status: statusMapping[Object.keys(statusMapping)[sInd]],
        })
      );
      result[dInd].forEach((task) =>
        updateTask(task.taskID, {
          status: statusMapping[Object.keys(statusMapping)[dInd]],
        })
      );
    }
  }

  return (
    <>
      <div className="w-full flex-1 py-1 2xl:py-4 mb-4 2xl:mb-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-1 gap-4">
            {["Not Started", "Started", "Issues", "Completed"].map(
              (status, ind) => {
                const { textColor, bgColor } = statusStyles[status] || {
                  textColor: "text-gray-400",
                  bgColor: "bg-gray-400/30",
                };
                return (
                  <div key={ind} className="flex-1">
                    <div className="flex flex-row pb-1 items-center justify-between">
                      <div className="flex items-center ml-1.5">
                        <div
                          className={`flex size-3 rounded-full  ${bgColor} items-center justify-center dark:bg-opacity-10 dark:text-opacity-100`}
                        >
                          <div
                            className={`size-2 rounded-full ${textColor} border `}
                          />
                        </div>
                        <div className="my-2 pl-2 flex text-sm 2xl:text-base font-bold">
                          <Subheading>{status}</Subheading>
                        </div>
                      </div>
                    </div>
                    <Droppable key={ind} droppableId={`${ind}`}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`border p-2 2xl:p-4 h-full rounded-[8px] ${
                            snapshot.isDraggingOver
                              ? "bg-green-200/20 dark:bg-indigo-200/20"
                              : "bg-zinc-200/10 dark:bg-zinc-700/20"
                          }`}
                        >
                          {state[ind].map((item, index) => (
                            <DraggableItem
                              key={item.taskID}
                              task={item}
                              index={index}
                              state={state}
                              setState={setState}
                              ind={ind}
                              handleTaskClick={handleTaskClick}
                            />
                          ))}
                          {provided.placeholder}
          
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              }
            )}
          </div>
        </DragDropContext>
      </div>
    </>
  );
}

export default TaskGrid;

