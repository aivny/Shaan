import { invoke } from "@tauri-apps/api/tauri";
import { WebviewWindow, appWindow } from '@tauri-apps/api/window'
let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;


async function greet() {
  if (greetMsgEl && greetInputEl) {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    greetMsgEl.textContent = await invoke("greet", {
      name: greetInputEl.value,
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  document.querySelector("#greet-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });

  document.querySelector("#navBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("123");
    const webview = new WebviewWindow('scrollView', {
      url: '/scrollView/scrollView.html',
      fullscreen: true,
    });

    webview.once('tauri://created', function () {
  // webview window successfully created
      webview.show();
      console.log('webview window created');
})
  });

  document.querySelector("#close-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("close");
    appWindow.close();
  });
});
