import _ from "lodash";

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
    return arr.map((a, idx) => ({ value: a, checked: limit ? !!(idx < limit) : true }));
}

export {
    COLORS,
    COLOR_FILTER_LIMIT,
    getCategoryLevels,
    getRangeWithValues,
    toCheckboxObject,
};
