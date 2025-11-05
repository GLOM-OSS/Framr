import {
  Builder,
  Parser,
  convertableToString as ConvertableToString,
} from 'xml2js';
import { FramrServiceError } from '../errors';
import { normalize } from 'xml2js/lib/processors';

export class XmlIO {
  private readonly _xmlParser: Parser;
  public get xmlParser(): Parser {
    return this._xmlParser;
  }

  private readonly _xmlBuilder: Builder;
  public get xmlBuilder(): Builder {
    return this._xmlBuilder;
  }

  constructor() {
    this._xmlParser = new Parser({
      normalize: true,
      normalizeTags: true,
      emptyTag: () => undefined,
      explicitRoot: false,
      mergeAttrs: true,
      explicitArray: false,
      attrNameProcessors: [normalize],
    });
    this._xmlBuilder = new Builder({});
  }

  /**
   * Parse XML from file
   * @param file
   * @returns
   */
  async parseFromFile<T extends object>(file: File): Promise<T> {
    try {
      const xmlString = await this.readFileAsText(file);
      return (await this.parse(xmlString)) as T;
    } catch (error) {
      throw new FramrServiceError(
        `Error reading or parsing XML file: ${error}`
      );
    }
  }

  /**
   * Build XML and download as file
   * @param obj
   * @param fileName
   */
  buildAndDownload(obj: object, fileName: string = 'export.xml'): void {
    try {
      const xmlString = this.xmlBuilder.buildObject(obj);
      this.downloadFile(xmlString, fileName);
    } catch (error) {
      throw new FramrServiceError(`Error building XML: ${error}`);
    }
  }

  /**
   * Dowlaod data file
   * @param dataString
   * @param fileName
   */
  downloadFile(dataString: string, fileName: string): void {
    const blob = new Blob([dataString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  /**
   * Read file as text
   * @param file imported file
   * @returns
   */
  private async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result.toString());
        } else {
          reject(new FramrServiceError('Failed to read file'));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

  /**
   * Parse XML string
   */
  private async parse(xmlString: ConvertableToString): Promise<object> {
    try {
      return await this.xmlParser.parseStringPromise(xmlString);
    } catch (error) {
      throw new FramrServiceError(`Error parsing XML: ${error}`);
    }
  }
}
