self.addEventListener("install", (event) => {
  console.log("Service worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service worker activated");
});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : { title: "Reminder", body: "Time up" };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
    })
  );
});
