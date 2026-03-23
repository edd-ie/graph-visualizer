import normalizeGraphData from './normalize.js'
import data from "../db/graph.json" with { type: "json" };

export const findBridgesAndCutVertices = (nodes, links) => {
    const bridges = [];
    const cutVertices = [];

    // counts components using BFS
    const countComponents = (currentNodes, currentLinks) => {
        const visited = new Set();
        let count = 0;
        const adj = {};

        currentNodes.forEach(n => adj[n.id] = []);
        currentLinks.forEach(l => {
            const u = typeof l.source === 'object' ? l.source.id : l.source;
            const v = typeof l.target === 'object' ? l.target.id : l.target;
            adj[u].push(v);
            adj[v].push(u);
        });

        currentNodes.forEach(node => {
            if (!visited.has(node.id)) {
                count++;
                const queue = [node.id];
                visited.add(node.id);
                while (queue.length > 0) {
                    const curr = queue.shift();
                    adj[curr].forEach(neighbor => {
                        if (!visited.has(neighbor)) {
                            visited.add(neighbor);
                            queue.push(neighbor);
                        }
                    });
                }
            }
        });
        return count;
    };

    const originalComponentCount = countComponents(nodes, links);

    // 1. Find Bridges
    links.forEach((link, index) => {
        const remainingLinks = links.filter((_, i) => i !== index);
        if (countComponents(nodes, remainingLinks) > originalComponentCount) {
            const u = typeof link.source === 'object' ? link.source.id : link.source;
            const v = typeof link.target === 'object' ? link.target.id : link.target;
            bridges.push(`${u}-${v}`);
        }
    });

    // Find Cut-Vertices
    nodes.forEach(node => {
        const remainingNodes = nodes.filter(n => n.id !== node.id);
        const remainingLinks = links.filter(l => {
            const u = typeof l.source === 'object' ? l.source.id : l.source;
            const v = typeof l.target === 'object' ? l.target.id : l.target;
            return u !== node.id && v !== node.id;
        });
        if (countComponents(remainingNodes, remainingLinks) > originalComponentCount) {
            cutVertices.push(node.id);
        }
    });

    return { bridges, cutVertices };
};


let x = normalizeGraphData(data);
const analysis = findBridgesAndCutVertices(x.nodes, x.links);
console.log("Cut-Vertices:", analysis.cutVertices);
console.log("Bridges:", analysis.bridges);