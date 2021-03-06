/*
* @Author: leo
* @Date: 2017-12-09 21:50:00
* @Last Modified by: leo
* @Last Modified time: 2017-12-09 21:50:00
* @introduction 客户端 entry 只需创建应用程序，并且将其挂载到 DOM 中
*/

import 'es6-promise/auto'
import { app, router, store } from './app';

// prime the store with server-initialized state.
// the state is determined during SSR and inlined in the page markup.
if (window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__)
}

// 在路由导航之前解析数据
router.onReady(() => {
    // 添加路由钩子函数，用于处理 asyncData.
    // 在初始路由 resolve 后执行，
    // 以便我们不会二次预取(double-fetch)已有的数据。
    // 使用 `router.beforeResolve()`，以便确保所有异步组件都 resolve。
    router.beforeResolve((to, from, next) => {
        const matched = router.getMatchedComponents(to)
        const prevMatched = router.getMatchedComponents(from)
        // 我们只关心之前没有渲染的组件
        // 所以我们对比它们，找出两个匹配列表的差异组件
        let diffed = false
        const activated = matched.filter((c, i) => {
            return diffed || (diffed = (prevMatched[i] !== c))
        })
        // const asyncDataHooks = activated.map(c => c.asyncData).filter(_ => _)
        if (!activated.length) {
            return next()
        }
        // 这里如果有加载指示器(loading indicator)，就触发
        Promise.all(activated.map(c => {
            if (c.asyncData) {
                return c.asyncData({ store, route: to })
            }
            })).then(() => {
            // stop loading indicator
            next()
        }).catch(next)
    })
    // actually mount to DOM
    app.$mount('#app');
})