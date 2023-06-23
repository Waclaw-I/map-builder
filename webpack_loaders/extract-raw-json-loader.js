const schemaUtils = require('schema-utils');

const schema = {
    type: 'object',
    properties: {
        minify: {
            type: 'boolean',
        },
        spaces: {
            type: 'number'
        }
    },
};

module.exports = function (inputString) {
    const options = this.getOptions();
    const spaces = options.minify !== true ? options.spaces || 4 : 0;

    schemaUtils.validate(schema, options);

    try {
        return JSON.stringify(JSON.parse(inputString), undefined, spaces);
    } catch (error) {
        this.emitFile(error);
    }
}
