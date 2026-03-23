export const calculateMST = (nodes, links) => {
    // 1. Sort edges by weight (Smallest first)
    const sortedLinks = [...links].sort((a, b) => a.weight - b.weight);

    const parent = {};
    nodes.forEach(n => parent[n.id] = n.id);

    const find = (i) => {
        if (parent[i] === i) return i;
        return find(parent[i]);
    };

    const union = (i, j) => {
        const rootI = find(i);
        const rootJ = find(j);
        if (rootI !== rootJ) {
            parent[rootI] = rootJ;
            return true;
        }
        return false;
    };

    const mstEdges = [];
    const mstLog = [];

    sortedLinks.forEach(edge => {
        const u = edge.source.id || edge.source; // Handle both object and string refs
        const v = edge.target.id || edge.target;

        if (union(u, v)) {
            mstEdges.push(`${u}-${v}`);
            mstLog.push(`Step: Added {${u}, ${v}} (Weight: ${edge.weight}) - No cycle created.`);
        } else {
            mstLog.push(`Step: Rejected {${u}, ${v}} (Weight: ${edge.weight}) - Would create a cycle.`);
        }
    });

    return { mstEdges, mstLog };
};