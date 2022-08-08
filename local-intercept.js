/* eslint-disable */
/**
 * Custom interceptors for the project.
 *
 * This project has a section in its package.json:
 *    "pwa-studio": {
 *        "targets": {
 *            "intercept": "./local-intercept.js"
 *        }
 *    }
 *
 * This instructs Buildpack to invoke this file during the intercept phase,
 * as the very last intercept to run.
 *
 * A project can intercept targets from any of its dependencies. In a project
 * with many customizations, this function would tap those targets and add
 * or modify functionality from its dependencies.
 */

const moduleOverrideWebpackPlugin = require('./src/webpack/moduleOverrideWebpackPlugin');
const componentOverrideMapping = require('./src/webpack/componentOverrideMapping')

function localIntercept(targets) {
    const { Targetables } = require('@magento/pwa-buildpack');
    const targetables = Targetables.using(targets);

    // Include our webpack plugin for overiding
    targets.of('@magento/pwa-buildpack').webpackCompiler.tap(compiler => {
        new moduleOverrideWebpackPlugin(componentOverrideMapping).apply(compiler);
    })

    // 1. load the 'ProductFullDetail' component to be adjusted
    const ProductFullDetailComponent = targetables.reactComponent(
        '@magento/venia-ui/lib/components/ProductFullDetail/productFullDetail.js'
    );
    // 2. import the component that helps rendering CMS Blocks
    const CmsBlockGroup = ProductFullDetailComponent.addImport(
        "CmsBlockGroup from '@magento/venia-ui/lib/components/CmsBlock'"
    );
    // 3. render the CMS Block right after the Product's <Form /> component.
    ProductFullDetailComponent.insertAfterJSX(
        '<Form/>',
        `<${CmsBlockGroup} identifiers={['contact-us-info']} />`
    );

}

module.exports = localIntercept;
