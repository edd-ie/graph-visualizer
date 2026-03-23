
import normalizeGraphData from './normalize.js'
import data from "../db/graph.json" with { type: "json" };

const getComponents = (nodes, links) => {
    const adj = {};
    nodes.forEach(n => adj[n.id] = []);
    links.forEach(l => {
        adj[l.source].push(l.target);
        adj[l.target].push(l.source);
    });

    const visited = new Set();
    let count = 0;

    nodes.forEach(node => {
        if (!visited.has(node.id)) {
            count++;
            const queue = [node.id];
            while (queue.length > 0) {
                const curr = queue.shift();
                visited.add(curr);
                adj[curr].forEach(neighbor => {
                    if (!visited.has(neighbor)) visited.add(neighbor);
                });
            }
        }
    });
    return count;
};

let x = normalizeGraphData(data)

console.log(`\nNumber of connected components: ${getComponents(x.nodes, x.links)}`);