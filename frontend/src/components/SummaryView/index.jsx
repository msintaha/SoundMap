import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import * as d3 from 'd3';

import { getRangeWithValues } from '../../utils/attributes';

function SummaryView({
  data, 
  colorPalette, 
  xAxisAttr, 
  xAxisLevels,
  groupAttr,
  yAxisAttr,
  filterCategoryLevels,
  viewId,
}) {
  const isSparse = data.length > 96;

  let height = 430;
  if (isSparse) {
    height = 630;
  }
  
  const minWidth = 700;
  const width = filterCategoryLevels.length*20 > minWidth ? filterCategoryLevels.length*20 : minWidth;
  const chartId = `#barchart-${viewId}`;
  const [range, setRange] = useState(getRangeWithValues(yAxisAttr, data))

  useEffect(() => {
    const newRange = getRangeWithValues(yAxisAttr, data);
    setRange(newRange);
    renderChart(xAxisLevels, filterCategoryLevels, newRange);
  }, [yAxisAttr]);

  useEffect(() => {
    renderChart(xAxisLevels, filterCategoryLevels, range);
  }, [xAxisLevels, filterCategoryLevels, range]);

  useEffect(() => {
    renderChart(xAxisLevels, filterCategoryLevels, range);
  }, [colorPalette]);

  function renderChart(xAxisLevels, filterCategoryLevels, range) {
    const svg = d3.select(chartId).selectAll('svg');
    if (svg._groups.length > 0) { d3.selectAll(`${chartId} > svg`).remove(); }

    const filterData = xAxisLevels.filter(y => y.checked)
      .map(y => ({name: y.value, value: data.filter(d => d[xAxisAttr] === y.value)}));

    const checkedColorCategoryLevels = filterCategoryLevels.filter(x => x.checked);

    const avgData = filterData.map(y => ({group: y.name, subgroups: checkedColorCategoryLevels.map(x => ({name: x.value, avg: _.meanBy(y.value.filter(z => x.value == z[groupAttr]).map(v => Number((v[yAxisAttr]))))}))}));

    // get largest avg value for y axis height
    var maxAvg = 0;
    avgData.forEach(d => d.subgroups.forEach(s => { if (s.avg > maxAvg) { maxAvg = s.avg}}));

    var maxTitleChar = 0;
    avgData.forEach(d => d.subgroups.forEach(s => { if (s.name.length > maxTitleChar) { maxTitleChar = s.name.length}}));

    return BarChart(avgData, {
      x: d => Number(d[yAxisAttr]),
      label: yAxisAttr,
      type: d3.scaleLinear,
      domain: xAxisLevels.filter(x => x.checked).map(x => x.value),
      showScale: 1,
      yLabel: yAxisAttr,
      colorCategory: groupAttr,
      colorCategoryLevels: filterCategoryLevels.filter(f => f.checked).map(f => f.value),
      colorPalette,
      yDomain: [0, maxAvg + maxAvg/10],
      maxTitleChar
    });
  }

  function BarChart(data, {
    value = d => d, // convience alias for x
    domain, // convenience alias for xDomain
    x = value, // given d in data, returns the quantitative x value
    marginTop = 50, // top margin, in pixels
    marginRight = 50, // right margin, in pixels
    marginBottom = 150, // bottom margin, in pixels
    marginLeft = 50, // left margin, in pixels
    yDomain,
    colorCategory,
    colorCategoryLevels,
    colorPalette,
    maxTitleChar
  } = {}) {
    
    var largestSubgroup = 1;
    var subgroupDomain = []
    data.forEach(element => {
      var i = element.subgroups.length;
      var subgroupSize= 0;
      while (i--) {
        if (isNaN(element.subgroups[i].avg)) { 
          continue;
        } 
        subgroupSize++;
      }
      if (subgroupSize > largestSubgroup) {
        largestSubgroup = subgroupSize;
      }
    });

    for (var i = 0; i < largestSubgroup; i++) {
      subgroupDomain.push(i);
    }

    const svg = d3.select(chartId)
        .append('svg')
        .attr('width', width - marginRight- marginLeft)
        .attr('height', height - marginTop - marginBottom)
        .attr('viewBox', [0, 0, width, height])
        .attr('style', 'max-width: 100%; height: auto; height: intrinsic;');

    var groups = d3.map(data, function(d) {return(d.group)}).keys()

    // Define scale for X axis
    var x = d3.scaleBand()
      .domain(groups)
      .range([marginLeft, width - marginRight])
      .padding(0.1);

    // Define scale for Y axis
    var  y = d3.scaleLinear()
      .domain(yDomain)
      .range([height - marginBottom, marginTop]);

    // Another scale for subgroup position
    var xSubgroup = d3.scaleBand()
      .domain(subgroupDomain)
      .range([0, x.bandwidth()])
      .padding([0.05])

    let color;
    if (colorCategory && colorCategoryLevels.length) {
      color = d3.scaleOrdinal()
        .domain(colorCategoryLevels)
        .range(_.clone(colorPalette).slice(0, colorCategoryLevels.length));
    }

    const Tooltip = d3.select(chartId)
      .append("div")
      .attr("class", 'popover');

    const mouseover = function(event) {
      Tooltip
        .style("opacity", 1)
      d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1)
    };

    const mousemove = function(event) {
      const mouseData = event.srcElement.__data__;
      Tooltip
        .html(`<strong>${groupAttr}</strong>: ${mouseData.name}` + `<br /><strong>${yAxisAttr}</strong>: ${mouseData.avg.toFixed(2)}`)
        .style("left", `${event.x/4}` + "px")
        .style("top", `${event.y - 48}` + "px")
    };

    const mouseleave = function(event) {
      Tooltip
        .style('opacity', 0)
      d3.select(this)
        .style('stroke', 'none')
        .style('opacity', 1)
    };

    // iterate backwards removing averages that are NaN
    data.forEach(element => {
      var i = element.subgroups.length;
        while (i--) {
          if (isNaN(element.subgroups[i].avg)) { 
            element.subgroups.splice(i, 1);
          } 
        }
    });

    svg.append('g')
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
        .attr('transform', function(d, i) { return 'translate(' + x(i) + ',0)'; })

      .selectAll('rect')
      .data(function(d) { return getBarData(d); })
      .enter().append('rect')
        .attr('x', function(d, i) { return xSubgroup(i); })
        .attr('y', function(d) { return y(d.avg); })
        .attr('width', xSubgroup.bandwidth() < 5 ? 5 : xSubgroup.bandwidth())
        .attr('height', function(d) { return y(0) - y(d.avg); })
        .attr('fill', function(d) { return color(d.name); })
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseleave', mouseleave)

    function getBarData(d) {
      var barData = colorCategoryLevels.map(function(key) { return d.subgroups.find(v => v.name == key) });
      var filteredBarData = barData.filter(v => !(v === undefined));
      return filteredBarData;
    }

    function xAxis(g) {
      g.attr('transform', `translate(0, ${height - marginBottom})`)
        .call(d3.axisBottom(x).tickFormat(i => domain[i]))
       .attr('font-size', '12px')
    }
  
    function yAxis(g) {
      g.attr('transform', `translate(${marginLeft}, 0)`)
        .call(d3.axisLeft(y).ticks(null, data.format))
        //.attr('font-size', '20px')
    }

    svg.append('g').call(yAxis);
    svg.append('g').call(xAxis)
      .selectAll("text")  
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-60)")
      .call(wrap, marginBottom - 18);

    svg.append('text')
      .attr('class', 'y label')
      .attr('text-anchor', 'end')
      .attr('y', 0)
      .attr('dy', '.25em')
      .attr('transform', 'rotate(-90)')
      .text(yAxisAttr);

      svg.append('text')
      .attr('class', 'x label')
      .attr('text-anchor', 'middle')
      .attr('x', width - width/2)
      .attr('y', height - maxTitleChar/2)
      .text(xAxisAttr);

    return svg.node();
  }


  return (
    <div className="sm-SummaryView">
      <div id={chartId.replace('#', '')} className="sm-SummaryView-chart">
        <h6 className="sm-SummaryView-heading">SUMMARY</h6>
        <span className="sm-Overview-legendLabel">{groupAttr}</span>
        {filterCategoryLevels.length > 0 && 
          <div className="sm-SummaryView-legends" style={{ width }}>
            {filterCategoryLevels.filter(f => f.checked).map((category, index) =>
              <div key={category.value} className="sm-SummaryView-legend">
                <span className="sm-SummaryView-legendColor" style={{ color: colorPalette[index] }}>&#9679;</span>
                {category.value}
              </div>
            )}
          </div>
        }
      </div>
    </div>
  );
}

function wrap(text, width) {
  text.each(function () {
    let text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1,
      x = text.attr("x"),
      y = text.attr("y"),
      dy = 0,
      tspan = text.text(null)
                .append("tspan")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan")
                    .attr("x", 0)
                    .attr("y", y)
                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                    .text(word);
      }
    }
  });
}

SummaryView.propTypes = {
  attributeTypes: PropTypes.shape({
    listical: PropTypes.array,
    categorical: PropTypes.array,
    quantitative: PropTypes.array,
  }),
  data: PropTypes.array,
}

export default SummaryView;
