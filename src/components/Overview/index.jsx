import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import * as d3 from 'd3';
import { COLORS, getCategoryLevels } from '../../utils/attributes';

function Overview({ attributeTypes, data }) {
  const [xAxisAttr, setXAxis] = useState(attributeTypes.quantitative[1]);
  const [yAxisAttr, setYAxis] = useState(attributeTypes.ordinal[0]);
  const [categoryToFilterBy, setCategoryToFilterBy] = useState(attributeTypes.ordinal[1]);
  const colorPalette = _.shuffle(COLORS);
  const margin = {top: 20, right: 95, bottom: 10, left: 100},
      width = 800 - margin.left - margin.right;

  useEffect(() => {
    const ordinalAttrLevels = getCategoryLevels(yAxisAttr, data);
    const categoryToFilterByAttrLevels = getCategoryLevels(categoryToFilterBy, data);
    const lastIndex = ordinalAttrLevels.length - 1;
    ordinalAttrLevels.forEach((yAxisLabel, index) => {
      BeeswarmChart(data.filter(d => d[yAxisAttr] === yAxisLabel), {
        x: d => Number(d[xAxisAttr]),
        label: xAxisAttr,
        type: d3.scaleLinear,
        width,
        radius: 4,
        showScale: index === lastIndex,
        yLabel: yAxisLabel,
        colorCategory: categoryToFilterBy,
        colorCategoryLevels: categoryToFilterByAttrLevels,
        colorPalette
      })
    });
  }, [xAxisAttr, yAxisAttr]);

  function BeeswarmChart(data, {
    value = d => d, // convience alias for x
    label, // convenience alias for xLabel
    type = d3.scaleLinear, // convenience alias for xType
    domain, // convenience alias for xDomain
    x = value, // given d in data, returns the quantitative x value
    radius = 5, // (fixed) radius of the circles
    padding = 1.5, // (fixed) padding between the circles
    marginTop = 20, // top margin, in pixels
    marginRight = 20, // right margin, in pixels
    marginBottom = 20, // bottom margin, in pixels
    marginLeft = 30, // left margin, in pixels
    width = 640, // outer width, in pixels
    height, // outer height, in pixels
    xType = type, // type of x-scale, e.g. d3.scaleLinear
    xLabel = label, // a label for the x-axis
    xDomain = domain, // [xmin, xmax]
    xRange = [marginLeft, width - marginRight], // [left, right]
    yLabel,
    showScale,
    colorCategory,
    colorCategoryLevels,
    colorPalette
  } = {}) {
    // Compute values.
    const X = d3.map(data, x).map(x => x == null ? NaN : +Number(x));
    
    // Compute which data points are considered defined.
    const I = d3.range(X.length).filter(i => !isNaN(X[i]));
  
    // Compute default domains.
    if (xDomain === undefined) xDomain = d3.extent(X);
  
    // Construct scales and axes.
    const xScale = xType(xDomain, xRange);
    const xAxis = d3.axisBottom(xScale).ticks(5, ".1f").tickSizeOuter(0);
    const yScale = d3.scaleOrdinal([yLabel], [yLabel]);
    const yAxis = d3.axisLeft(xScale).tickSizeOuter(0);
  
    // Compute the y-positions.
    const Y = dodge(I.map(i => xScale(X[i])), radius * 2 + padding);


    // Compute the default height;
    if (height === undefined) height = d3.max(Y) + (radius + padding) * 2 + marginTop + marginBottom + 5;
  
    // Given an array of x-values and a separation radius, returns an array of y-values.
    function dodge(X, radius) {
      const Y = new Float64Array(X.length);
      const radius2 = radius ** 2;
      const epsilon = 1e-3;
      let head = null, tail = null;
    
      // Returns true if circle ⟨x,y⟩ intersects with any circle in the queue.
      function intersects(x, y) {
        let a = head;
        while (a) {
          const ai = a.index;
          if (radius2 - epsilon > (X[ai] - x) ** 2 + (Y[ai] - y) ** 2) return true;
          a = a.next;
        }
        return false;
      }
    
      // Place each circle sequentially.
      for (const bi of d3.range(X.length).sort((i, j) => X[i] - X[j])) {
  
        // Remove circles from the queue that can’t intersect the new circle b.
        while (head && X[head.index] < X[bi] - radius2) head = head.next;
    
        // Choose the minimum non-intersecting tangent.
        if (intersects(X[bi], Y[bi] = 0)) {
          let a = head;
          Y[bi] = Infinity;
          do {
            const ai = a.index;
            let y = Y[ai] + Math.sqrt(radius2 - (X[ai] - X[bi]) ** 2);
            if (y < Y[bi] && !intersects(X[bi], y)) Y[bi] = y;
            a = a.next;
          } while (a);
        }
    
        // Add b to the queue.
        const b = {index: bi, next: null};
        if (head === null) head = tail = b;
        else tail = tail.next = b;
      }
    
      return Y;
    }
  
    const svg = d3.select("#beeswarm")
        .append("svg")
        .attr("width", width)
        .attr("height", height + 10)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    if (showScale) {
      svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis)
        .call(g => g.append("text")
            .attr("x", width)
            .attr("y", marginBottom + 3)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text(xLabel));
    } else {
      svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(g => g.append("text")
            .attr("x", width)
            .attr("y", marginBottom - 4)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end"))
            .call(g => g.select(".domain").remove());
    }

    svg.append("text")
      .attr("class", "yLabel")
      .attr("text-anchor", "start")
      .attr("x", 0)
      .attr("y", 8)
      .attr("dy", ".5em")
      .text(yLabel);

    const Tooltip = d3.select('#beeswarm')
      .append("div")
      .attr("class", 'popover');

    const mouseover = function(event) {
      Tooltip
        .style("opacity", 1)
      d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1)
    }
    const mousemove = function(event) {
      const key = event.srcElement.__data__;
      Tooltip
        .html(`<strong>${xLabel}</strong>: ${X[key]}` 
          + (colorCategory ? `<br /> <strong>${colorCategory}</strong>: ${data[key][colorCategory]}` : ''))
        .style("left", `${event.pageX - 30}` + "px")
        .style("top", `${event.pageY - 70}` + "px")
    }
    const mouseleave = function(event) {
      Tooltip
        .style("opacity", 0)
      d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8)
    }

    let color;
    if (colorCategory && colorCategoryLevels.length) {
      color = d3.scaleOrdinal()
        .domain(colorCategoryLevels)
        .range(colorPalette.slice(0, colorCategoryLevels.length));
    }

    svg.append("g")
      .selectAll("circle")
      .attr("class", "values")
      .data(I)
      .join("circle")
      .attr("cx", i => xScale(X[i]))
      .attr("cy", i => height - marginBottom - radius - padding - Y[i])
      .attr("r", radius)
      .style("fill", colorCategory ? d => color(data[d][colorCategory]) : "#66cccc")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

    return svg.node();
  }

  return (
    <div className="sm-Overview">
      <div id="beeswarm">
        {categoryToFilterBy && 
          <div className="sm-Overview-legends" style={{ width }}>
            {getCategoryLevels(categoryToFilterBy, data).map((category, index) =>
              <div className="sm-Overview-legend">
                <span className="sm-Overview-legendColor" style={{ color: colorPalette[index] }}>&#9679;</span>
                {category}
              </div>
            )}
          </div>
        }
      </div>
    </div>
  );
}

Overview.propTypes = {
  attributeTypes: PropTypes.shape({
    listical: PropTypes.array,
    ordinal: PropTypes.array,
    quantitative: PropTypes.array,
  }),
  data: PropTypes.array,
}

export default Overview;
