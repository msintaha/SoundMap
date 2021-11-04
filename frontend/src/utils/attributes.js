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

const COLORS = ['#e6194B', '#f58231', '#ffe119', '#fabed4', '#3cb44b', '#911eb4', '#4363d8', '#aaffc3']

export {
    COLORS,
    getCategoryLevels,
    getRangeWithValues,
};
