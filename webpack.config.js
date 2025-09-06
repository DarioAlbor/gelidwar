const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
require('dotenv').config();

module.exports = {
    context: path.resolve(__dirname, 'src'),
    entry: './game.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        configFile: path.resolve(__dirname, 'src/tsconfig.json')
                    }
                },
                exclude: [
                    /node_modules/,
                    /server/,
                    path.resolve(__dirname, 'server')
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'src/index.html'),
            filename: 'index.html',
        }),
        new webpack.DefinePlugin({
            'window.VITE_BACKEND_URL': JSON.stringify(process.env.VITE_BACKEND_URL || 'http://localhost:3000'),
            'window.VITE_FRONTEND_URL': JSON.stringify(process.env.VITE_FRONTEND_URL || 'http://localhost:8080'),
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 8080,
        hot: true,
        liveReload: true,
        open: true,
        watchFiles: ['src/**/*'],
        client: {
            overlay: {
                errors: true,
                warnings: false,
            },
        },
    },
    mode: 'development',
    devtool: 'source-map',
    watch: true,
    watchOptions: {
        ignored: /node_modules|server/,
        aggregateTimeout: 300,
        poll: 1000,
    },
};