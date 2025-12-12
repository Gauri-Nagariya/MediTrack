import axios from "axios";
export async function subscribeUser() {
  const reg = await navigator.serviceWorker.ready

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
  })

  const token = localStorage.getItem("token")

  await fetch("http://localhost:5000/api/reminders/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(subscription)
  })
}
