import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import * as d3 from 'd3';

function Overview({ data }) {
    useEffect(() => {
      const margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 460 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;
    
      // append the svg object to the body of the page
      const svg = d3.select("#overview")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      //Read the data
      console.log(data);
      // Add X axis
      const x = d3.scaleLinear()
        .domain([0, 4000])
        .range([ 0, width ]);
      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

      // Add Y axis
      const y = d3.scaleOrdinal()
        .domain([0, 500000])
        .range([ height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));

      // Add dots
      svg.append('g')
      .selectAll("dot")
      .data(data)
      .join("circle")
          .attr("cx", function (d) { console.log(d); return x(d.Sex); } )
          .attr("cy", function (d) { return y(d.Breed); } )
          .attr("r", 2)
          .style("fill", "#0065FF")
    }, []);

  return (
    <div className="sm-Overview">
      <div id="overview"></div>
    </div>
  );
}

export default Overview;
