'use client';

import { useMemo, useState } from 'react';
import {
  SPB_DISTRICTS,
  SPB_LOCATIONS,
  SPB_METRO_STATIONS,
  type SpbDistrict
} from '@/lib/spb-locations';

type LocationSelectsProps = {
  defaultDistrict?: string | null;
  defaultMetroStation?: string | null;
  districtRequired?: boolean;
  metroRequired?: boolean;
};

export function LocationSelects({
  defaultDistrict = '',
  defaultMetroStation = '',
  districtRequired = false,
  metroRequired = false
}: LocationSelectsProps) {
  const [district, setDistrict] = useState(
    defaultDistrict || ''
  );

  const metroStations = useMemo(() => {
    if (
      district &&
      district in SPB_LOCATIONS
    ) {
      const stations =
        SPB_LOCATIONS[district as SpbDistrict];

      if (stations.length > 0) {
        return [...stations];
      }
    }

    return SPB_METRO_STATIONS;
  }, [district]);

  return (
    <>
      <label>
        <span className="label">Район Санкт-Петербурга</span>

        <select
          className="input"
          name="district"
          value={district}
          required={districtRequired}
          onChange={(event) => {
            setDistrict(event.target.value);
          }}
        >
          <option value="">Выберите район</option>

          {SPB_DISTRICTS.map((districtName) => (
            <option
              key={districtName}
              value={districtName}
            >
              {districtName}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="label">Ближайшее метро</span>

        <select
          className="input"
          name="metro_station"
          defaultValue={defaultMetroStation || ''}
          required={metroRequired}
        >
          <option value="">Выберите станцию метро</option>

          {metroStations.map((station) => (
            <option key={station} value={station}>
              {station}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
