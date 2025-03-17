import fetch from 'node-fetch';
import { config } from '../../config';

export interface Ip2LocationResult {
  ip: string;
  country_code: string;
  country_name: string;
  region_name: string;
  city_name: string;
  latitude: number;
  longitude: number;
  zip_code: string;
  time_zone: string;
  asn: string;
  as: string;
  is_proxy: boolean;
}

export interface GetLocationResultSuccess {
  lat: number;
  lon: number;
  error: null;
  success: true;
}

export interface GetLocationResultFail {
  lat: null;
  lon: null;
  error: any;
  success: false;
}

export type GetLocationResult =
  | GetLocationResultSuccess
  | GetLocationResultFail;

export async function getLocation(ip: string): Promise<GetLocationResult> {
  try {
    const response = await fetch(
      `https://api.ip2location.io/?key=${config.ip2LocationApiKey}&ip=${ip}`
    );
    const result: Ip2LocationResult = await response.json();

    return {
      lat: result.latitude,
      lon: result.longitude,
      error: null,
      success: true,
    };
  } catch (error) {
    return { error, lat: null, lon: null, success: false };
  }
}
