const CleanCSS = require('clean-css');
const schemaUtils = require('schema-utils');

const schema = {
    type: 'object',
    properties: {
        // NOTE: Validation of passed clean-css configuration options
        // https://github.com/clean-css/clean-css
    },
};

module.exports = function (inputString) {
    const options = this.getOptions();

    schemaUtils.validate(schema, options);

    const output = new CleanCSS(options).minify(inputString);

    for (const errorMessage of output.errors) {
        this.emitError(new Error(errorMessage));
    }

    for (const warningMessage of output.warnings) {
        this.emitWarning(new Error(warningMessage));
    }

    return output.styles;
}
