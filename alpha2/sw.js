importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');
workbox.setConfig({debug: false})

workbox.routing.registerRoute(
  /\//,
  new workbox.strategies.StaleWhileRevalidate(),
);
