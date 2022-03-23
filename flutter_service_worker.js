'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "a7594afa077a0024cccdac58a7405830",
"assets/assets/icons/favorite_rate_star_icon.svg": "4c747222bd881efbed6297daaee2f6db",
"assets/assets/icons/github.svg": "d565dcd48f59718c77c10501df9909f3",
"assets/assets/icons/gmail.svg": "23a7dee5995afbb2f9ad3b32799c6f82",
"assets/assets/icons/half_star_icon.svg": "669252f08f30748b8bd4016b44b6359b",
"assets/assets/icons/linkedin.svg": "8adf3e02919d42d882f8be2584bce242",
"assets/assets/icons/menu.svg": "ce1e633ccc7861cbf001048edb7f85a9",
"assets/assets/icons/rate_star_icon.svg": "fbd3b7fef0e24975d3a327fb0a364f65",
"assets/assets/icons/twitter.svg": "abfbd4d99d3eb68a202695654eeccf9c",
"assets/assets/images/asp.webp": "9c594dcfec51977eb43853a8347c6c5e",
"assets/assets/images/banco.webp": "d21c4076eb5e62a8a872d3a8fc7767ca",
"assets/assets/images/bootstrap.webp": "bc18ec46a93dcd4a2426651d1e956b7f",
"assets/assets/images/club.webp": "c9890a51841823b2a308ada07280fa17",
"assets/assets/images/css.webp": "806a6ec4587755e0a61c3e8d6578ed01",
"assets/assets/images/flutter.webp": "f2925cbd9a3aac91b1157bc74e9dada0",
"assets/assets/images/gastos.webp": "146900299c5e41791c39a8d4e9db837d",
"assets/assets/images/git.webp": "7314e311d251caa3457a1619eda7c24e",
"assets/assets/images/html.webp": "3294b3ef989e4aa9b3a7d0d1c69e8146",
"assets/assets/images/js.webp": "13ca72e8c2432c70c1e136ac9a530549",
"assets/assets/images/jsp.webp": "8e622b971e92736da4f607a616d7d7ed",
"assets/assets/images/mysql.webp": "0bd3bf3c9fd3b6509f2a1e670d170d15",
"assets/assets/images/sqlserver.webp": "35886b3131db6c736809ed2972ccd22d",
"assets/assets/images/uni.webp": "e869c5e395e8f8d1bc0c4ff0e581db5f",
"assets/assets/images/yo1.webp": "76298d2175bd1765dad612af4363f702",
"assets/FontManifest.json": "d751713988987e9331980363e24189ce",
"assets/NOTICES": "f3d7433d1ce2f3f2af34e90f04a48b35",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"index.html": "f43efadfa566514b0c11ed34a23550a1",
"/": "f43efadfa566514b0c11ed34a23550a1",
"main.dart.js": "ac07ae3e0b9e727048fa9c778904a37f",
"manifest.json": "e74af8957b5899dc6da961caee768ec9",
"version.json": "009c9e65172e010890f7f65fde438006"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
