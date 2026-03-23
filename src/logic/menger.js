export const getMengerData = (links, startNode, targetNode, allowedNodeIds) => {
    // 1. Filter links to only those where BOTH ends are in the allowed list
    const yellowLinks = links.filter(l => {
        const u = typeof l.source === 'object' ? l.source.id : l.source;
        const v = typeof l.target === 'object' ? l.target.id : l.target;
        return allowedNodeIds.includes(u) && allowedNodeIds.includes(v);
    });

    const paths = [];
    let tempLinks = [...yellowLinks];

    const findPath = (current, target) => {
        if (current === target) return [];

        for (let i = 0; i < tempLinks.length; i++) {
            const edge = tempLinks[i];
            const u = typeof edge.source === 'object' ? edge.source.id : edge.source;
            const v = typeof edge.target === 'object' ? edge.target.id : edge.target;

            let next = null;
            if (u === current) next = v;
            else if (v === current) next = u;

            if (next) {
                // Remove the edge so it's not reused (edge-disjoint)
                const [removedEdge] = tempLinks.splice(i, 1);
                const restOfPath = findPath(next, target);

                if (restOfPath !== null) {
                    return [`${u}-${v}`, ...restOfPath];
                }

                // Backtrack: put the edge back if this path didn't work
                tempLinks.splice(i, 0, removedEdge);
            }
        }
        return null;
    };

    // Find as many paths as possible
    while (true) {
        const path = findPath(startNode, targetNode);
        if (path) {
            paths.push(path);
        } else {
            break;
        }
    }

    return { paths, yellowLinks };
};