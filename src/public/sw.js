// @ts-ignore: worker

// Only work outside of localhost
if(self.location.hostname !== 'localhost'){

  importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');
  workbox.setConfig({debug: true})

  workbox.routing.registerRoute(
    /\/assets/,
    new workbox.strategies.CacheFirst(),
  );

  workbox.routing.registerRoute(
    /\/pwa/,
    new workbox.strategies.CacheFirst(),
  );

  workbox.routing.registerRoute(
    /\//,
    new workbox.strategies.StaleWhileRevalidate(),
  );

}
