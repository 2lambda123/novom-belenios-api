import psTree from 'ps-tree'; // eslint-disable-line import/no-extraneous-dependencies

/**
 * Code adapted from http://krasimirtsonev.com/blog/article/Nodejs-managing-child-processes-starting-stopping-exec-spawn
 */

export default async function killProcess(childProcess) {
  const { pid } = childProcess;
  const signal = 'SIGKILL';
  return new Promise((resolve, reject) => {
    psTree(pid, (psTreeErr, children) => {
      if (psTreeErr) {
        reject(psTreeErr);
      }
      [pid, ...children.map((p) => p.PID)]
        .forEach((tpid) => {
          try {
            process.kill(tpid, signal);
          } catch (killErr) {
            reject(killErr);
          }
        });
      resolve();
    });
  });
}
