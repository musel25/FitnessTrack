// Hook reutilizável pra rodar uma função async e expor { data, loading, error, reload }.
//
// Vindo de Python: pense num hook como uma função que "engancha" estado a um componente.
// Pra cada componente que chama useAsync(...), o React mantém um estado dedicado.
//
// `useEffect` é o "decorator de side-effect": roda depois do render. Aqui pra disparar
// o fetch quando deps mudam. `useState` é uma variável de estado: quando muda, re-renderiza.

import { useCallback, useEffect, useRef, useState } from "react";

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  reload: () => void;
  setData: (v: T | null) => void;
};

export function useAsync<T>(
  fn: () => Promise<T>,
  deps: ReadonlyArray<unknown> = []
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // Counter pra forçar re-execução em `reload()`.
  const [tick, setTick] = useState(0);
  // Pra evitar setState após unmount (warning do React).
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fn()
      .then((res) => {
        if (mounted.current) setData(res);
      })
      .catch((e: Error) => {
        if (mounted.current) setError(e);
      })
      .finally(() => {
        if (mounted.current) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { data, loading, error, reload, setData };
}
