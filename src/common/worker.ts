export interface WorkerMessage<T = unknown> {
  id: string;
  data: T;
  type: 'execute' | 'result' | 'error';
}

export interface WorkerOptions {
  timeout?: number;
  keepAlive?: boolean;
}

export type WorkerJob<TInput = unknown> = (
  event: MessageEvent<WorkerMessage<TInput>>
) => void | Promise<void>;

/**
 * @param {WorkerJob} job - Function
 * @param {WorkerOptions} options - Options
 *
 * @example
 * const computeHeavyTask = workerInit((e: MessageEvent) => {
 *   const data = e.data.data
 *   // Heavy calculations...
 *   self.postMessage({ data: result })
 * })
 *
 * const result = await computeHeavyTask({ numbers: [1,2,3] })
 */
export function workerInit<TInput = unknown, TResult = unknown>(
  job: WorkerJob<TInput>,
  options: WorkerOptions = {}
): (input: TInput) => Promise<TResult> {

  const { timeout = 30000, keepAlive = false } = options
  const workers = new Map<string, Worker>()

  const code = `self.onmessage = ${job.toString()};`
  const blob = new Blob([code], { type: 'application/javascript' })
  const workerUrl = URL.createObjectURL(blob)

  let idCounter = 0

  return async (input: TInput): Promise<TResult> => {
    const id = (++idCounter).toString()

    return new Promise((resolve, reject) => {
      let worker = workers.get(id)

      if (!worker) {
        worker = new Worker(workerUrl, { type: 'module' })
        workers.set(id, worker)

        worker.onerror = (error) => {
          cleanup()
          reject(error.error)
        }
      }

      const timeoutId = setTimeout(() => {
        cleanup()
        reject(new Error(`Worker timeout: ${timeout}ms`))
      }, timeout)

      const cleanup = () => {
        clearTimeout(timeoutId)

        if (!keepAlive) {
          workers.delete(id)
          worker?.terminate()
        }
      }

      worker.onmessage = (event: MessageEvent<WorkerMessage<TResult>>) => {
        if (event.data.id === id) {
          cleanup()

          if (event.data.type === 'error') {
            reject(new Error(event.data.data as string))
          } else {
            resolve(event.data.data as TResult)
          }
        }
      }

      worker.postMessage({ id, data: input, type: 'execute' })
    })
  }
}
