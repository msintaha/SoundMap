import React, { useEffect, useState, useHasChanged } from 'react';
import PropTypes from 'prop-types';

import * as d3 from 'd3';
import _ from 'lodash';

import { COLORS, getCategoryLevels, getRangeWithValues, getAverages } from '../../utils/attributes';
import { Checkbox, FormControl, FormControlLabel, FormGroup, IconButton, InputLabel, Select, MenuItem, Input } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseOutlined from '@mui/icons-material/CloseOutlined';

function SummaryView({ attributeTypes, data }) {
  const [panelWidth, setPanelWidth] = useState(0);
  const [yAxisAttr, setXAxis] = useState(attributeTypes.quantitative[1]);
  const [xAxisAttr, setYAxis] = useState(attributeTypes.ordinal[0]);
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

    console.log(xAxisLevels);

    console.log(data);
    console.log(xAxisAttr);
    console.log(yAxisAttr);
    console.log(range);

    const filterData = xAxisLevels.filter(y => y.checked)
      .map(y => ({name: y.value, value: data.filter(d => d[xAxisAttr] === y.value)}));

    const newData = filterData.map(y => ({name: y.name, value: _.meanBy(y.value.map(v => Number((v[yAxisAttr]))))}));

    return BarChart(newData, {
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
    width = 700, // outer width, in pixels
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

    const testdata =  [
      { stimulus: '1', value: 50 },
      { stimulus: '2', value: 60 },
      { stimulus: '3', value: 70 }
    ]

    const svg = d3.select("#barchart")
        .append("svg")
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("viewBox", [0, 0, width, height])

    // Define scale for X axis
    var x = d3.scaleBand()
      .domain(d3.range(domain.length))
      .range([marginLeft, width - marginRight])
      .padding(0.1);

    // Define scale for Y axis
    var  y = d3.scaleLinear()
      .domain(yDomain)
      .range([height - marginBottom, marginTop]);

    svg.append('g')
      .attr('fill', 'currentColor')
      .selectAll('rect')
      .data(data)
      .join('rect')
        .attr('x', (d, i) => x(i))
        .attr('y', (d) => y(d.value))
        .attr('height', (d) => y(0) - y(d.value))
        .attr('width', x.bandwidth());

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
