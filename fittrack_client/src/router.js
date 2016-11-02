import Vue from 'vue'
import VueRouter from 'vue-router'

import Index from './components/Index'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'

import auth from './auth'

Vue.use(VueRouter)

const routes = [
  { path: '/', component: Index },
  { path: '/home', component: Home, meta: { requiresAuth: true } },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/*', component: Index }
]

const router = new VueRouter({
  mode: 'history',
  routes: routes
})

// Need to ensure that we protect auth-dependent endpoints
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    auth.checkAuth().then((res) => {
      console.log('**** router check auth success')
      next()
    }, (res) => {
      console.log('**** router check auth failure')
      // Failed auth
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    })
  } else {
    next() // make sure to always call next()!
  }
})

export default router