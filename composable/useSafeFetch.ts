import { useErrorStore } from "~/stores/error-store";
import type { UseFetchOptions } from "#app";

export const useSafeFetch = <T>(
  url: string,
  options: UseFetchOptions<T> = {},
) => {
  const errorStore = useErrorStore();

  // 1. Buat sebuah flag lokal
  let isResponseError = false;

  const result = useFetch(url, {
    ...options,
    // Pantau error dari respons (spt 404, 500)
    onResponseError({ response }) {
      // 2. Jika hook ini berjalan, set flag menjadi true
      isResponseError = true;

      errorStore.addError({
        type: "api",
        title: `API Error (${response.status})`,
        message: response._data?.message || "Failed to fetch data from server.",
        statusCode: response.status,
        details: response._data,
      });
    },
  });

  // Pantau error jaringan (spt tidak ada koneksi)
  watch(result.error, (networkError) => {
    // 3. Gunakan flag untuk memeriksa jenis error
    if (networkError && !isResponseError) {
      // Kode ini sekarang hanya akan berjalan jika onResponseError TIDAK berjalan,
      // yang berarti ini adalah error jaringan murni.
      errorStore.addError({
        type: "network",
        title: "Network Problem",
        message: networkError.message,
        details: networkError,
      });
    }
  });

  return result;
};
