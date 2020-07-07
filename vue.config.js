// vue.config.js
module.exports = {
  configureWebpack: config => {
    config.module.rules.push(
      {
        test: /\.csv$/,
        loader: 'csv-loader',
        options: {
          dynamicTyping: true,
          header: true,
          skipEmptyLines: true
        }
      },
      // https://vue-loader.vuejs.org/guide/pre-processors.html#sass
      // this will apply to both plain `.scss` files
      // AND `<style lang="scss">` blocks in `.vue` files
      // {
      //   test: /\.scss$/,
      //   use: [
      //     'vue-style-loader',
      //     'css-loader',
      //     'sass-loader'
      //   ]
      // }
    )
    if (process.env.NODE_ENV === 'production') {
      // mutate config for production...
    } else {
      // mutate for development...
    }
  }
}
