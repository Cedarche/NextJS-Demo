"use client";
import React, { useEffect, useState } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  getOutgoers,
  Background,
  BackgroundVariant,
  Controls,
  getConnectedEdges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "@dagrejs/dagre";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import GroupNode from "./GroupNode";
import CustomNode from "./CustomNode";
import { useTaskStore } from "@/providers/task-store-provider";

import { Task } from "@/lib/types";
import useWindowDimensions from "@/components/hooks/useWindowDimensions";
import { generateNodesFromTasks } from "./GenerateNodes";

const nodeTypes = {
  custom: CustomNode,
  group: GroupNode,
};

const TreeChart = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const tasks = useTaskStore((state) => state.tasks);

  const initialNodes = generateNodesFromTasks(tasks);

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = width <= 1536 ? 300 : 480;
  const nodeHeight = width <= 1536 ? 140 : 210;

  // Define stage offsets for horizontal positioning
  const stageOffsets: Record<string, number> = {
    "1": width <= 1536 ? 0 : 0,
    "2": width <= 1536 ? 50 : 100,
    "3": width <= 1536 ? 100 : 200,
    "4": width <= 1536 ? 150 : 300,
  };

  const edgeOptions = {
    style: {
      stroke: theme === "dark" ? "#d5d5d5" : "#8f8f8f",
    },
  };

  const colorMode = theme === "dark" ? "dark" : "light";

  // Dynamically create edges based on childTasks
  const initialEdges = initialNodes
    .flatMap((node) => {
      if (node.type !== "group" && "childTasks" in node.data) {
        return (node.data as Task).childTasks?.map((childId: string) => ({
          id: `${node.id}->${childId}`,
          source: node.id,
          target: childId,
        }));
      }
      return [];
    })
    .filter((edge) => edge);

  const getLayoutedElements = (nodes: any, edges: any, direction = "LR") => {
    const isHorizontal = direction === "LR";
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node: any) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge: any) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node: any) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.targetPosition = isHorizontal ? "left" : "top";
      node.sourcePosition = isHorizontal ? "right" : "bottom";

      // Adjust horizontal position based on the stage
      if (node.type === "group") {
      } else {
        const stageOffset = stageOffsets[node.data.stage] || 0;
        node.position = {
          x: nodeWithPosition.x + stageOffset - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        };
        node.style = {
          backgroundColor: "#ffffff0",
          borderRadius: 8,
        };
      }

      return node;
    });

    return { nodes, edges };
  };

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    initialNodes,
    initialEdges
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const [hidden, setHidden] = useState(false);

  const recalculateNodePositions = () => {
    let hasChanges = false;

    const newWidth = width <= 1536 ? 320 : 500;
    const spacing = width <= 1536 ? 10 : 20;

    // Filter out hidden nodes
    const visibleNodes = nodes.filter((node) => !node.hidden);

    const updatedNodes = nodes.map((node: any) => {
      if (node.type === "group") {
        const stage = node.data.stage;

        const filteredNodes = visibleNodes.filter(
          (node: any) => node.data.stage === stage && node.type !== "group"
        );

        const xMin = Math.min(
          ...filteredNodes.map((node: any) => node.position.x)
        );

        const yMin = Math.min(
          ...filteredNodes.map((node: any) => node.position.y)
        );
        const yMax = Math.max(
          ...filteredNodes.map((node: any) => node.position.y)
        );

        // Calculate new position and size
        let newX = xMin - spacing;
        let newY = yMin - spacing;
        let newHeight = yMax - yMin + nodeHeight + spacing;

        if (
          node.style.width !== newWidth ||
          node.style.height !== newHeight ||
          node.position.x !== newX ||
          node.position.y !== newY
        ) {
          hasChanges = true;
          return {
            ...node,
            hidden: filteredNodes.length === 0 ? true : false,
            position: {
              x: newX,
              y: newY,
            },
            style: {
              height: newHeight,
              width: newWidth,
              borderRadius: 8,
              border: "1px solid gray",
              backgroundColor: "#3d3d4018",
            },
          };
        }
      }

      return node;
    });

    if (hasChanges) {
      setNodes(updatedNodes);
    }
  };

  useEffect(() => {
    // Re-run layout generation whenever tasks or dimensions change
    const updatedNodes = generateNodesFromTasks(tasks);

    const updatedEdges = updatedNodes.flatMap((node) => {
      if (node.type !== "group" && "childTasks" in node.data) {
        return node.data.childTasks.map((childId: any) => ({
          id: `${node.id}->${childId}`,
          source: node.id,
          target: childId,
        }));
      }
      return [];
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      updatedNodes,
      updatedEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    recalculateNodePositions();
  }, [tasks, width]);

  useEffect(() => {
    recalculateNodePositions();
  }, [nodes, width, tasks]);

  const handleTaskClick = (taskID: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("taskID", taskID);
    router.push(`?${params.toString()}`);
  };

  const checkTarget = (edge: any, id: any) => {
    let edges = edge.filter((ed: any) => {
      return ed.target !== id;
    });
    return edges;
  };

  const nodeClick = (node: any) => {
    let currentNodeID = node.id;
    let stack: any[] = [node];
    let outgoers: any[] = [];
    let connectedEdges: any[] = [];

    // Traverse through outgoers (child nodes)
    while (stack.length > 0) {
      let lastNode = stack.pop();
      let childNodes = getOutgoers(lastNode, nodes, edges);
      let childEdges = checkTarget(
        getConnectedEdges([lastNode], edges),
        currentNodeID
      );

      childNodes.forEach((childNode) => stack.push(childNode));
      connectedEdges.push(...childEdges);
      outgoers.push(...childNodes);
    }

    // Collect child nodes and edges IDs
    const childNodeID = outgoers.map((node: any) => node.id);
    const childEdgeID = connectedEdges.map((edge: any) => edge.id);

    // Update visibility for nodes and edges
    setNodes((prevNodes) =>
      prevNodes.map((node) => ({
        ...node,
        hidden: childNodeID.includes(node.id) ? !hidden : node.hidden,
      }))
    );

    setEdges((prevEdges) =>
      prevEdges.map((edge) => ({
        ...edge,
        hidden: childEdgeID.includes(edge.id) ? !hidden : edge.hidden,
      }))
    );

    // Set `hidden` state and ensure the positions are recalculated
    setHidden(!hidden);
    setTimeout(recalculateNodePositions, 0); // Delaying recalculation
  };

  if (!initialNodes.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="border rounded-lg overflow-hidden border-zinc-300 dark:border-white/10 mt-3 h-flow-xl 2xl:h-flow-2xl">
      <ReactFlow
        colorMode={colorMode}
        nodes={nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            toggleVisibility: () => nodeClick(node),
            openTask: () => handleTaskClick(node.id),
          },
        }))}
        edges={edges}
        fitView
        nodesDraggable={false}
        attributionPosition="bottom-right"
        nodeTypes={nodeTypes}
        defaultEdgeOptions={edgeOptions}
      >
        <Controls position="top-right" />
        <Background variant={BackgroundVariant.Dots} />
      </ReactFlow>
    </div>
  );
};

export default TreeChart;

// draggable={false}
// nodesConnectable={false}
// nodesDraggable={true}
// zoomOnScroll={true}
// zoomOnPinch={true}
// zoomOnDoubleClick={false}
// preventScrolling={false}
// panOnDrag={false}
// panOnScroll={false}
