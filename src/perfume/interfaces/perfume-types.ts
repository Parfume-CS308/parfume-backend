import { PerfumeTypeEnum } from '../../enums/entity.enums';

export interface PerfumeVariant {
  volume: number;
  basePrice: number;
  price: number;
  stock: number;
}

export interface PerfumeDistributor {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

export interface PerfumeCategory {
  id: string;
  name: string;
  description: string;
}

export interface AllPerfumeItem {
  id: string;
  name: string;
  brand: string;
  notes: string[];
  type: PerfumeTypeEnum;
  assetUrl: string;
  season: string;
  sillage: string;
  longevity: string;
  gender: string;
  description: string;
  serialNumber: number;
  warrantyStatus: number;
  distributor: PerfumeDistributor;
  categories: PerfumeCategory[];
  variants: PerfumeVariant[];
}

export interface PerfumeDetail {
  id: string;
  name: string;
  brand: string;
  notes: string[];
  type: PerfumeTypeEnum;
  assetUrl: string;
  season: string;
  sillage: string;
  longevity: string;
  gender: string;
  description: string;
  serialNumber: number;
  warrantyStatus: number;
  distributor: PerfumeDistributor;
  categories: PerfumeCategory[];
  variants: PerfumeVariant[];
}
