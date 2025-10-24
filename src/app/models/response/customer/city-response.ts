import { District } from "./district-response";

export interface City {
  id: number;    
  name: string; 
  districts: District[];
  
 
}