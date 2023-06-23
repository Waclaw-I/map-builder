const path = require('path');
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = webpackEnvVars => {

    const environment = webpackEnvVars.env || 'dev';
    const publicPath = webpackEnvVars.publicPath || '/';
    const devServerMode = webpackEnvVars.https ? 'https' : 'http';

    const devEnvs = ['development', 'dev'];
    const prodEnvs = ['production', 'prod'];

    const envVars = {
        'process.env.NODE_ENV': environment,
    }

    const preserveAssetsStructure = (resourcePath) => {
        let appendix = 'assets/';
        let pathElements = resourcePath.split('\\');
        if (pathElements.length === 1) {
            pathElements = resourcePath.split('/');
        }
        if (pathElements.includes('manifest.json')) {
            appendix = '';
        }
        if (pathElements.includes('assets')) {
            pathElements = pathElements.slice(pathElements.indexOf('assets'), -1);
            appendix = [...pathElements, undefined].join('/');
        }
        return `${appendix}[name].[contenthash].[ext]`;
    };

    const preconfiguredFileLoader = {
        loader: 'file-loader',
        options: {
            publicPath,
            name(resourcePath, resourceQuery) {
                return preserveAssetsStructure(resourcePath);
            },
        },
    };

    let devtool;
    let devServer = webpackEnvVars.devServer;
    let mode;
    let minify = false;

    if (devEnvs.includes(environment)) {
        mode = 'development';
        devtool = 'inline-source-map';
    } else if (prodEnvs.includes(environment)) {
        mode = 'production';
        minify = true;
    }

    if (devServer) {
        devServer = {
            host: '0.0.0.0',
            hot: false,
            liveReload: true,
            port: 8000,
            server: devServerMode,
            client: {
                overlay: {
                    errors: true,
                    warnings: false,
                },
            },
            devMiddleware: {
                writeToDisk: true,
            },
            static: {
                directory: path.join(__dirname, 'dist'),
            },
        };
    }

    console.log(`Webpack mode: ${mode}\n Environment: ${environment}`);

    return {
        mode,
        devtool,
        devServer,
        entry: {
            'service-worker': './src/service-worker.js',
            'game': './src/ts/game.ts',
        },
        output: {
            filename: ({ runtime }) => {
                if (runtime === 'service-worker') {
                    return '[name].js';
                }
                return '[name].[contenthash].js';
            },
            path: path.resolve(__dirname, 'dist'),
        },
        watchOptions: {
            ignored: '**/node_modules',
        },
        module: {
            rules: [
                {
                    test: /\.html$/,
                    type: 'javascript/auto',
                    use: [
                        {
                            loader: 'html-loader',
                            options: {
                                esModule: false,
                            },
                        },
                    ],
                },
                {
                    test: /\.atlas$/i,
                    type: 'javascript/auto',
                    use: [
                        preconfiguredFileLoader,
                        {
                            loader: path.resolve('./webpack_loaders/extract-atlas-asset-loader.js'),
                            options: {
                                detectAssets: ['png', 'svg', 'woff2', 'jpg', 'jpeg', 'gif'],
                            },
                        },
                    ],
                },
                {
                    test: /\.css$/i,
                    type: 'javascript/auto',
                    use: [
                        preconfiguredFileLoader,
                        {
                            loader: path.resolve('./webpack_loaders/clean-css-loader.js'),
                        },
                        {
                            loader: path.resolve('./webpack_loaders/extract-assets-loader.js'),
                            options: {
                                detectAssets: ['png', 'svg', 'woff2', 'jpg', 'jpeg', 'gif'],
                            },
                        },
                    ],
                },
                {
                    test: /\.(gif|png|jpe?g|svg|webp)$/i,
                    type: 'javascript/auto',
                    use: [
                        preconfiguredFileLoader,
                        {
                            loader: 'image-webpack-loader',
                            options: {
                                disable: !minify,
                            },
                        },
                    ],
                },
                {
                    test: /\.fnt$/,
                    type: 'javascript/auto',
                    use: [
                        preconfiguredFileLoader,
                        {
                            loader: 'extract-loader',
                        },
                        {
                            loader: 'xml-minify-loader',
                        }
                    ],
                },
                {
                    test: /\.(m4a|mp3|wav|woff2)$/,
                    type: 'javascript/auto',
                    use: [
                        preconfiguredFileLoader,
                    ],
                },
                {
                    test: /\.json$/,
                    type: 'javascript/auto',
                    use: ({ issuer, dependency }) => {
                        if (issuer.endsWith('.ts') && dependency === 'esm') {
                            return {
                                loader: 'json5-loader',
                            };
                        }

                        return [
                            preconfiguredFileLoader,
                            {
                                loader: path.resolve('./webpack_loaders/extract-raw-json-loader.js'),
                                options: { minify },
                            },
                            {
                                loader: path.resolve('./webpack_loaders/extract-assets-loader.js'),
                                options: {
                                    detectAssets: ['atlas', 'fnt', 'm4a', 'mp3', 'wav', 'json', 'png', 'svg', 'css', 'woff2', 'jpg', 'jpeg', 'gif'],
                                },
                            },
                        ];
                    },
                },
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: 'ts-loader',
                        },
                        {
                            loader: path.resolve('./webpack_loaders/extract-assets-loader.js'),
                            options: {
                                detectAssets: ['atlas', 'fnt', 'm4a', 'mp3', 'wav', 'json', 'png', 'svg', 'css', 'woff2', 'jpg', 'jpeg', 'gif'],
                            },
                        },
                    ]
                },
            ],
        },
        resolve: {
            extensions: ['.ts', '.js'],
            alias: {
                configs: path.resolve(__dirname, 'src', 'configs', environment),
            },
        },
        plugins: [
            new CleanWebpackPlugin({
                cleanAfterEveryBuildPatterns: [ '!assets/**' ],
            }),
            new NodePolyfillPlugin(),
            new webpack.DefinePlugin({
                'typeof PLUGIN_FBINSTANT': JSON.stringify(false),
            }),
            new webpack.EnvironmentPlugin(envVars),
            new HtmlWebpackPlugin({
                publicPath,
                template: './src/index.html',
                inject: 'body',
                minify: minify && {
                    collapseWhitespace: true,
                    html5: true,
                    minifyCSS: true,
                    minifyJS: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    useShortDoctype: true,
                },
            }),
        ],
    };
};
