export interface XmlService {
  name: string;
  interact: string;
  dpoint: XmlDataPoint[];
}

export interface XmlDataPoint {
  name: string;
  mtf?: string;
  gtf?: string;
  rot?: string;
  util?: string;
}

export interface XmlTool {
  name: string;
  version: string;
  long: string;
  mandatory: {
    dpoint: XmlDataPoint[];
  };
  services: {
    service: XmlService[];
  };
}

export interface XmlInfo {
  version: string;
  date: string;
  name: string;
}

/**
 * TypeScriptinterface was defined based on the structure of the converted JavaScript object
 * from sample-file.xml
 */
export interface XmlData {
  info: XmlInfo;
  tool: XmlTool[];
}