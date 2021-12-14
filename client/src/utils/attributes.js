import _ from "lodash";
import * as d3 from 'd3';

function getCategoryLevels(attributeName, data) {
    const categoryLevel = new Set();
    data.forEach(d => {
        if (d.hasOwnProperty(attributeName)) {
            categoryLevel.add(d[attributeName]);
        }
    });
    return Array.from(categoryLevel).sort((a, b) => a.localeCompare(b));
}

function getRangeWithValues(attributeName, data) {
    const values = data.map(d => Number(d[attributeName]));
    return { min: _.min(values), max: _.max(values), values };
}

const COLORS = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
const COLOR_FILTER_LIMIT = 6;

function toCheckboxObject(arr, limit = null) {
    return arr.map((a, idx) => ({ value: a, checked: true }));
}

function getRecycledColors(limit) {
    if (limit <= COLORS.length) {
      return COLORS.slice(0, limit);
    }
    let newColors = _.clone(COLORS);
    while (true) {
      newColors = newColors.concat(COLORS);
      if (limit <= newColors.length) {
        return newColors.slice(0, limit);
      }
    }
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

export {
    COLORS,
    COLOR_FILTER_LIMIT,
    getCategoryLevels,
    getRangeWithValues,
    getRecycledColors,
    toCheckboxObject,
	wrap,
};
