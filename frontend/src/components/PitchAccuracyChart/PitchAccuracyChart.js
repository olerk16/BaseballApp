import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './PitchAccuracyChart.css';

const PitchAccuracyChart = ({ data }) => {
  const chartRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    console.log('Raw Data:', data);

    // Sanitize data: Filter out invalid entries
    const sanitizedData = data.filter(
      (d) => d.date instanceof Date && !isNaN(d.date) && typeof d.accuracy === 'number'
    );

    console.log('Sanitized Data:', sanitizedData);

    if (sanitizedData.length === 0) {
      console.warn('No valid data to render.');
      return;
    }

    // Clear any existing SVG
    d3.select(chartRef.current).selectAll('*').remove();

    // Set dimensions
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(sanitizedData, (d) => d.date)) // Use `d.date` directly
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 1]) // Accuracy between 0 and 1
      .range([height, 0]);

    // Create axes
    const xAxis = d3.axisBottom(xScale).ticks(5);
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.format('.0%'));

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-0.8em')
      .attr('dy', '-0.15em')
      .attr('transform', 'rotate(-45)');

    svg.append('g').call(yAxis);

    // Line generator
    const line = d3
      .line()
      .x((d) => xScale(d.date)) // Use `d.date` directly
      .y((d) => yScale(d.accuracy))
      .curve(d3.curveMonotoneX);

    // Draw line
    svg.append('path')
      .datum(sanitizedData)
      .attr('fill', 'none')
      .attr('stroke', '#1f77b4')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots
    svg.selectAll('circle')
      .data(sanitizedData)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.date))
      .attr('cy', (d) => yScale(d.accuracy))
      .attr('r', 4)
      .attr('fill', '#ff7f0e')
      .on('mouseover', (event, d) => {
        d3.select(event.target).attr('r', 6);
        tooltip
          .style('opacity', 1)
          .html(
            `<strong>Time:</strong> ${d.date.toLocaleString()}<br><strong>Accuracy:</strong> ${(d.accuracy * 100).toFixed(
              2
            )}%`
          )
          .style('left', `${event.pageX + 5}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', (event) => {
        d3.select(event.target).attr('r', 4);
        tooltip.style('opacity', 0);
      });

    // Tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', '#f9f9f9')
      .style('padding', '8px')
      .style('border', '1px solid #ccc')
      .style('border-radius', '4px')
      .style('opacity', 0);
  }, [data]);

  return <div ref={chartRef}></div>;
};

export default PitchAccuracyChart;
