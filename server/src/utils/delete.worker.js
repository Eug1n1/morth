const { unlink } = require("fs");
const { workerData, parentPort } = require("worker_threads");

(() => {
    unlink(workerData.path, (err) => {
        if (err) {
            parentPort.postMessage({
                success: false,
                error: err,
            });
        }

        parentPort.postMessage({
            success: true,
        });
    });
})();
