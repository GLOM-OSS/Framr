import fs from 'fs';
import path from 'path';
import { XmlIO } from './XmlIO';
describe('XmlIO', () => {
  const xmlIO = new XmlIO();

  it('Sould parse xml file', async () => {
    const bufferFile = fs.readFileSync(
      path.join(__dirname, './sample-file.xml')
    );
    // Create a Blob from the buffer
    const blob = new Blob([bufferFile]);

    // Create a File from the Blob
    const file = new File([blob], __filename);

    await expect(xmlIO.parseFromFile(file)).resolves.not.toThrow();
  });
});
