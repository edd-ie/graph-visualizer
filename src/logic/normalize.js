import data from "../db/graph.json" with { type: "json" };
import fs from 'fs';

const normalizeGraphData = (rawData) => {
    const nodes = rawData.nodes.map(node => ({
        ...node,
        // Add default x, y for manual positioning 
        x: node.x || null,
        y: node.y || null,
        degree: 0
    }));

    const edgeMap = {};
    const justificationLog = [];

    rawData.edges.forEach(edge => {
        // Sort IDs to treat as undirected
        const [u, v] = [edge.source, edge.target].sort();
        const edgeKey = `${u}-${v}`;

        if (edgeMap[edgeKey]) {
            const oldWeight = edgeMap[edgeKey].weight;
            const newWeight = edge.weight;

            if (newWeight < oldWeight) {
                justificationLog.push(
                    `Merged edge {${u}, ${v}}: Route ${edge.route} provides lower weight (${newWeight}) than previous (${oldWeight}).`
                );
                edgeMap[edgeKey].weight = newWeight;
            } else {
                justificationLog.push(
                    `Merged edge {${u}, ${v}}: Kept existing weight ${oldWeight} (Route ${edge.route} weight ${newWeight} is not smaller).`
                );
            }

            // Track all routes for this edge for reference
            edgeMap[edgeKey].routes.push(edge.route);
        } else {
            // New unique edge construction
            edgeMap[edgeKey] = {
                source: u,
                target: v,
                weight: edge.weight,
                routes: [edge.route]
            };
        }
    });

    // Calculate node degrees
    const links = Object.values(edgeMap);
    links.forEach(link => {
        const sNode = nodes.find(n => n.id === link.source);
        const tNode = nodes.find(n => n.id === link.target);
        if (sNode) sNode.degree++;
        if (tNode) tNode.degree++;
    });

    console.log("--- Justification Log for Final Project ---");
    justificationLog.forEach(entry => console.log(entry));

    return { nodes, links };
};

export default normalizeGraphData;

const normalized = normalizeGraphData(data);

// To iterate over nodes:
normalized.nodes.forEach(n => {
    console.log(`Node: ${n.id}, Degree: ${n.degree}`);
});

// To iterate over links:
normalized.links.forEach(l => {
    console.log(`Edge: ${l.source} - ${l.target}, Weight: ${l.weight}`);
});


// Write to a new JSON file
try {
    fs.writeFileSync(
        './src/db/normalized_graph.json',
        JSON.stringify(normalized, null, 2),
        'utf-8'
    );
    console.log("Success: normalized_graph.json has been saved.");
} catch (err) {
    console.error("Error writing file:", err);
}