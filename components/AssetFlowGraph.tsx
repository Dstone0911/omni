
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface AssetFlowGraphProps {
  fromNetwork: string;
  toNetwork: string;
  isActive: boolean;
}

export const AssetFlowGraph: React.FC<AssetFlowGraphProps> = ({ fromNetwork, toNetwork, isActive }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 600;
    const height = 120;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const nodes = [
      { id: 'from', x: 80, y: height / 2, label: fromNetwork, type: 'source' },
      { id: 'relay', x: width / 2, y: height / 2, label: 'Abstraction Layer', type: 'interop' },
      { id: 'to', x: width - 80, y: height / 2, label: toNetwork, type: 'target' }
    ];

    const links = [
      { source: 'from', target: 'relay' },
      { source: 'relay', target: 'to' }
    ];

    // Define gradients
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'line-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%');

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#a855f7');

    // Draw links
    svg.selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('x1', d => nodes.find(n => n.id === d.source)!.x)
      .attr('y1', d => nodes.find(n => n.id === d.source)!.y)
      .attr('x2', d => nodes.find(n => n.id === d.target)!.x)
      .attr('y2', d => nodes.find(n => n.id === d.target)!.y)
      .attr('stroke', 'url(#line-gradient)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.6);

    // Animated particles if active
    if (isActive) {
      const animate = () => {
        const particle = svg.append('circle')
          .attr('r', 4)
          .attr('fill', '#fff')
          .attr('cx', nodes[0].x)
          .attr('cy', nodes[0].y)
          .style('filter', 'blur(1px)');

        particle.transition()
          .duration(2000)
          .ease(d3.easeLinear)
          .attr('cx', nodes[2].x)
          .remove();

        setTimeout(() => {
          if (isActive) animate();
        }, 800);
      };
      animate();
    }

    // Draw nodes
    const nodeGroups = svg.selectAll('g.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    nodeGroups.append('circle')
      .attr('r', d => d.type === 'interop' ? 10 : 15)
      .attr('fill', d => d.type === 'interop' ? '#1f2937' : '#111827')
      .attr('stroke', d => d.type === 'interop' ? '#a855f7' : '#3b82f6')
      .attr('stroke-width', 2);

    nodeGroups.append('text')
      .attr('dy', 30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9ca3af')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text(d => d.label);

  }, [fromNetwork, toNetwork, isActive]);

  return (
    <div className="w-full glass rounded-3xl p-4 mb-4 border border-blue-500/20 overflow-hidden">
      <div className="text-[10px] uppercase tracking-widest text-blue-400 mb-2 font-bold">Interoperability Flow Engine</div>
      <svg ref={svgRef} className="w-full h-[120px]" />
    </div>
  );
};
