import React from 'react';
import './_index.scss';

function SummaryView({ attributeTypes, data }) {
  const [panelWidth, setPanelWidth] = useState(0);
  const [xAxisAttr, setXAxis] = useState(toCheckboxObject(getCategoryLevels(xAxisAttr, data)));
  const [yAxisAttr, setYAxis] = useState(attributeTypes.ordinal[0]);
  const [colorPalette, setColorPalette] = useState(_.shuffle(COLORS));
  const [filterCategoryLevels, setFilterCategoryLevels] = useState(toCheckboxObject(getCategoryLevels(categoryToFilterBy, data)));
  const margin = {top: 20, right: 95, bottom: 10, left: 100},
      width = 800 - margin.left - margin.right;

  useEffect(() => {
    renderChart(xAxisAttr, filterCategoryLevels, range);
  }, [xAxisAttr, filterCategoryLevels, range]);


  function renderChart(yAxisLevels, filterCategoryLevels, range) {
    const svg = d3.select("#barchart").selectAll('svg');
    if (svg._groups.length > 0) { d3.selectAll("#barchart > svg").remove(); }
    const shuffledColorPalette = _.shuffle(colorPalette);
    setColorPalette(shuffledColorPalette);

    return BarChart(data, {
      x: d => Number(d[xAxisAttr]),
      label: xAxisAttr,
      type: d3.scaleLinear,
      domain: yAxisLevels.filter(y => y.checked).map(y => y.value),
      width,
      radius: 4,
      showScale: 1,
      yLabel: "hello",
      colorCategory: categoryToFilterBy,
      colorCategoryLevels: filterCategoryLevels.filter(f => f.checked).map(f => f.value),
      colorPalette: shuffledColorPalette,
      xDomain: [xRange.min, xRange.max]
    });
  }

  function BarChart(data, {
    value = d => d, // convience alias for x
    label, // convenience alias for xLabel
    type = d3.scaleLinear, // convenience alias for xType
    domain, // convenience alias for xDomain
    x = value, // given d in data, returns the quantitative x value
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

    const svg = d3.select("#barchart")
        .append("svg")
        .attr("width", width)
        .attr("height", height + 10)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    // Define scale for X axis
    var xScale = d3.scaleBand().range ([0, width]).padding(0.4);

    // Define scale for Y axis
    var  yScale = d3.scaleLinear().range ([height, 0]);

    var g = svg.append("g")
               .attr("transform", "translate(" + 100 + "," + 100 + ")");

    // Define values for x axis
    xScale.domain(domain); 
    // Define values for y axis
    yScale.domain([0, d3.max(data, function(d) { return d; })]); 

    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale));

    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(function(d){
        return "$" + d;
      }).ticks(10))
      .append("text")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("value");

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

SummaryView.propTypes = {
  attributeTypes: PropTypes.shape({
    listical: PropTypes.array,
    ordinal: PropTypes.array,
    quantitative: PropTypes.array,
  }),
  data: PropTypes.array,
}

export default SummaryView;
