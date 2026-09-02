class MetaGlassesConverter extends ImageProcessor {
  constructor() {
    super();
    this.targetWidth = 3024;
    this.targetHeight = 4032;
    this.deviceMake = 'Meta AI';
    this.deviceModel = 'Ray-Ban Meta Smart Glasses 2';
  }

  buildMetaExif(originalDataUrl) {
    let exif;
    try {
      exif = piexif.load(originalDataUrl);
    } catch {
      exif = { '0th': {}, 'Exif': {}, 'GPS': {}, '1st': {}, 'thumbnail': null };
    }

    // Wipe GPS and system telemetry
    exif['GPS'] = {};
    delete exif['0th'][piexif.ImageIFD.Software];
    delete exif['0th'][piexif.ImageIFD.HostComputer];

    // Wipe original lens hardware signatures
    delete exif['Exif'][piexif.ExifIFD.MakerNote];
    delete exif['Exif'][piexif.ExifIFD.LensMake];
    delete exif['Exif'][piexif.ExifIFD.LensModel];
    delete exif['Exif'][piexif.ExifIFD.LensSpecification];

    // Set Ray-Ban Meta signatures
    exif['0th'][piexif.ImageIFD.Make] = this.deviceMake;
    exif['0th'][piexif.ImageIFD.Model] = this.deviceModel;
    exif['0th'][piexif.ImageIFD.Orientation] = 1;
    exif['Exif'][piexif.ExifIFD.ColorSpace] = 1;
    exif['Exif'][piexif.ExifIFD.PixelXDimension] = this.targetWidth;
    exif['Exif'][piexif.ExifIFD.PixelYDimension] = this.targetHeight;

    return exif;
  }

  async process(sourceDataUrl) {
    const orientation = this.getOrientation(sourceDataUrl);
    const canvasDataUrl = await this.resizeAndNormalize(
      sourceDataUrl,
      this.targetWidth,
      this.targetHeight,
      orientation
    );

    const exifObject = this.buildMetaExif(sourceDataUrl);
    const exifBytes = piexif.dump(exifObject);
    const finalDataUrl = piexif.insert(exifBytes, canvasDataUrl);
    const base64Data = finalDataUrl.split(',')[1];

    return {
      dataUrl: finalDataUrl,
      base64: base64Data
    };
  }
}