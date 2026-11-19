import axios from 'axios';

const GEOREF_API_URL = 'https://apis.datos.gob.ar/georef/api';

export interface GeoRefOption {
  id: string;
  nombre: string;
}

interface GeoRefListResponse<T> {
  provincias?: T[];
  localidades?: T[];
}

export const getProvincias = async (signal?: AbortSignal): Promise<GeoRefOption[]> => {
  const response = await axios.get<GeoRefListResponse<GeoRefOption>>(
    `${GEOREF_API_URL}/provincias`,
    {
      params: { campos: 'id,nombre', orden: 'nombre' },
      signal,
    },
  );

  return response.data.provincias ?? [];
};

export const getLocalidadesByProvincia = async (
  provinciaId: string,
  signal?: AbortSignal,
): Promise<GeoRefOption[]> => {
  const response = await axios.get<GeoRefListResponse<GeoRefOption>>(
    `${GEOREF_API_URL}/localidades`,
    {
      params: {
        provincia: provinciaId,
        campos: 'id,nombre',
        max: 1000,
        orden: 'nombre',
      },
      signal,
    },
  );

  return response.data.localidades ?? [];
};
