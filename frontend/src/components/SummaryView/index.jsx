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
  const isSparse = data.length < 100;
  // same computation as in Overview * 1/3
  let height = 500;
  if (xAxisLevels.length >= 4 && !isSparse) {
    height = (xAxisLevels.length * height) / 3;
  } else if (xAxisLevels.length >= 4 && isSparse) {
    height = 700;
  }
  
  const minWidth = 700;
  const width = filterCategoryLevels.length*60 > minWidth ? filterCategoryLevels.length*60 : minWidth;
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
      yDomain: [0, range.max]
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
    colorPalette
  } = {}) {

    const svg = d3.select(chartId)
        .append('svg')
        .attr('width', width - marginLeft - marginRight)
        .attr('height', height - marginTop - marginBottom)
        .attr('viewBox', [0, 0, width, height])

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
      .domain(colorCategoryLevels)
      .range([0, x.bandwidth()])
      .padding([0.05])

    let color;
    if (colorCategory && colorCategoryLevels.length) {
      color = d3.scaleOrdinal()
        .domain(colorCategoryLevels)
        .range(_.clone(colorPalette).slice(0, colorCategoryLevels.length));
    }

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
        .attr('x', function(d, i) { return xSubgroup(d.name); })
        .attr('y', function(d) { return y(d.avg); })
        .attr('width', xSubgroup.bandwidth() < 5 ? 5 : xSubgroup.bandwidth())
        .attr('height', function(d) { return y(0) - y(d.avg); })
        .attr('fill', function(d) { return color(d.name); })

    function getBarData(d) {
      var barData = colorCategoryLevels.map(function(key) { return d.subgroups.find(v => v.name == key) });
      var filteredBarData = barData.filter(v => !(isNaN(v.avg)));
      return filteredBarData;
    }

    function xAxis(g) {
      g.attr('transform', `translate(0, ${height - marginBottom})`)
        .call(d3.axisBottom(x).tickFormat(i => domain[i]))
       // .attr('font-size', '20px')
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
      .attr("transform", "rotate(-65)");

    svg.append('text')
      .attr('class', 'y label')
      .attr('text-anchor', 'end')
      .attr('y', 0)
      .attr('dy', '.25em')
      .attr('transform', 'rotate(-90)')
      .text(yAxisAttr);
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

SummaryView.propTypes = {
  attributeTypes: PropTypes.shape({
    listical: PropTypes.array,
    categorical: PropTypes.array,
    quantitative: PropTypes.array,
  }),
  data: PropTypes.array,
}

export default SummaryView;
