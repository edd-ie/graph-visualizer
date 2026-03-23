import normalizeGraphData from './normalize.js'
import data from "../db/graph.json" with { type: "json" };

const numEndVert = (node) => {
    const endVertices = node.nodes.filter(n => n.degree === 1);
    console.log(`Total End-Vertices: ${endVertices.length}`);
    console.log("List:", endVertices.map(n => n.label));
}

let x = normalizeGraphData(data);
numEndVert(x);