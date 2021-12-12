import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import * as d3 from 'd3';
import _ from 'lodash';

import { COLORS, COLOR_FILTER_LIMIT, getCategoryLevels, getRangeWithValues, getRecycledColors, toCheckboxObject } from '../../utils/attributes';
import { Checkbox, FormControl, FormControlLabel, FormGroup, IconButton, InputLabel, Select, MenuItem, Input } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import SummaryView from '../SummaryView';
import DetailedView from '../DetailedView';


function Overview({ attributeTypes, data, defaultQuantitativeAttr, viewId, compareMode, onRemoveView, shouldShowRemoveView }) {
  const chartId = `#beeswarm-${viewId}`;
  const isSparse = data.length < 100;
  const width = 695, radius = isSparse ? 3.8 : 3.3, padding = isSparse ? 1.5 : 1.2;
  const margin = {
    left: isSparse ? 100 : 70,
    right: 30,
    top: 60,
    bottom: 10
  };
  let sampleRateAttr, fileDataAttr;
  attributeTypes.listical.forEach(attr => {
    if (data[0][attr].includes(',')) {
      fileDataAttr = attr;
    } else {
      sampleRateAttr = attr;
    }
  });

  const [panelWidth, setPanelWidth] = useState(0);
  const [xAxisAttr, setXAxis] = useState(defaultQuantitativeAttr);
  const [yAxisAttr, setYAxis] = useState(attributeTypes.categorical[0]);
  const [range, setRange] = useState(getRangeWithValues(xAxisAttr, data))
  const [yAxisLevels, setYAxisLevels] = useState(toCheckboxObject(getCategoryLevels(yAxisAttr, data)));
  const [categoryToFilterBy, setCategoryToFilterBy] = useState(attributeTypes.categorical[1]);
  const [filterCategoryLevels, setFilterCategoryLevels] = useState(toCheckboxObject(getCategoryLevels(categoryToFilterBy, data), COLOR_FILTER_LIMIT));
  const [elementData, setElementData] = useState('');
  const [toRemove, setToRemove] = useState('');

  useEffect(() => {
    if (compareMode === 'Overview' || !compareMode) {
      renderAnimatedChart(yAxisLevels, filterCategoryLevels, range);
    }
  }, [compareMode]);

  useEffect(() => {
    const newYAxisLvl = toCheckboxObject(getCategoryLevels(yAxisAttr, data));
    const newFilterCategoryLvl = toCheckboxObject(getCategoryLevels(categoryToFilterBy, data), COLOR_FILTER_LIMIT);
    setYAxisLevels(newYAxisLvl);
    setFilterCategoryLevels(newFilterCategoryLvl);
    renderAnimatedChart(newYAxisLvl, newFilterCategoryLvl, range);
  }, [yAxisAttr, categoryToFilterBy]);

  useEffect(() => {
    const newRange = getRangeWithValues(xAxisAttr, data);
    setRange(newRange);
    renderAnimatedChart(yAxisLevels, filterCategoryLevels, newRange);
  }, [xAxisAttr]);

  useEffect(() => {
    renderAnimatedChart(yAxisLevels, filterCategoryLevels, range);
    }, [yAxisLevels, filterCategoryLevels, range]);

  function renderAnimatedChart(yAxisLevels, filterCategoryLevels, range) {
    const svg = d3.select(chartId).selectAll('svg');
    if (svg._groups.length > 0) { d3.selectAll(`${chartId} > svg`).remove(); }

    const yAxisLabels = yAxisLevels.filter(y => y.checked).map(y => y.value);
    const filterCategoryLabels = filterCategoryLevels.filter(f => f.checked).map(f => f.value);
    const shouldApplyFilterCategory = categoryToFilterBy && filterCategoryLabels.length;

    function filterFn(data, yAxisAttr, filterAttr) {
      if (shouldApplyFilterCategory) {
        return yAxisLabels.includes(data[yAxisAttr]) && filterCategoryLabels.includes(data[filterAttr]);
      }
      return yAxisLabels.includes(data[yAxisAttr]);
    }

    AnimatedBeeswarm(
      data.filter(d => filterFn(d, yAxisAttr, categoryToFilterBy)),
      xAxisAttr,
      yAxisAttr,
      categoryToFilterBy,
      filterCategoryLabels,
      yAxisLabels,
      [range.min, range.max]
    )
  }

  function setChecked(event, value, data, setFn, limit = null) {
    const newData = data.map(d => {
      if (d.value === value) {
        d.checked = event.target.checked;
      }
      return d;
    });
    setFn(newData);
  }

  function setMinValue({ target }) {
    const { value } = target;
    setRange({ min: value, max: range.max });
  }

  function setMaxValue({ target }) {
    const { value } = target;
    setRange({ max: value, min: range.min });
  }

  function AnimatedBeeswarm(data, xAxisAttr, yAxisAttr, colorCategory, colorCategoryLevels, yAxisLevels, xDomain) {
    let height = 500;
    if (yAxisLevels.length >= 4 && !isSparse) {
      height = (yAxisLevels.length * (height - (xAxisAttr.endsWith('max') || xAxisAttr.endsWith('min') ? 0 : margin.top))) / 3;
    } else if (yAxisLevels.length >= 4 && isSparse) {
      height = 635;
    }

    const x = d3.scaleLinear()
      .domain(xDomain)
      .nice()
      .range([margin.left, width - margin.right])

    const xAxis = g => g
      .attr('transform', `translate(0,${height - margin.top})`)
      .call(d3.axisBottom(x));

    const color = d3.scaleOrdinal()
      .domain(colorCategoryLevels)
      .range(getRecycledColors(colorCategoryLevels.length));

    const y = d3.scaleBand()
      .domain(yAxisLevels)
      .range([isSparse ? 600 : height + margin.bottom, isSparse ? margin.top - 20 : margin.top])

    const svg = d3.select(chartId).append('svg')
      .attr('width', width)
      .attr('height', height + 10)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto; height: intrinsic;');
    
    svg.append('g').call(xAxis);

    svg.append('text')
      .attr('class', 'axisLabel')
      .attr('text-anchor', 'end')
      .attr('x', width - 20)
      .attr('y', height - 32)
      .text(xAxisAttr);
    
    svg.append('text')
      .attr('class', 'axisLabel')
      .attr('text-anchor', 'end')
      .attr('x', 76)
      .attr('y', 11)
      .text(yAxisAttr);
    
    svg.selectAll('.line-decade')
      .data(x.ticks())
      .join('line')
      .attr('class', 'line-decade')
      .attr('x1', d => x(d))
      .attr('x2', d => x(d))
      .attr('y1', 10)
      .attr('y2', height - margin.top)
      .attr('stroke-width', 1)
      .style('stroke-dasharray', ('3, 3'))
      .attr('stroke', 'lightgray');
    
    svg.selectAll('.label-family')
      .data(yAxisLevels)
      .join('text')
      .attr('class', isSparse ? 'label-family-sparse' : 'label-family')
      .attr('x', 0)
      .attr('y', d => y(d))
      .attr('alignment-baseline', 'middle')
      .attr('transform', 'translate(0, -10)')
      .text(d => d)
      .call(wrap, isSparse ? 120 : 75);

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
      const data = event.srcElement.__data__;
      Tooltip
        .html(`<strong>${xAxisAttr}</strong>: ${parseFloat(data[xAxisAttr]).toFixed(2)}` + `<br /><strong>${yAxisAttr}</strong>: ${data[yAxisAttr]}`
          + (colorCategory ? `<br /> <strong>${colorCategory}</strong>: ${data[colorCategory]}` : ''))
        .style("left", `${event.x / 4}` + "px")
        .style("top", `${event.y - 48}` + "px")
    };

    const mouseleave = function(event) {
      Tooltip
        .style('opacity', 0)
      d3.select(this)
        .style('stroke', 'none')
        .style('opacity', 0.8)
    };

    // innerToRemove - can't use toRemove because it has a state and won't update here 
    // unless the whole page is rendered again
    let innerToRemove;

    const mouseclick = function (event) {
      if (compareMode !== null) { return; }
      setElementData(event.srcElement.__data__);
      if (innerToRemove) {
        d3.select("#" + innerToRemove).attr("r", radius);
      }
      if (toRemove !== '') {
        d3.select("#" + toRemove).attr("r", radius);
      }
      setToRemove(d3.select(this).attr("id")); // maintain for filter/axis changes
      innerToRemove = d3.select(this).attr("id"); // to use locally
      d3.select(this).attr("r", radius * 2);
    }
          
    const simulation = d3.forceSimulation(data)
      .force('x', d3.forceX((d) => x(+Number(d[xAxisAttr]))).strength(5))
      .force('y', d3.forceY((d) => y(d[yAxisAttr])))
      .force('collide', d3.forceCollide(radius + padding))
      .stop();
    
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => x(Number(d[xAxisAttr])))
      .attr('cy', (d) => y(d[yAxisAttr]))
      .attr('r', radius)
      .attr('fill', (d) => color(d[colorCategory]))
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseleave', mouseleave)
      .on('click', mouseclick);
    
    // assign ids to circles
    svg.selectAll("circle").attr("id", function (d) { return "c" + String(viewId) + String(hashString(d[fileDataAttr])); });
    
    for (let i = 0; i < (data.length / 2); i++) {
      simulation.tick();
    }     

    svg.selectAll('circle')
      .data(data)
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y);

    // ensure that the clicked circle radius remains larger after update
    if (toRemove !== '') {
      d3.select("#" + toRemove).attr("r", radius * 2);
    }

    return svg.node();
  }

  const colorCategoryLevels = filterCategoryLevels.filter(f => f.checked).map(f => f.value);

  return (
    <div className="sm-Overview">
      {shouldShowRemoveView && <IconButton size="medium" className="sm-Overview-close" onClick={() => onRemoveView(viewId)}><CloseOutlined fontSize="inherit" /></IconButton>}
      {!compareMode &&
        <div className="sm-Overview-filterpanel" style={{width: panelWidth}}>
          <h6>&nbsp;Filter Panel</h6>
          <IconButton size="small" className="sm-Overview-filterpanelClose" onClick={() => setPanelWidth(0)}><CloseOutlined fontSize="inherit" /></IconButton>
          <div className="sm-Overview-filters">
            <FormControl variant="standard" sx={{ m: 1, minWidth: 100, maxWidth: 225 }}>
              <InputLabel>X-Axis</InputLabel>
              <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                value={xAxisAttr}
                onChange={({target}) => setXAxis(target.value)}
                label="X-Axis"
              >
                {attributeTypes.quantitative.map(qAttr => <MenuItem key={qAttr} value={qAttr}>{qAttr}</MenuItem>)}
              </Select>
            </FormControl>
            <div className="sm-Overview-rangeChanger">
              <div className="sm-Overview-rangeVal">
                <label>Min</label>
                <Input type="number" value={range.min} placeholder="Min" onChange={setMinValue} />
              </div>
              <div className="sm-Overview-rangeVal">
                <label>Max</label>
                <Input type="number" value={range.max} placeholder="Max" onChange={setMaxValue} />
              </div>
            </div>
            <hr />
            <FormControl variant="standard" sx={{ m: 1, minWidth: 100, maxWidth: 225 }}>
              <InputLabel>Y-Axis</InputLabel>
              <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                value={yAxisAttr}
                onChange={({target}) => setYAxis(target.value)}
                label="Y-Axis"
              >
                {attributeTypes.categorical.map(qAttr => <MenuItem key={qAttr} value={qAttr}>{qAttr}</MenuItem>)}
              </Select>
            </FormControl>
            <FormGroup className="sm-Overview-checkboxes">
              {yAxisLevels.map((level, i) => <FormControlLabel key={i} className="sm-Overview-cbLabel" sx={{height: 15}} size="small" control={<Checkbox size="small" onChange={(event) => setChecked(event, level.value, yAxisLevels, setYAxisLevels)} checked={level.checked} />} label={level.value} />)}
            </FormGroup>
            <hr />
            <FormControl variant="standard" sx={{ m: 1, minWidth: 100, maxWidth: 225 }}>
              <InputLabel>Filter By</InputLabel>
              <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                value={categoryToFilterBy || 'None'}
                onChange={({target}) => setCategoryToFilterBy(target.value)}
                label="Filter By"
              >
                <MenuItem value="">None</MenuItem>
                {attributeTypes.categorical.filter(a => a !== yAxisAttr).map(qAttr => <MenuItem key={qAttr} value={qAttr}>{qAttr}</MenuItem>)}
              </Select>
            </FormControl>
            <FormGroup className="sm-Overview-checkboxes">
              {filterCategoryLevels.map((level, i) => <FormControlLabel key={i} className="sm-Overview-cbLabel" sx={{height: 15}} size="small" control={<Checkbox size="small" onChange={(event) => setChecked(event, level.value, filterCategoryLevels, setFilterCategoryLevels, COLOR_FILTER_LIMIT)} checked={level.checked} />} label={level.value} />)}
            </FormGroup>
          </div>
        </div>
      }
      {!compareMode && <IconButton className="sm-Overview-filter" onClick={() => setPanelWidth(230)}><FilterAltIcon /></IconButton>}
      {(!compareMode || compareMode === 'Overview') &&
        <div id={chartId.replace('#', '')}>
          <h6 className="sm-Overview-heading">OVERVIEW</h6>
          {filterCategoryLevels.length > 0 && 
            <div>
              <span className="sm-Overview-legendLabel">{categoryToFilterBy}</span>
              <div className="sm-Overview-legends" style={{ width }}>
                {filterCategoryLevels.filter(f => f.checked).map((category, index) =>
                  <div key={category.value} className="sm-Overview-legend">
                    <span className="sm-Overview-legendColor" style={{ color: getRecycledColors(colorCategoryLevels.length)[index] }}>&#9679;</span>
                    {category.value}
                  </div>
                )}
              </div>
            </div>
          }
        </div>
      }
      <div className="sm-Overview-rightPane">
        {(!compareMode || compareMode === 'Details') && elementData &&
          <div className="sm-Overview-details">
            <DetailedView data={elementData} xAxisAttr={xAxisAttr} fileDataAttr={fileDataAttr} sampleRateAttr={sampleRateAttr} categoryToFilterBy={categoryToFilterBy} yAxisAttr={yAxisAttr} />
          </div>
        }
        {(!compareMode || compareMode === 'Summary') &&
            <SummaryView attributeTypes={attributeTypes} data={data} colorPalette={COLORS} viewId={viewId}
              filterCategoryLevels={filterCategoryLevels} xAxisAttr={yAxisAttr} xAxisLevels={yAxisLevels} 
              groupAttr={categoryToFilterBy} yAxisAttr={xAxisAttr} filterCategoryLevels={filterCategoryLevels} />
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
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                    .text(word);
      }
    }
  });
}

String.prototype.hashCode = function () {
  let hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
      chr = this.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function hashString(str) {
  const shorter_str = str.slice(0, Math.floor(str.length / 3));
  return shorter_str.hashCode();
}

Overview.propTypes = {
  attributeTypes: PropTypes.shape({
    listical: PropTypes.array,
    categorical: PropTypes.array,
    quantitative: PropTypes.array,
  }),
  data: PropTypes.array,
}

export default Overview;
