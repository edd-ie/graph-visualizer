import React, { useMemo, useState, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import normalizedData from '../db/normalized_graph.json' with {type: "json"};
import { calculateMST } from '../logic/calculateMST';
import { findBridgesAndCutVertices } from '../logic/findCutsAndBridges';
import { getMengerData } from '../logic/menger.js';

const TransitGraph = () => {
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        const handleResize = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const graphData = useMemo(() => ({
        nodes: normalizedData.nodes.map(n => ({
            ...n,
            name: `${n.id}: ${n.label}`
        })),
        links: normalizedData.links
    }), []);

    const [activeView, setActiveView] = useState('none'); // 'none', 'mst', 'bridges'

    const { mstEdges, mstLog } = useMemo(() => {
        return calculateMST(normalizedData.nodes, normalizedData.links);
    }, []);

    const { bridges, cutVertices } = useMemo(() => {
        return findBridgesAndCutVertices(normalizedData.nodes, normalizedData.links);
    }, []);

    const YELLOW_LINE_IDS = ['KP', 'DC', 'FH', 'WM', 'RM', 'CC', 'SUB'];
    const [mengerTarget, setMengerTarget] = useState(null);

    const mengerResults = useMemo(() => {
        if (!mengerTarget) return null;

        return getMengerData(
            normalizedData.links,
            'KP',
            mengerTarget,
            YELLOW_LINE_IDS
        );
    }, [mengerTarget]);

    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            {/* Sidebar */}
            <div style={{
                width: '200px',
                minWidth: '175px',
                height: '100vh',
                overflowY: 'auto',
                padding: '15px',
                borderRight: '1px solid var(--border)',
                background: 'var(--bg)',
                zIndex: 10
            }}>

                <h2 style={{ color: 'var(--accent)', fontSize: '1.2rem' }}>Analysis Tools</h2>

                {/* MST Toggle Button */}
                <button
                    onClick={() => setActiveView(activeView === 'mst' ? 'none' : 'mst')}
                    style={{
                        width: '100%',
                        padding: '8px',
                        marginBottom: '10px',
                        cursor: 'pointer',
                        backgroundColor: activeView === 'mst' ? '#36a866' : '#968f8f',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                    }}
                >
                    {activeView === 'mst' ? 'Hide MST' : 'Calculate MST'}
                </button>

                {activeView === 'mst' && (
                    <div style={{ marginTop: '20px' }}>
                        <h4 style={{ marginBottom: '5px' }}>Kruskal's Algorithm Steps:</h4>
                        <pre style={{
                            fontSize: '10px',
                            background: '#282c34',
                            color: '#abb2bf',
                            padding: '5px',
                            borderRadius: '4px',
                            overflowX: 'auto',
                            whiteSpace: 'pre-wrap',
                            maxHeight: '100px',
                            overflowY: 'auto'
                        }}>
                            {mstLog && mstLog.length > 0 ? mstLog.join('\n') : "No log data available"}
                        </pre>
                    </div>
                )}

                {/* Bridges Toggle Button */}
                <button
                    onClick={() => setActiveView(activeView === 'bridges' ? 'none' : 'bridges')}
                    style={{
                        background: activeView === 'bridges' ? '#36a866' : '#968f8f',
                        width: '100%',
                        padding: '8px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        color: 'white',
                        border: 'none',
                        marginBottom: '10px'
                    }}
                >
                    {activeView === 'bridges' ? 'Hide Bridges' : 'Bridges & Cut-Vertices'}
                </button>

                {/* Menger Theorem Toggle */}
                <button
                    onClick={() => setActiveView(activeView === 'menger' ? 'none' : 'menger')}
                    style={{
                        background: activeView === 'menger' ? '#f1c40f' : '#968f8f', // Use Yellow for Menger
                        width: '100%',
                        padding: '8px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        color: activeView === 'menger' ? 'black' : 'white',
                        border: 'none',
                        marginBottom: '10px'
                    }}
                >
                    {activeView === 'menger' ? 'Exit Menger Mode' : 'Menger Theorem (Route 110)'}
                </button>

                {activeView === 'menger' && (
                    <p style={{ fontSize: '11px', color: 'var(--text)', fontStyle: 'italic' }}>
                        Click any yellow node to see edge-disjoint paths to King's Place.
                    </p>
                )}

                <hr style={{ margin: '20px 0' }} />

                <h2 style={{ color: 'var(--accent)', fontSize: '1.2rem' }}>Vertex Legend</h2>
                <p style={{ fontSize: '0.8rem', marginBottom: '15px' }}>IDs mapped to transit stops</p>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {normalizedData.nodes.sort((a, b) => a.id.localeCompare(b.id)).map(node => (
                        <li key={node.id} style={{
                            marginBottom: '5px',
                            fontSize: '10px',
                            borderBottom: '1px solid var(--border)',
                            paddingBottom: '5px'
                        }}>
                            <strong style={{ color: 'var(--text-h)' }}>{node.id}</strong>: {node.label}
                            {node.degree === 1 && (
                                <span style={{ color: '#ff4d4d', display: 'block', fontSize: '11px' }}>
                                    (End-Vertex / Degree 1)
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Graph Area */}
            <div style={{ flexGrow: 1, height: '100vh', background: '#ffffff' }}>
                <ForceGraph2D
                    graphData={graphData}
                    width={dimensions.width - 175}
                    height={dimensions.height}
                    nodeLabel="name"
                    // linkColor={() => '#cccccc'}
                    // linkWidth={2}
                    nodeRelSize={7}
                    // Particles show direction of flow for visual interest
                    linkDirectionalParticles={2}
                    linkDirectionalParticleSpeed={0.009}

                    onNodeClick={(node) => {
                        if (activeView === 'menger' && YELLOW_LINE_IDS.includes(node.id)) {
                            if (node.id === 'KP') {
                                alert("This is the source (King's Place). Select another yellow stop.");
                            } else {
                                setMengerTarget(node.id);
                            }
                        }
                    }}

                    // Custom Drawing for Node Labels (Essential for Source 92)
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        // Don't draw if coordinates aren't set yet
                        if (node.x === undefined || node.y === undefined) return;

                        const label = node.id;
                        const fontSize = 14 / globalScale;
                        ctx.font = `${fontSize}px Sans-Serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        // Draw white circle background for readability
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
                        ctx.fill();

                        // Draw ID Text
                        ctx.fillStyle = '#000000';
                        ctx.fillText(label, node.x, node.y);
                    }}
                    // Ensure labels are always drawn on top
                    nodeCanvasObjectMode={() => 'after'}

                    nodeColor={node => {
                        if (YELLOW_LINE_IDS.includes(node.id) && activeView == 'menger') return '#f1c40f';
                        if (activeView === 'bridges' && cutVertices.includes(node.id)) return '#e67e22'; // Orange for Cut-Vertices
                        return '#aa3bff';
                    }}

                    linkColor={link => {
                        const u = typeof link.source === 'object' ? link.source.id : link.source;
                        const v = typeof link.target === 'object' ? link.target.id : link.target;
                        const key = `${u}-${v}`;
                        const reverseKey = `${v}-${u}`;

                        // 1. Menger Path Highlighting
                        if (activeView === 'menger' && mengerResults) {
                            const isPath = mengerResults.paths.some(p => p.includes(key) || p.includes(reverseKey));
                            if (isPath) return '#f1c40f'; // Bright Yellow for paths
                        }

                        // 2. MST Highlighting
                        const isMST = activeView === 'mst' && (
                            mstEdges.includes(key) || mstEdges.includes(reverseKey)
                        );
                        if (isMST) return '#54dd15';

                        // 3. Bridge Highlighting
                        const isBridge = activeView === 'bridges' && (
                            bridges.includes(key) || bridges.includes(reverseKey)
                        );
                        if (isBridge) return '#e74c3c';

                        return '#cccccc';
                    }}
                    linkWidth={link => {
                        const u = typeof link.source === 'object' ? link.source.id : link.source;
                        const v = typeof link.target === 'object' ? link.target.id : link.target;

                        const key = `${u}-${v}`;
                        const reverseKey = `${v}-${u}`;

                        const isMST = activeView === 'mst' && (
                            mstEdges.includes(`${u}-${v}`) ||
                            mstEdges.includes(`${v}-${u}`)
                        );

                        if (activeView === 'menger' && mengerResults) {
                            const isPath = mengerResults.paths.some(p => p.includes(key) || p.includes(reverseKey));
                            return isPath ? '#f1c40f' : '#eeeeee';
                        }

                        const isBridge = (activeView === 'bridges' && (bridges.includes(key) || bridges.includes(reverseKey)));

                        return (isMST || isBridge) ? 4 : 2;
                    }}
                />
            </div>
        </div>
    );
};

export default TransitGraph;