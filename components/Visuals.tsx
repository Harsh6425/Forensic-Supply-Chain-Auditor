import React, { useEffect, useRef } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import * as d3 from 'd3';
import { Discrepancy, PersonOfInterest } from '../types';

// --- Timeline Chart (Recharts) ---

interface TimelineChartProps {
  discrepancies: Discrepancy[];
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ discrepancies }) => {
  const data = discrepancies.map((d, index) => ({
    x: index + 1, // Simple sequence for now, ideally parsed from timestamp
    y: d.risk_score,
    z: d.confidence === 'HIGH' ? 100 : d.confidence === 'MEDIUM' ? 60 : 30,
    type: d.type,
    name: d.description,
    confidence: d.confidence
  }));

  const COLORS = {
    TEMPORAL_MISMATCH: '#f59e0b', // Amber
    QUANTITY_VARIANCE: '#ef4444', // Red
    VERBAL_CONTRADICTION: '#3b82f6', // Blue
    BEHAVIORAL_ANOMALY: '#a855f7', // Purple
  };

  return (
    <div className="h-64 w-full bg-slate-900/50 rounded-lg p-4 border border-slate-800">
      <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Incident Timeline & Risk Severity</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis type="number" dataKey="x" name="Sequence" stroke="#94a3b8" tick={false} label={{ value: 'Time Sequence', position: 'insideBottomRight', offset: 0, fill: '#64748b' }} />
          <YAxis type="number" dataKey="y" name="Risk Score" unit="" stroke="#94a3b8" domain={[0, 10]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
            itemStyle={{ color: '#e2e8f0' }}
          />
          <Scatter name="Discrepancies" data={data} fill="#8884d8">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.type] || '#fff'} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};


// --- Network Graph (D3) ---

interface NetworkGraphProps {
  persons: PersonOfInterest[];
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ persons }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || persons.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = 300;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    // Prepare nodes and links
    const nodes = persons.map(p => ({ id: p.name, group: p.role, val: p.flag_count }));
    // Create a mock central node representing the "Incident" to connect everyone
    nodes.push({ id: 'INCIDENT', group: 'EVENT', val: 10 });

    const links = persons.map(p => ({ source: p.name, target: 'INCIDENT', value: 1 }));

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "#475569")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", d => d.group === 'EVENT' ? 10 : 5 + (d.val * 2))
      .attr("fill", d => d.group === 'EVENT' ? '#ef4444' : '#3b82f6')
      .call(drag(simulation) as any);

    node.append("title")
      .text(d => d.id);

    const labels = svg.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .style("fill", "#94a3b8")
      .style("font-size", "10px")
      .style("pointer-events", "none")
      .text(d => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    function drag(simulation: any) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

  }, [persons]);

  return (
    <div className="h-full w-full bg-slate-900/50 rounded-lg border border-slate-800 relative overflow-hidden">
      <h3 className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Relationship Network</h3>
      <svg ref={svgRef} className="w-full h-[300px]" />
    </div>
  );
};
