// danmuWorker.js
self.addEventListener('message', function(e) {
    const interval = e.data; // 从主线程接收间隔时间
    setInterval(() => {
        postMessage(''); // 定期向主线程发送消息
    }, interval);
});