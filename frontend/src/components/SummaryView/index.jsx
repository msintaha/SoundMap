import React, { useEffect, useState, useHasChanged } from 'react';
import PropTypes from 'prop-types';

import * as d3 from 'd3';
import _ from 'lodash';

import { COLORS, getCategoryLevels, getRangeWithValues, getAverages } from '../../utils/attributes';
import { Checkbox, FormControl, FormControlLabel, FormGroup, IconButton, InputLabel, Select, MenuItem, Input } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseOutlined from '@mui/icons-material/CloseOutlined';

function SummaryView({ attributeTypes, data }) {
  const [yAxisAttr, setXAxis] = useState(attributeTypes.quantitative[1]);
  const [xAxisAttr, setYAxis] = useState(attributeTypes.ordinal[0]);
  const [groupAttr, setGroup] = useState(attributeTypes.ordinal[1]);
  const [xAxisLevels, setxAxisLevels] = useState(toCheckboxObject(getCategoryLevels(xAxisAttr, data)));
  const [range, setRange] = useState(getRangeWithValues(yAxisAttr, data))
  const [colorPalette, setColorPalette] = useState(_.shuffle(COLORS));
  const [categoryToFilterBy, setCategoryToFilterBy] = useState(attributeTypes.ordinal[1]);
  const [filterCategoryLevels, setFilterCategoryLevels] = useState(toCheckboxObject(getCategoryLevels(categoryToFilterBy, data)));
  const margin = {top: 20, right: 95, bottom: 10, left: 100},
      width = 800 - margin.left - margin.right;

  useEffect(() => {
    const newYAxisLvl = toCheckboxObject(getCategoryLevels(xAxisAttr, data));
    const newFilterCategoryLvl = toCheckboxObject(getCategoryLevels(categoryToFilterBy, data));
    setxAxisLevels(newYAxisLvl);
    setFilterCategoryLevels(newFilterCategoryLvl);
    renderChart(newYAxisLvl, newFilterCategoryLvl, range);
  }, [xAxisAttr, categoryToFilterBy]);

  useEffect(() => {
    const newRange = getRangeWithValues(yAxisAttr, data);
    setRange(newRange);
    renderChart(xAxisLevels, filterCategoryLevels, newRange);
  }, [yAxisAttr]);

  useEffect(() => {
    renderChart(xAxisLevels, filterCategoryLevels, range);
  }, [xAxisLevels, filterCategoryLevels, range]);

  function renderChart(xAxisLevels, filterCategoryLevels, range) {
    const svg = d3.select("#barchart").selectAll('svg');
    if (svg._groups.length > 0) { d3.selectAll("#barchart > svg").remove(); }
    const shuffledColorPalette = _.shuffle(colorPalette);
    setColorPalette(shuffledColorPalette);

    const filterData = xAxisLevels.filter(y => y.checked)
      .map(y => ({name: y.value, value: data.filter(d => d[xAxisAttr] === y.value)}));

    const checkedColorCategoryLevels = filterCategoryLevels.filter(x => x.checked);

    const avgData = filterData.map(y => ({group: y.name, subgroups: checkedColorCategoryLevels.map(x => ({name: x.value, avg: _.meanBy(y.value.filter(z => x.value == z[groupAttr]).map(v => Number((v[yAxisAttr]))))}))}));

    return BarChart(avgData, {
      x: d => Number(d[yAxisAttr]),
      label: yAxisAttr,
      type: d3.scaleLinear,
      domain: xAxisLevels.filter(x => x.checked).map(x => x.value),
      width,
      showScale: 1,
      yLabel: yAxisAttr,
      colorCategory: categoryToFilterBy,
      colorCategoryLevels: filterCategoryLevels.filter(f => f.checked).map(f => f.value),
      colorPalette: shuffledColorPalette,
      yDomain: [0, range.max]
    });
  }

  function BarChart(data, {
    value = d => d, // convience alias for x
    label, // convenience alias for xLabel
    type = d3.scaleLinear, // convenience alias for xType
    domain, // convenience alias for xDomain
    x = value, // given d in data, returns the quantitative x value
    marginTop = 50, // top margin, in pixels
    marginRight = 50, // right margin, in pixels
    marginBottom = 50, // bottom margin, in pixels
    marginLeft = 50, // left margin, in pixels
    width = 400, // outer width, in pixels
    height = 400, // outer height, in pixels
    xType = type, // type of x-scale, e.g. d3.scaleLinear
    xLabel = label, // a label for the x-axis
    xDomain = domain, // [xmin, xmax]
    xRange = [marginLeft, width - marginRight], // [left, right]
    yDomain,
    yLabel,
    showScale,
    colorCategory,
    colorCategoryLevels,
    colorPalette
  } = {}) {

    const svg = d3.select("#barchart")
        .append("svg")
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("viewBox", [0, 0, width, height])

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


    svg.append('g')
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
        .attr("transform", function(d, i) { return "translate(" + x(i) + ",0)"; })

      .selectAll("rect")
      .data(function(d) { return colorCategoryLevels.map(function(key) { return {key: key, value: d.subgroups.find(v => v.name == key)} }); })
      .enter().append("rect")
        .attr("x", function(d) { return xSubgroup(d.key); })
        .attr("y", function(d) { return y(d.value.avg); })
        .attr("width", xSubgroup.bandwidth())
        .attr("height", function(d) { return y(0) - y(d.value.avg); })
        .attr("fill", function(d) { return color(d.key); });

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
    svg.append('g').call(xAxis);

    svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 0)
      .attr("dy", ".25em")
      .attr("transform", "rotate(-90)")
      .text(yAxisAttr);
    return svg.node();
  }


  return (
    <div className="sm-SummaryView">
      <div id="barchart">
        {categoryToFilterBy && 
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

function toCheckboxObject(arr) {
  return arr.map(a => ({ value: a, checked: true }));
}

SummaryView.propTypes = {
  attributeTypes: PropTypes.shape({
    listical: PropTypes.array,
    ordinal: PropTypes.array,
    quantitative: PropTypes.array,
  }),
  data: PropTypes.array,
}

export default SummaryView;
