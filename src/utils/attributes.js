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

export {
    getCategoryLevels,
    getRangeWithValues,
};
