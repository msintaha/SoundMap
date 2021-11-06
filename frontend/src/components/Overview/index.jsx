import React, { useEffect, useState, useHasChanged } from 'react';
import PropTypes from 'prop-types';

import * as d3 from 'd3';
import _ from 'lodash';

import { COLORS, getCategoryLevels, getRangeWithValues } from '../../utils/attributes';
import { Checkbox, FormControl, FormControlLabel, FormGroup, IconButton, InputLabel, Select, MenuItem, Input } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseOutlined from '@mui/icons-material/CloseOutlined';


function Overview({ attributeTypes, data }) {
  const [panelWidth, setPanelWidth] = useState(0);
  const [xAxisAttr, setXAxis] = useState(attributeTypes.quantitative[1]);
  const [yAxisAttr, setYAxis] = useState(attributeTypes.ordinal[0]);
  const [range, setRange] = useState(getRangeWithValues(xAxisAttr, data))
  const [colorPalette, setColorPalette] = useState(_.shuffle(COLORS));
  const [yAxisLevels, setYAxisLevels] = useState(toCheckboxObject(getCategoryLevels(yAxisAttr, data)));
  const [categoryToFilterBy, setCategoryToFilterBy] = useState(attributeTypes.ordinal[1]);
  const [filterCategoryLevels, setFilterCategoryLevels] = useState(toCheckboxObject(getCategoryLevels(categoryToFilterBy, data)));
  const margin = {top: 20, right: 95, bottom: 10, left: 100},
      width = 800 - margin.left - margin.right;

  useEffect(() => {
    const newYAxisLvl = toCheckboxObject(getCategoryLevels(yAxisAttr, data));
    const newFilterCategoryLvl = toCheckboxObject(getCategoryLevels(categoryToFilterBy, data));
    setYAxisLevels(newYAxisLvl);
    setFilterCategoryLevels(newFilterCategoryLvl);
    renderChart(newYAxisLvl, newFilterCategoryLvl, range);
  }, [yAxisAttr, categoryToFilterBy]);

  useEffect(() => {
    const newRange = getRangeWithValues(xAxisAttr, data);
    setRange(newRange);
    renderChart(yAxisLevels, filterCategoryLevels, newRange);
  }, [xAxisAttr]);

  useEffect(() => {
    renderChart(yAxisLevels, filterCategoryLevels, range);
  }, [yAxisLevels, filterCategoryLevels, range]);

  function renderChart(yAxisLevels, filterCategoryLevels, range) {
    const lastIndex = yAxisLevels.length - 1;
    const svg = d3.select("#beeswarm").selectAll('svg');
    if (svg._groups.length > 0) { d3.selectAll("#beeswarm > svg").remove(); }
    const shuffledColorPalette = _.shuffle(colorPalette);
    setColorPalette(shuffledColorPalette);

    yAxisLevels.filter(y => y.checked).map(y => y.value).forEach((yAxisLabel, index) => {
      BeeswarmChart(data.filter(d => d[yAxisAttr] === yAxisLabel), {
        x: d => Number(d[xAxisAttr]),
        label: xAxisAttr,
        type: d3.scaleLinear,
        width,
        radius: 3,
        showScale: index === lastIndex,
        yLabel: yAxisLabel,
        colorCategory: categoryToFilterBy,
        colorCategoryLevels: filterCategoryLevels.filter(f => f.checked).map(f => f.value),
        colorPalette: shuffledColorPalette,
        xDomain: [range.min, range.max]
      })
    });
  }

  function setChecked(event, value, data, setFn) {
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
    marginBottom = 5, // bottom margin, in pixels
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
    marginBottom = showScale ? 20 : marginBottom;
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
    if (height === undefined) height = d3.max(Y) + (radius + padding) * 2 + marginTop + marginBottom;
  
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
        .style("top", `${event.pageY - 48}` + "px")
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
        .range(_.clone(colorPalette).slice(0, colorCategoryLevels.length));
    }

    svg.append("g")
      .selectAll("circle")
      .attr("class", "values")
      .data(I)
      .join("circle")
      .attr("cx", i => xScale(X[i]))
      .attr("cy", i => height - marginBottom - radius - padding - Y[i])
      .attr("r", radius)
      .style("fill", colorCategory ? d => color(data[d][colorCategory]) : "#0065FF")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

    return svg.node();
  }

  return (
    <div className="sm-Overview">
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
              {attributeTypes.ordinal.map(qAttr => <MenuItem key={qAttr} value={qAttr}>{qAttr}</MenuItem>)}
            </Select>
          </FormControl>
          <FormGroup className="sm-Overview-checkboxes">
            {yAxisLevels.map(level => <FormControlLabel sx={{height: 15}} size="small" control={<Checkbox size="small" onChange={(event) => setChecked(event, level.value, yAxisLevels, setYAxisLevels)} checked={level.checked} />} label={level.value} />)}
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
              {attributeTypes.ordinal.filter(a => a !== yAxisAttr).map(qAttr => <MenuItem key={qAttr} value={qAttr}>{qAttr}</MenuItem>)}
            </Select>
          </FormControl>
          <FormGroup className="sm-Overview-checkboxes">
            {filterCategoryLevels.map(level => <FormControlLabel sx={{height: 15}} size="small" control={<Checkbox size="small" onChange={(event) => setChecked(event, level.value, filterCategoryLevels, setFilterCategoryLevels)} checked={level.checked} />} label={level.value} />)}
          </FormGroup>
        </div>
      </div>
      <IconButton className="sm-Overview-filter" onClick={() => setPanelWidth(230)}><FilterAltIcon /></IconButton>
      <div id="beeswarm">
        {categoryToFilterBy && 
          <div className="sm-Overview-legends" style={{ width }}>
            {filterCategoryLevels.filter(f => f.checked).map((category, index) =>
              <div key={category.value} className="sm-Overview-legend">
                <span className="sm-Overview-legendColor" style={{ color: colorPalette[index] }}>&#9679;</span>
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

Overview.propTypes = {
  attributeTypes: PropTypes.shape({
    listical: PropTypes.array,
    ordinal: PropTypes.array,
    quantitative: PropTypes.array,
  }),
  data: PropTypes.array,
}

export default Overview;
