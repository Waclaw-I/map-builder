const fs = require('fs');
const path = require('path');
const schemaUtils = require('schema-utils');

const schema = {
    type: 'object',
    properties: {
        detectAssets: {
            type: 'array',
            items: {
                type: 'string',
                minLength: 3
            }
        }
    },
};

module.exports = async function (inputString) {
    const callback = this.async();
    const compilation = this._compilation;
    const options = this.getOptions();
    const promises = [];
    const matches = {};

    schemaUtils.validate(schema, options);

    const detectAssetsByExtensions = (options.detectAssets || []).map(x => x.replace('.', ''));

    if (!detectAssetsByExtensions.length) {
        this.emitWarning(
            new Error(`Error while parsing extract-assets-loader options.detectAssets: [${detectAssetsByExtensions}]`)
        );
        return inputString
    }

    const findRegExp = new RegExp(
        `("|')(\.?\.\/)*([a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+[.](${detectAssetsByExtensions.join('|')})("|')`,
        'gi',
    );

    for (const match of inputString.matchAll(findRegExp)) {
        const filePath = path.join(this.context, match[0].replaceAll('\'', '').replaceAll('"', ''));

        if (matches[match[0]]) {
            continue;
        }

        try {
            if (!fs.existsSync(filePath)) {
                matches[match[0]] = undefined;
                continue;
            }

            const matchForExclusion = match[0].replaceAll('.', '\\.').replaceAll('/', '\\/');
            const excludeRegExp = new RegExp(`import.+${matchForExclusion}`, 'g');
            if (excludeRegExp.test(inputString)) {
                matches[match[0]] = undefined;
                continue;
            }

            promises.push(new Promise((resolve, reject) => {
                this.addDependency(filePath);
                this.loadModule(filePath, (err, source, sourceMap, module) => {
                    if (err) {
                        this.emitError(err);
                        reject(err);
                        return;
                    }
                    compilation.addModule(module, (err, module) => {
                        if (err) {
                            this.emitError(err);
                            reject(err);
                            return;
                        }
                        resolve(module._source._value.split('"')[1]);
                    });
                });
            }).then(result => matches[match[0]] = `"${result}"`));
        } catch (err) {
            this.emitError(err);
        }
    }

    await Promise.all(promises);

    for (const [ src, dest ] of Object.entries(matches)) {
        if (dest === undefined) {
            continue;
        }
        inputString = inputString.replaceAll(src, dest);
    }

    callback(null, inputString);
}
