const path = require('path')
const webpack= require('webpack')
module.exports = {
    entry: [
        "./src/index.ts"
    ],
    output: {
        path: path.join(__dirname, './dist/'),
        filename: 'bootHeadless.js',
        publicPath: './',
    },
    devtool: false,
    resolve: {extensions: ['.js', '.jsx', '.ts', '.tsx']},
    plugins: [
        new webpack.WatchIgnorePlugin([
          /\.d\.ts$/
        ])
      ],
    module: {
        rules: [{
                test: /\.css$/,
                use: [{
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader"
                    }
                ]
            },
            {
                test: /\.ts|\.tsx$/,
                loader: "ts-loader",
            },
            {
                test: /sw.(j|t)s$/,
                use: [{
                    loader: 'file-loader',
                }]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                      outputPath: './',
                    },
                  }]
            },
            { test: /\.(woff|woff2|eot|ttf|svg)$/, use: ['url-loader?limit=100000'] },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ],
    },
};