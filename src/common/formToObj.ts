export function formToObj<T>(form: HTMLFormElement): T
{
  return Object.fromEntries(new FormData(form).entries()) as T
}
