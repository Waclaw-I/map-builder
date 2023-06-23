import { NetworkFirst, NetworkOnly, CacheFirst } from 'workbox-strategies';
import { registerRoute, NavigationRoute, Route } from 'workbox-routing';
import { ExpirationPlugin } from 'workbox-expiration';

self.__WB_DISABLE_DEV_LOGS = true;

const navigationRoute = new NavigationRoute(new NetworkFirst({
    cacheName: 'navigations',
    networkTimeoutSeconds: 3,
}));

const serviceWorkerRoute = new Route(({url}) => url.pathname === '/service-worker.js', new NetworkOnly());

const assetsRoute = new Route(({url}) => url.pathname !== '/service-worker.js', new CacheFirst({
    cacheName: 'assets',
    plugins: [
        new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 5 * 24 * 60 * 60,
        }),
    ],
}));

registerRoute(navigationRoute);
registerRoute(serviceWorkerRoute);
registerRoute(assetsRoute);
